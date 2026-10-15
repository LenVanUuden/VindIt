-- =====================================================================
-- Vined It database – migratie 017: dezelfde wijn niet dubbel
-- Draai NA 016. Plak in Supabase → SQL Editor → Run. Veilig om opnieuw te draaien.
--
-- Probleem: de herkenning leest dezelfde fles soms net anders ("Rozier" vs
-- "Château Rozier"). Dan maakte de app een tweede wijn aan, met een eigen
-- klasse en een eigen etiket.
-- Nu: bij een nieuwe scan zoekt de app eerst naar een bestaande wijn met
-- dezelfde naam zonder "Château/Domaine/…", accenten, jaartal en leestekens,
-- én dezelfde maker. Gevonden? Dan wordt die bestaande wijn gebruikt.
-- Is de maker onbekend, dan wordt er nooit samengevoegd (anders zouden twee
-- verschillende "Reserva"s uit Rioja één wijn worden).
-- Daarnaast: bestaande dubbele wijnen worden samengevoegd (de oudste blijft;
-- kaarten en een nieuw getekend etiket gaan mee). Onderaan zie je wat er is
-- samengevoegd.
-- Legendes krijgen bij het scannen geen Full Art-loting meer.
-- =====================================================================

-- ---------- Naam gelijkmaken om te vergelijken ----------
create or replace function public.wine_norm(p text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          replace(replace(translate(lower(coalesce(p, '')),
            'àáâãäåèéêëìíîïòóôõöøùúûüñçýÿšž''’`´',
            'aaaaaaeeeeiiiioooooouuuuncyysz    '), 'œ', 'oe'), 'æ', 'ae'),
          '\m(18|19|20)\d\d\M', ' ', 'g'),                       -- jaartal
        '[^a-z0-9]+', ' ', 'g'),                                  -- leestekens
      '\m(chateau|chateaux|ch|domaine|domaines|dom|weingut|tenuta|bodega|bodegas|castello|cantina|maison|the|le|la|les|l|de|du|des|d|di|del|della|von|van|der|y|et|and|winery|estate|wines)\M', ' ', 'g'),
    '\s+', ' ', 'g'));
$$;

create index if not exists wines_norm_naam on public.wines (public.wine_norm(naam));

-- ---------- Bestaat deze wijn al onder een iets andere naam? ----------
create or replace function public.find_same_wine(p_wine jsonb)
returns public.wines
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_n text := public.wine_norm(p_wine->>'naam');
  v_m text := public.wine_norm(p_wine->>'maker');
  v_c text := lower(trim(coalesce(p_wine->>'color', '')));
  v_w public.wines;
begin
  if length(v_n) < 3 then return null; end if;
  select * into v_w from public.wines w
   where public.wine_norm(w.naam) = v_n
     and v_m <> '' and public.wine_norm(w.maker) = v_m
     and (v_c = '' or coalesce(w.color, '') = '' or lower(w.color) = v_c)
   order by w.created_at
   limit 1;
  return v_w;
end;
$$;
revoke all on function public.find_same_wine(jsonb) from public, anon, authenticated;

-- ---------- Scannen: eerst kijken of de wijn al bestaat ----------
create or replace function public.scan_wine(p_wine jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_limit int := 3;
  v_key   text;
  v_wine  public.wines;
  v_card  public.cards;
  v_col   public.collectors;
  v_today int;
  v_tier  text;
  v_t     jsonb;
  v_roll  double precision;
  v_sig   jsonb := p_wine->'signals';
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if coalesce(trim(p_wine->>'naam'), '') = '' or coalesce(trim(p_wine->>'regio'), '') = '' then
    raise exception 'invalid_wine' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  select coalesce((select daily_limit from public.collectors where user_id = v_uid), 3) into v_limit;

  v_key := lower(trim(coalesce(p_wine->>'maker', ''))) || '|' || lower(trim(p_wine->>'naam'));

  insert into public.collectors (user_id) values (v_uid) on conflict do nothing;
  select * into v_col from public.collectors where user_id = v_uid for update;

  select * into v_wine from public.wines where wine_key = v_key;
  -- Geen exacte match? Kijk of dezelfde wijn al onder een iets andere naam bestaat
  -- ("Rozier" vs "Château Rozier"). Dan gebruiken we die bestaande wijn.
  if v_wine.id is null then
    v_wine := public.find_same_wine(p_wine);
  end if;
  if v_wine.id is not null then
    select * into v_card from public.cards where user_id = v_uid and wine_id = v_wine.id;
    if v_card.id is not null then
      return jsonb_build_object('status', 'duplicate', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine));
    end if;
  end if;

  v_today := public.scans_today();
  if v_today >= v_limit then
    return jsonb_build_object('status', 'limit', 'scans_today', v_today);
  end if;

  if v_wine.id is null then
    insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags, variant, first_scanned_by)
    values (
      v_key,
      trim(p_wine->>'naam'),
      trim(coalesce(p_wine->>'maker', '')),
      case when coalesce(p_wine->>'jaar', '') ~ '^\d{4}$' then (p_wine->>'jaar')::int end,
      nullif(trim(coalesce(p_wine->>'druif', '')), ''),
      nullif(trim(coalesce(p_wine->>'stijl', '')), ''),
      trim(p_wine->>'regio'),
      nullif(trim(coalesce(p_wine->>'land', '')), ''),
      nullif(trim(coalesce(p_wine->>'app', '')), ''),
      nullif(trim(coalesce(p_wine->>'grape', '')), ''),
      nullif(trim(coalesce(p_wine->>'style', '')), ''),
      nullif(trim(coalesce(p_wine->>'color', '')), ''),
      coalesce((select array_agg(lower(t)) from jsonb_array_elements_text(coalesce(p_wine->'tags', '[]'::jsonb)) t), '{}'),
      (abs(hashtext(v_key)) % 4),
      v_uid
    )
    on conflict (wine_key) do update set wine_key = excluded.wine_key
    returning * into v_wine;
  elsif v_wine.first_scanned_by is null then
    update public.wines set first_scanned_by = v_uid where id = v_wine.id returning * into v_wine;
  end if;

  -- Klasse van de wijn vastleggen (eenmalig, of als er nog geen signalen waren)
  if v_sig is not null and jsonb_typeof(v_sig) = 'object' and v_wine.signals is null then
    v_t := public.wine_tier(v_sig, v_wine.jaar, v_wine.color, coalesce(v_wine.is_icon, false));
    update public.wines set signals = v_sig, tier = v_t->>'tier', tier_reason = v_t->>'reason'
     where id = v_wine.id returning * into v_wine;
  end if;

  if v_wine.is_icon then
    v_tier := 'icon';
  elsif coalesce(v_wine.tier_override, v_wine.tier) is not null then
    v_tier := coalesce(v_wine.tier_override, v_wine.tier);
  else
    -- Geen signalen (bijvoorbeeld demowijnen in de testmodus): oude loting als terugval
    v_roll := random();
    v_tier := case when v_roll < 0.01 then 'ultra' when v_roll < 0.06 then 'superrare' when v_roll < 0.24 then 'rare' else 'common' end;
  end if;

  insert into public.cards (user_id, wine_id, tier, full_art)
  values (v_uid, v_wine.id, v_tier, v_tier <> 'icon' and random() < 0.05)
  returning * into v_card;

  return jsonb_build_object('status', 'new', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine), 'scans_today', v_today + 1);
end;
$$;
revoke all on function public.scan_wine(jsonb) from public, anon;
grant execute on function public.scan_wine(jsonb) to authenticated;

revoke all on function public.scan_wine(jsonb) from public, anon;
grant execute on function public.scan_wine(jsonb) to authenticated;

-- ---------- Twee wijnen samenvoegen (alleen voor de beheerder in de SQL Editor) ----------
create table if not exists public.wine_merges (
  id         bigserial primary key,
  kept_id    uuid not null,
  kept_naam  text,
  dropped_naam text,
  cards_moved int,
  merged_at  timestamptz not null default now()
);
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

  -- Etiket: het nieuw getekende (v2) wint, een vastgezet etiket blijft altijd
  if not coalesce((k.label_style->>'locked')::boolean, false)
     and coalesce(k.label_style->>'v', '') <> '2'
     and (d.label_style is not null and (d.label_style->>'v' = '2' or k.label_style is null)) then
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

  insert into public.wine_merges (kept_id, kept_naam, dropped_naam, cards_moved)
  values (k.id, v_naam, k.naam || ' + ' || d.naam, v_moved);
end;
$$;
revoke all on function public.merge_wine(uuid, uuid) from public, anon, authenticated;

-- ---------- Bestaande dubbelen nu samenvoegen ----------
do $$
declare p record;
begin
  for p in
    select a.id as keep, b.id as drop
      from public.wines a
      join public.wines b
        on public.wine_norm(a.naam) = public.wine_norm(b.naam)
       and (a.created_at, a.id) < (b.created_at, b.id)
     where length(public.wine_norm(a.naam)) >= 3
       and public.wine_norm(a.maker) <> '' and public.wine_norm(a.maker) = public.wine_norm(b.maker)
       and (coalesce(a.color, '') = '' or coalesce(b.color, '') = '' or lower(a.color) = lower(b.color))
     order by b.created_at
  loop
    if exists (select 1 from public.wines where id = p.keep)
       and exists (select 1 from public.wines where id = p.drop) then
      perform public.merge_wine(p.keep, p.drop);
    end if;
  end loop;
end $$;

-- Wat is er samengevoegd?
select kept_naam as "bewaard als", dropped_naam as "samengevoegd uit", cards_moved as "kaarten verhuisd", merged_at as "wanneer"
  from public.wine_merges order by merged_at desc;
