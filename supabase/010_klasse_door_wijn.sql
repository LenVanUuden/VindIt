-- =====================================================================
-- Vined It database – migratie 010: de wijn bepaalt de klasse
-- Draai NA 009_herinneringen_top10.sql. Plak in Supabase → SQL Editor → Run.
-- Veilig om opnieuw te draaien.
--
-- - De klasse wordt per wijn één keer bepaald uit signalen die Claude bij het
--   lezen van het etiket inschat (prijs, classificatie, maker, oplage,
--   zeldzaamheid in NL, jaargang, leeftijd, grootformaat) en bewaard.
--   Iedereen krijgt voor dezelfde wijn dezelfde klasse.
-- - Puur geluk: ±5% kans op een Full Art-versie van de kaart.
-- - Een volgende fles van dezelfde wijn telt als fles (×2, ×3…) en geeft
--   opnieuw kans op een Full Art.
-- =====================================================================

alter table public.wines add column if not exists signals       jsonb;
alter table public.wines add column if not exists tier          text;
alter table public.wines add column if not exists tier_reason   text;
alter table public.wines add column if not exists tier_override text;
alter table public.wines drop constraint if exists wines_tier_check;
alter table public.wines add constraint wines_tier_check check (tier is null or tier in ('common','rare','superrare','ultra','icon'));
alter table public.wines drop constraint if exists wines_tier_override_check;
alter table public.wines add constraint wines_tier_override_check check (tier_override is null or tier_override in ('common','rare','superrare','ultra','icon'));

alter table public.cards add column if not exists full_art boolean not null default false;
alter table public.cards add column if not exists bottles  int     not null default 1;

-- ---------- De formule ----------
create or replace function public.wine_tier(p_s jsonb, p_jaar int, p_color text, p_is_icon boolean)
returns jsonb
language plpgsql
stable
as $$
declare
  lo numeric := nullif(p_s->>'price_eur_low','')::numeric;
  hi numeric := nullif(p_s->>'price_eur_high','')::numeric;
  p  numeric;
  pp numeric; cl numeric; fa numeric; pr numeric; ra numeric; adj numeric := 0;
  total numeric;
  tier text;
  why text[] := '{}';
  age int;
  vq text := coalesce(p_s->>'vintage_quality','onbekend');
begin
  if lo is not null or hi is not null then p := (coalesce(lo,hi) + coalesce(hi,lo)) / 2; end if;
  pp := case when p is null then 0.25 when p < 10 then 0 when p < 15 then 0.5 when p < 25 then 1 when p < 45 then 1.25
             when p < 80 then 1.5 when p < 150 then 2 when p < 300 then 2.5 else 3 end;
  cl := case p_s->>'classification' when 'top' then 0.75 when 'premium' then 0.5 when 'kwaliteit' then 0.25 else 0 end;
  fa := case p_s->>'producer_fame' when 'wereldberoemd' then 0.4 when 'gerenommeerd' then 0.25 when 'merk' then -0.25 else 0 end;
  pr := case p_s->>'production' when 'zeer klein' then 0.5 when 'klein' then 0.25 when 'massa' then -0.25 else 0 end;
  ra := case p_s->>'rarity_nl' when 'zeldzaam' then 0.75 when 'ongewoon' then 0.5 else 0 end;

  adj := adj + case vq when 'top' then 0.5 when 'goed' then 0.25 when 'slecht' then -0.25 else 0 end;
  if p_jaar is not null then
    age := extract(year from now())::int - p_jaar;
    if age >= (case when p_color = 'wit' then 10 else 15 end) then adj := adj + 0.25; end if;
  end if;
  if coalesce((p_s->>'large_format')::boolean, false) then adj := adj + 0.25; end if;
  adj := greatest(-0.5, least(0.75, adj));

  total := pp + cl + fa + pr + ra + adj;
  tier := case when total >= 3.25 then 'ultra' when total >= 2 then 'superrare' when total >= 1 then 'rare' else 'common' end;
  if p_is_icon or (coalesce((p_s->>'iconic')::boolean, false) and coalesce(p, 0) >= 300) then tier := 'icon'; end if;

  -- Uitleg in gewone taal
  if p is not null then why := why || ('±€' || (case when p < 100 then round(p) else round(p / 10) * 10 end)::text); end if;
  if p_s->>'producer_fame' = 'wereldberoemd' then why := why || 'wereldberoemd huis'::text;
  elsif p_s->>'producer_fame' = 'gerenommeerd' then why := why || 'gerenommeerde maker'::text; end if;
  if p_s->>'classification' = 'top' then why := why || 'topclassificatie'::text;
  elsif p_s->>'classification' = 'premium' then why := why || 'cru/reserva-niveau'::text; end if;
  if p_s->>'rarity_nl' = 'zeldzaam' then why := why || 'zeldzaam in Nederland'::text;
  elsif p_s->>'rarity_nl' = 'ongewoon' then why := why || 'ongewoon in Nederland'::text; end if;
  if vq = 'top' then why := why || ('topjaar' || coalesce(' ' || p_jaar, ''));
  elsif vq = 'goed' then why := why || ('goed jaar' || coalesce(' ' || p_jaar, ''));
  elsif vq = 'slecht' then why := why || ('zwak jaar' || coalesce(' ' || p_jaar, '')); end if;
  if p_s->>'production' in ('klein', 'zeer klein') then why := why || 'kleine oplage'::text; end if;
  if age is not null and age >= (case when p_color = 'wit' then 10 else 15 end) then why := why || 'oude fles'::text; end if;
  if coalesce((p_s->>'large_format')::boolean, false) then why := why || 'grootformaat'::text; end if;
  if p_s->>'producer_fame' = 'merk' and tier = 'common' then why := why || 'bekend merk, ruim verkrijgbaar'::text; end if;

  return jsonb_build_object('tier', tier, 'reason', array_to_string(why[1:4], ' · '), 'score', round(total, 2));
end;
$$;

-- ---------- Signalen opslaan en klasse doorvoeren (alleen de server) ----------
create or replace function public.set_wine_signals(p_wine uuid, p_signals jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_w public.wines;
  v_t jsonb;
begin
  select * into v_w from public.wines where id = p_wine;
  if v_w.id is null then raise exception 'no_wine'; end if;
  v_t := public.wine_tier(p_signals, v_w.jaar, v_w.color, coalesce(v_w.is_icon, false));
  update public.wines set signals = p_signals, tier = v_t->>'tier', tier_reason = v_t->>'reason' where id = p_wine;
  update public.cards set tier = coalesce(v_w.tier_override, v_t->>'tier') where wine_id = p_wine;
  return v_t;
end;
$$;
revoke all on function public.set_wine_signals(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.set_wine_signals(uuid, jsonb) to service_role;

-- Handmatig corrigeren (draai los): klasse van één wijn vastzetten, of null om de formule weer te volgen.
-- update public.wines set tier_override = 'superrare' where naam ilike '%voorbeeld%';
-- update public.cards c set tier = coalesce(w.tier_override, w.tier) from public.wines w where c.wine_id = w.id and w.naam ilike '%voorbeeld%';

-- ---------- Scannen: klasse van de wijn, Full Art door geluk ----------
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
  values (v_uid, v_wine.id, v_tier, random() < 0.05)
  returning * into v_card;

  return jsonb_build_object('status', 'new', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine), 'scans_today', v_today + 1);
end;
$$;
revoke all on function public.scan_wine(jsonb) from public, anon;
grant execute on function public.scan_wine(jsonb) to authenticated;

-- ---------- Nog een fles van dezelfde wijn: ×2 en opnieuw kans op Full Art ----------
create or replace function public.retry_wine(p_wine_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_limit int := 3;
  v_card  public.cards;
  v_wine  public.wines;
  v_today int;
  v_fa    boolean;
  v_new   boolean := false;
  v_day   date := (now() at time zone 'Europe/Amsterdam')::date;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  select coalesce((select daily_limit from public.collectors where user_id = v_uid), 3) into v_limit;

  select * into v_card from public.cards where user_id = v_uid and wine_id = p_wine_id for update;
  if v_card.id is null then
    raise exception 'no_card' using errcode = '22023';
  end if;
  select * into v_wine from public.wines where id = p_wine_id;

  -- Eén fles per wijn per dag
  if (v_card.created_at at time zone 'Europe/Amsterdam')::date = v_day
     or exists (select 1 from public.retries
                 where user_id = v_uid and wine_id = p_wine_id
                   and (created_at at time zone 'Europe/Amsterdam')::date = v_day) then
    return jsonb_build_object('status', 'cooldown', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine));
  end if;

  v_today := public.scans_today();
  if v_today >= v_limit then
    return jsonb_build_object('status', 'limit', 'scans_today', v_today);
  end if;

  v_fa := random() < 0.05;
  v_new := v_fa and not v_card.full_art;
  update public.cards
     set bottles = bottles + 1,
         full_art = full_art or v_fa
   where id = v_card.id
  returning * into v_card;
  insert into public.retries (user_id, wine_id, old_tier, rolled_tier, upgraded)
  values (v_uid, p_wine_id, v_card.tier, case when v_fa then 'fullart' else 'fles' end, v_new);

  return jsonb_build_object('status', 'bottle', 'fullart', v_new, 'bottles', v_card.bottles,
    'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine), 'scans_today', v_today + 1);
end;
$$;
revoke all on function public.retry_wine(uuid) from public, anon;
grant execute on function public.retry_wine(uuid) to authenticated;

-- Overzicht (draai los): klassen per wijn
-- select naam, maker, jaar, tier, tier_override, tier_reason, signals from public.wines order by created_at desc;
