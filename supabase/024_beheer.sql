-- =====================================================================
-- Vined It database – migratie 024: beheerderscentrum
-- Cijfers (opgeteld, nooit per persoon), AI-kosten, feedback-inbox en wijnbeheer.
-- Alles alleen voor de beheerder. Veilig om opnieuw te draaien.
-- =====================================================================
create or replace function public.vi_is_admin()
returns boolean language sql stable as $$
  select lower(coalesce(auth.jwt()->>'email','')) = 'l.v.uuden3@gmail.com'
$$;

-- AI-gebruik: elke aanroep naar Claude (vanuit de Edge Functions), met tokens
create table if not exists public.ai_usage (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  kind text not null,           -- herkenning, achterkant, tekenen, klasse
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0
);
create index if not exists ai_usage_created on public.ai_usage (created_at);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;
grant select, insert on public.ai_usage to service_role;
grant usage, select on sequence public.ai_usage_id_seq to service_role;

-- Prijs per miljoen tokens in dollars (schatting; pas hier aan als de prijzen veranderen)
create or replace function public.vi_ai_cost(p_model text, p_in int, p_out int)
returns numeric language sql immutable as $$
  select (p_in * (case when p_model ilike '%opus%' then 4 when p_model ilike '%sonnet%' then 2 else 1 end)
        + p_out * (case when p_model ilike '%opus%' then 20 when p_model ilike '%sonnet%' then 10 else 5 end)) / 1000000.0
$$;

-- Feedback afhandelen
alter table public.feedback add column if not exists handled boolean not null default false;

-- ---------- Cijfers ----------
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select jsonb_build_object(
    'users', (select count(*) from public.collectors),
    'active7', (select count(distinct user_id) from public.recognitions where created_at > now() - interval '7 days'),
    'active30', (select count(distinct user_id) from public.recognitions where created_at > now() - interval '30 days'),
    'new7', (select count(*) from public.collectors where created_at > now() - interval '7 days'),
    'cards', (select count(*) from public.cards),
    'cards7', (select count(*) from public.cards where created_at > now() - interval '7 days'),
    'wines', (select count(*) from public.wines where exists (select 1 from public.cards c where c.wine_id = wines.id)),
    'wines7', (select count(*) from public.wines where created_at > now() - interval '7 days' and exists (select 1 from public.cards c where c.wine_id = wines.id)),
    'friends', (select count(*) from public.friendships),
    'feedback_open', (select count(*) from public.feedback where not handled),
    'scans14', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'scans', s, 'kaarten', k) order by d), '[]'::jsonb) from (
        select g::date as d,
          (select count(*) from public.recognitions where created_at::date = g::date) as s,
          (select count(*) from public.cards where created_at::date = g::date) as k
        from generate_series(current_date - 13, current_date, interval '1 day') g) x),
    'tiers', (select coalesce(jsonb_object_agg(tier, n), '{}'::jsonb) from (select tier, count(*) n from public.cards group by tier) t),
    'month_recognitions', (select count(*) from public.recognitions where created_at >= date_trunc('month', now())),
    'ai_month', (select coalesce(jsonb_object_agg(kind, jsonb_build_object('n', n, 'usd', round(usd, 2))), '{}'::jsonb) from (
        select kind, count(*) n, sum(public.vi_ai_cost(model, input_tokens, output_tokens)) usd
        from public.ai_usage where created_at >= date_trunc('month', now()) group by kind) a),
    'ai_since', (select min(created_at) from public.ai_usage)
  ) into r;
  return r;
end $$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- ---------- Feedback ----------
create or replace function public.admin_feedback(p_all boolean default false)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'at', f.created_at, 'kind', f.kind, 'msg', f.message, 'handled', f.handled,
      'who', coalesce(nullif(c.display_name, ''), split_part(u.email, '@', 1)), 'ctx', f.context) order by f.created_at desc)
    from public.feedback f join auth.users u on u.id = f.user_id left join public.collectors c on c.user_id = f.user_id
    where p_all or not f.handled), '[]'::jsonb);
end $$;
create or replace function public.admin_feedback_done(p_id bigint, p_done boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.feedback set handled = p_done where id = p_id;
end $$;
revoke all on function public.admin_feedback(boolean) from public, anon;
revoke all on function public.admin_feedback_done(bigint, boolean) from public, anon;
grant execute on function public.admin_feedback(boolean) to authenticated;
grant execute on function public.admin_feedback_done(bigint, boolean) to authenticated;

-- ---------- Wijnen ----------
create or replace function public.admin_wines(p_q text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(row_to_json(x)::jsonb) from (
    select w.id, w.naam, w.maker, w.jaar, w.regio, w.land, w.color, w.is_icon, w.tier, w.tier_override, w.tier_reason,
      w.signals, w.label_style->>'v' as label_v, coalesce((w.label_style->>'locked')::boolean, false) as locked, w.created_at,
      (select count(*) from public.cards c where c.wine_id = w.id) as kaarten
    from public.wines w
    where (coalesce(p_q, '') = '' and exists (select 1 from public.cards c where c.wine_id = w.id))
       or (coalesce(p_q, '') <> '' and (w.naam ilike '%' || p_q || '%' or w.maker ilike '%' || p_q || '%'))
    order by w.created_at desc limit 60) x), '[]'::jsonb);
end $$;
-- Klasse handmatig vastleggen (null = terug naar de berekende klasse); alle kaarten van de wijn gaan mee
create or replace function public.admin_set_tier(p_wine uuid, p_tier text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.wines; t text;
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_tier is not null and p_tier not in ('common','rare','superrare','ultra') then raise exception 'bad_tier' using errcode = '22023'; end if;
  update public.wines set tier_override = p_tier where id = p_wine returning * into w;
  if w.id is null then raise exception 'not_found'; end if;
  t := case when w.is_icon then 'icon' else coalesce(w.tier_override, w.tier) end;
  if t is not null then update public.cards set tier = t where wine_id = w.id; end if;
  return jsonb_build_object('tier', t);
end $$;
create or replace function public.admin_merge(p_keep uuid, p_drop uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  perform public.merge_wine(p_keep, p_drop);
end $$;
revoke all on function public.admin_wines(text) from public, anon;
revoke all on function public.admin_set_tier(uuid, text) from public, anon;
revoke all on function public.admin_merge(uuid, uuid) from public, anon;
grant execute on function public.admin_wines(text) to authenticated;
grant execute on function public.admin_set_tier(uuid, text) to authenticated;
grant execute on function public.admin_merge(uuid, uuid) to authenticated;
