-- =====================================================================
-- Vin’d It database – migratie 005: wachttijd bij herproeven
-- Draai NA 004_herproeven.sql. Plak in Supabase → SQL Editor → New query → Run.
-- Veilig om opnieuw te draaien.
--
-- Dezelfde wijn kun je één keer per kalenderdag (Nederlandse tijd) proberen:
-- niet opnieuw op de dag dat je de kaart kreeg of al herproefde.
-- =====================================================================

create or replace function public.retry_wine(p_wine_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_limit constant int := 3;
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
