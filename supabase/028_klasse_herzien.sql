-- Beheer: voorstellen voor een nieuwe klasse (na opzoeken op internet) bekijken en toepassen
create table if not exists public.tier_review (wine_id uuid primary key references public.wines(id) on delete cascade, signals jsonb not null, old_tier text, next jsonb, created_at timestamptz not null default now());
alter table public.tier_review enable row level security;
grant all on public.tier_review to service_role;

create or replace function public.admin_reviews()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(row_to_json(x)::jsonb order by x.changed desc, x.naam) from (
    select r.wine_id, w.naam, w.maker, w.jaar, w.is_icon, w.tier_override,
      case when w.is_icon then 'icon' else coalesce(w.tier_override, w.tier) end as now_tier,
      w.tier_reason as now_reason, r.next, r.signals, r.created_at,
      (select count(*) from public.cards c where c.wine_id = w.id) as kaarten,
      (case when w.is_icon then 'icon' else coalesce(w.tier_override, w.tier) end) is distinct from
        (case when w.is_icon then 'icon' else coalesce(w.tier_override, r.next->>'tier') end) as changed
    from public.tier_review r join public.wines w on w.id = r.wine_id) x), '[]'::jsonb);
end $$;

create or replace function public.admin_review_apply(p_wine uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s jsonb; res jsonb;
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select signals into s from public.tier_review where wine_id = p_wine;
  if s is null then raise exception 'not_found'; end if;
  res := public.admin_apply_signals(p_wine, s);
  delete from public.tier_review where wine_id = p_wine;
  return res;
end $$;

create or replace function public.admin_review_dismiss(p_wine uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  delete from public.tier_review where wine_id = p_wine;
end $$;
revoke all on function public.admin_reviews() from public, anon;
revoke all on function public.admin_review_apply(uuid) from public, anon;
revoke all on function public.admin_review_dismiss(uuid) from public, anon;
grant execute on function public.admin_reviews() to authenticated;
grant execute on function public.admin_review_apply(uuid) to authenticated;
grant execute on function public.admin_review_dismiss(uuid) to authenticated;
