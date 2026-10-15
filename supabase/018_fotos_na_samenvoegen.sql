-- =====================================================================
-- Vined It database – migratie 018: etiketfoto's na samenvoegen
-- Draai NA 017. Plak in Supabase → SQL Editor → Run. Veilig om opnieuw te draaien.
--
-- Bij het samenvoegen van dubbele wijnen bleven de etiketfoto's onder het oude
-- wijn-id staan. Daardoor tekende "Etiket opnieuw tekenen" vanaf de verkeerde
-- (oudere) foto en miste de andere verzamelaar zijn foto.
-- Nu onthoudt elke samenvoeging welke wijn verdween. De Edge Function reassess
-- verplaatst die foto's bij de eerstvolgende tekenactie naar de bewaarde wijn,
-- en tekent voortaan vanaf de nieuwste foto.
-- Voor samenvoegingen van vóór deze migratie (Rozier) zoekt dit script de
-- achtergebleven foto op.
-- =====================================================================

-- ---------- Twee wijnen samenvoegen (alleen voor de beheerder in de SQL Editor) ----------
create table if not exists public.wine_merges (
  id         bigserial primary key,
  kept_id    uuid not null,
  kept_naam  text,
  dropped_naam text,
  cards_moved int,
  merged_at  timestamptz not null default now()
);
alter table public.wine_merges add column if not exists dropped_id uuid;
alter table public.wine_merges add column if not exists photos_moved boolean not null default false;
alter table public.wine_merges enable row level security;

create or replace function public.merge_wine(p_keep uuid, p_drop uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  k public.wines; d public.wines; c record; kc public.cards;
  v_tier text; v_naam text; v_moved int := 0;
  rk int; rd int;
begin
  select * into k from public.wines where id = p_keep for update;
  select * into d from public.wines where id = p_drop for update;
  if k.id is null or d.id is null or k.id = d.id then return; end if;

  v_tier := case when k.is_icon or d.is_icon then 'icon' else coalesce(k.tier_override, k.tier, d.tier_override, d.tier) end;

  for c in select * from public.cards where wine_id = d.id loop
    select * into kc from public.cards where wine_id = k.id and user_id = c.user_id;
    if kc.id is null then
      update public.cards set wine_id = k.id, tier = coalesce(v_tier, tier) where id = c.id;
    else
      -- Zelfde verzamelaar had beide: één kaart houden, flessen optellen, hoogste klasse
      rk := array_position(array['common','rare','superrare','ultra','icon'], kc.tier);
      rd := array_position(array['common','rare','superrare','ultra','icon'], c.tier);
      update public.cards set
        bottles  = coalesce(kc.bottles, 1) + coalesce(c.bottles, 1),
        tier     = coalesce(v_tier, case when coalesce(rd, 0) > coalesce(rk, 0) then c.tier else kc.tier end),
        full_art = kc.full_art or c.full_art,
        memo     = coalesce(kc.memo, c.memo),
        created_at = least(kc.created_at, c.created_at)
       where id = kc.id;
      delete from public.cards where id = c.id;
    end if;
    v_moved := v_moved + 1;
  end loop;
  update public.retries set wine_id = k.id where wine_id = d.id;

  -- Etiket: het getekende etiket van de jongste wijn (de nieuwste tekening) wint;
  -- een vastgezet etiket blijft altijd staan
  if not coalesce((k.label_style->>'locked')::boolean, false)
     and d.label_style is not null
     and (d.label_style->>'v' = '2' or k.label_style is null
          or coalesce((d.label_style->>'locked')::boolean, false)) then
    k.label_style := d.label_style;
  end if;
  -- Naam: de vollere naam ("Château Rozier" boven "Rozier")
  v_naam := case when k.is_icon then k.naam when d.is_icon then d.naam
                 when length(d.naam) > length(k.naam) then d.naam else k.naam end;

  delete from public.wines where id = d.id;
  update public.wines set
    naam = v_naam,
    wine_key = lower(trim(coalesce(maker, ''))) || '|' || lower(trim(v_naam)),
    label_style = k.label_style,
    signals = coalesce(signals, d.signals),
    tier = coalesce(tier, d.tier),
    tier_reason = coalesce(tier_reason, d.tier_reason),
    first_scanned_by = coalesce(first_scanned_by, d.first_scanned_by),
    jaar = coalesce(jaar, d.jaar),
    is_icon = coalesce(is_icon, false) or coalesce(d.is_icon, false)
   where id = k.id
     and not exists (select 1 from public.wines x where x.id <> k.id
                      and x.wine_key = lower(trim(coalesce(k.maker, ''))) || '|' || lower(trim(v_naam)));
  -- Lukte de naam niet (sleutel bestaat al)? Dan in elk geval het etiket overnemen
  update public.wines set label_style = k.label_style where id = k.id and label_style is distinct from k.label_style;

  insert into public.wine_merges (kept_id, kept_naam, dropped_naam, cards_moved, dropped_id)
  values (k.id, v_naam, k.naam || ' + ' || d.naam, v_moved, d.id);
end;
$$;
revoke all on function public.merge_wine(uuid, uuid) from public, anon, authenticated;


-- ---------- Oude samenvoegingen: achtergebleven foto opzoeken ----------
update public.wine_merges m
   set dropped_id = (
     select (regexp_match(o.name, '/([0-9a-f-]{36})\.label\.jpg$'))[1]::uuid
       from storage.objects o
       join public.cards c on c.wine_id = m.kept_id and o.name like c.user_id::text || '/%.label.jpg'
      where o.bucket_id = 'card-art'
        and o.created_at <= m.merged_at
        and not exists (select 1 from public.wines x
                         where x.id = (regexp_match(o.name, '/([0-9a-f-]{36})\.label\.jpg$'))[1]::uuid)
      order by o.created_at desc
      limit 1)
 where m.dropped_id is null;
update public.wine_merges set photos_moved = true where dropped_id is null;

-- Controle: bij Rozier hoort nu een dropped_id te staan en photos_moved = false
select kept_naam, dropped_naam, dropped_id, photos_moved from public.wine_merges order by merged_at desc;
