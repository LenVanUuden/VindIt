-- =====================================================================
-- Winex database v1
-- Plak dit volledige bestand in Supabase → SQL Editor → New query → Run.
-- Het script is veilig om opnieuw te draaien.
-- =====================================================================

-- ---------- Tabellen ----------

-- Per verzamelaar: weergavenaam en de tellers voor de garantie.
create table if not exists public.collectors (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  display_name          text,
  scans_since_superrare int  not null default 0,
  scans_since_ultra     int  not null default 0,
  created_at            timestamptz not null default now()
);

-- Eén rij per unieke wijn (producent + cuvée). Gedeeld door alle verzamelaars.
create table if not exists public.wines (
  id               uuid primary key default gen_random_uuid(),
  wine_key         text not null unique,          -- lower(maker) | lower(naam)
  naam             text not null,
  maker            text not null default '',
  jaar             int,
  druif            text,
  stijl            text,
  regio            text not null,
  land             text,
  variant          smallint not null default 0,    -- welk regioplaatje (0-3)
  is_icon          boolean  not null default false, -- vaste lijst iconische wijnen
  first_scanned_by uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- De kaarten in iemands album. Eén kaart per wijn per verzamelaar.
create table if not exists public.cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  wine_id    uuid not null references public.wines(id) on delete restrict,
  tier       text not null check (tier in ('common','rare','superrare','ultra','icon')),
  created_at timestamptz not null default now(),
  unique (user_id, wine_id)
);
create index if not exists cards_user_created on public.cards (user_id, created_at);

-- ---------- Beveiliging ----------
-- De app mag alleen LEZEN. Kaarten en wijnen ontstaan uitsluitend via scan_wine(),
-- zodat niemand zelf een Ultra kan aanmaken of de dagelijkse limiet kan omzeilen.

alter table public.collectors enable row level security;
alter table public.wines      enable row level security;
alter table public.cards      enable row level security;

drop policy if exists "eigen profiel lezen" on public.collectors;
create policy "eigen profiel lezen" on public.collectors
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "wijnen lezen" on public.wines;
create policy "wijnen lezen" on public.wines
  for select to authenticated using (true);

drop policy if exists "eigen kaarten lezen" on public.cards;
create policy "eigen kaarten lezen" on public.cards
  for select to authenticated using (user_id = auth.uid());

revoke all on public.collectors, public.wines, public.cards from anon, authenticated;
grant select on public.collectors, public.wines, public.cards to authenticated;

-- ---------- Scannen ----------
-- Regels: max 3 NIEUWE kaarten per kalenderdag (Nederlandse tijd), dubbele wijn levert
-- niets op en telt niet mee, klasse wordt hier getrokken (76/18/5/1), Icon hangt af van
-- de wijn, garantie: Super Rare binnen 25 scans, Ultra binnen 100.

create or replace function public.scan_wine(p_wine jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_limit constant int := 3;
  v_key   text;
  v_wine  public.wines;
  v_card  public.cards;
  v_col   public.collectors;
  v_today int;
  v_tier  text;
  v_roll  double precision;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if coalesce(trim(p_wine->>'naam'), '') = '' or coalesce(trim(p_wine->>'regio'), '') = '' then
    raise exception 'invalid_wine' using errcode = '22023';
  end if;

  -- Eén scan tegelijk per verzamelaar, zodat snel dubbeltikken de limiet niet omzeilt.
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  v_key := lower(trim(coalesce(p_wine->>'maker', ''))) || '|' || lower(trim(p_wine->>'naam'));

  insert into public.collectors (user_id) values (v_uid) on conflict do nothing;
  select * into v_col from public.collectors where user_id = v_uid for update;

  -- Dubbele wijn?
  select * into v_wine from public.wines where wine_key = v_key;
  if v_wine.id is not null then
    select * into v_card from public.cards where user_id = v_uid and wine_id = v_wine.id;
    if v_card.id is not null then
      return jsonb_build_object('status', 'duplicate', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine));
    end if;
  end if;

  -- Dagelijkse limiet
  select count(*) into v_today
    from public.cards
   where user_id = v_uid
     and (created_at at time zone 'Europe/Amsterdam')::date = (now() at time zone 'Europe/Amsterdam')::date;
  if v_today >= v_limit then
    return jsonb_build_object('status', 'limit', 'scans_today', v_today);
  end if;

  -- Nieuwe wijn vastleggen (de eerste scanner wordt 'Eerste Ontdekker')
  if v_wine.id is null then
    insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, variant, first_scanned_by)
    values (
      v_key,
      trim(p_wine->>'naam'),
      trim(coalesce(p_wine->>'maker', '')),
      case when coalesce(p_wine->>'jaar', '') ~ '^\d{4}$' then (p_wine->>'jaar')::int end,
      nullif(trim(coalesce(p_wine->>'druif', '')), ''),
      nullif(trim(coalesce(p_wine->>'stijl', '')), ''),
      trim(p_wine->>'regio'),
      nullif(trim(coalesce(p_wine->>'land', '')), ''),
      (abs(hashtext(v_key)) % 4),
      v_uid
    )
    on conflict (wine_key) do update set wine_key = excluded.wine_key
    returning * into v_wine;
  end if;

  -- Klasse trekken
  if v_wine.is_icon then
    v_tier := 'icon';
  elsif v_col.scans_since_ultra >= 99 then
    v_tier := 'ultra';
  elsif v_col.scans_since_superrare >= 24 then
    v_tier := 'superrare';
  else
    v_roll := random();
    v_tier := case
      when v_roll < 0.01 then 'ultra'
      when v_roll < 0.06 then 'superrare'
      when v_roll < 0.24 then 'rare'
      else 'common'
    end;
  end if;

  insert into public.cards (user_id, wine_id, tier)
  values (v_uid, v_wine.id, v_tier)
  returning * into v_card;

  update public.collectors set
    scans_since_ultra     = case when v_tier = 'ultra' then 0 else scans_since_ultra + 1 end,
    scans_since_superrare = case when v_tier in ('superrare', 'ultra') then 0 else scans_since_superrare + 1 end
  where user_id = v_uid;

  return jsonb_build_object(
    'status', 'new',
    'card', to_jsonb(v_card),
    'wine', to_jsonb(v_wine),
    'scans_today', v_today + 1
  );
end;
$$;

revoke all on function public.scan_wine(jsonb) from public, anon;
grant execute on function public.scan_wine(jsonb) to authenticated;

-- ---------- Startlijst Icon-wijnen (fictieve demowijnen) ----------
insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, variant, is_icon)
values
  ('pauillac|château du pin doré', 'Château du Pin Doré', 'Pauillac', 2016, 'Cabernet Sauvignon, Merlot', 'Rood, krachtig', 'bordeaux', 'Frankrijk', 0, true),
  ('toscana igt|sassorosso',       'Sassorosso',          'Toscana IGT', 2019, 'Cabernet Sauvignon, Merlot', 'Rood, vol', 'toscane', 'Italië', 1, true)
on conflict (wine_key) do update set is_icon = true;
