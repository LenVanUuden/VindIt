-- =====================================================================
-- Vin’d It database – migratie 006: dagelimiet per account (testers)
-- Draai NA 005_herproeven_wachttijd.sql. Plak in Supabase → SQL Editor → Run.
-- Veilig om opnieuw te draaien.
--
-- Iedereen houdt standaard 3 scans per dag. Testers kun je een hogere limiet geven
-- met het fragment onderaan dit bestand.
-- =====================================================================

alter table public.collectors add column if not exists daily_limit int not null default 3
  check (daily_limit between 1 and 500);

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
  v_roll  double precision;
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
    -- Vooraf ingevoerde wijn (zoals een Icon): de eerste echte scanner wordt Eerste Ontdekker.
    update public.wines set first_scanned_by = v_uid where id = v_wine.id returning * into v_wine;
  end if;

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

  return jsonb_build_object('status', 'new', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine), 'scans_today', v_today + 1);
end;
$$;

revoke all on function public.scan_wine(jsonb) from public, anon;
grant execute on function public.scan_wine(jsonb) to authenticated;



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
  v_col   public.collectors;
  v_today int;
  v_tier  text;
  v_rank  jsonb := '{"common":0,"rare":1,"superrare":2,"ultra":3,"icon":4}';
  v_up    boolean;
  v_old   text;
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
  if v_card.tier = 'icon' or v_wine.is_icon then
    return jsonb_build_object('status', 'icon', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine));
  end if;

  -- Wachttijd: één poging per wijn per dag
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

  insert into public.collectors (user_id) values (v_uid) on conflict do nothing;
  select * into v_col from public.collectors where user_id = v_uid for update;
  v_tier := public.draw_tier(v_col);
  v_old  := v_card.tier;
  v_up   := (v_rank->>v_tier)::int > (v_rank->>v_old)::int;

  if v_up then
    update public.cards set tier = v_tier where id = v_card.id returning * into v_card;
  end if;
  insert into public.retries (user_id, wine_id, old_tier, rolled_tier, upgraded) values (v_uid, p_wine_id, v_old, v_tier, v_up);

  update public.collectors set
    scans_since_ultra     = case when v_tier = 'ultra' then 0 else scans_since_ultra + 1 end,
    scans_since_superrare = case when v_tier in ('superrare', 'ultra') then 0 else scans_since_superrare + 1 end
  where user_id = v_uid;

  return jsonb_build_object('status', 'retry', 'upgraded', v_up, 'old_tier', v_old, 'rolled_tier', v_tier,
    'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine), 'scans_today', v_today + 1);
end;
$$;
revoke all on function public.retry_wine(uuid) from public, anon;
grant execute on function public.retry_wine(uuid) to authenticated;


-- ---------- Testerlimiet instellen (pas e-mailadres en aantal aan) ----------
-- insert into public.collectors (user_id, daily_limit)
-- select id, 50 from auth.users where email = 'naam@voorbeeld.nl'
-- on conflict (user_id) do update set daily_limit = excluded.daily_limit;
