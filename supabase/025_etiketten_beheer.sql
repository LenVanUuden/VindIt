-- Beheer: getekend etiket meesturen in de wijnenlijst, Fable in de kostenschatting
create or replace function public.vi_ai_cost(p_model text, p_in int, p_out int)
returns numeric language sql immutable as $$
  select (p_in * (case when p_model ilike '%fable%' or p_model ilike '%mythos%' then 10 when p_model ilike '%opus%' then 4 when p_model ilike '%sonnet%' then 2 else 1 end)
        + p_out * (case when p_model ilike '%fable%' or p_model ilike '%mythos%' then 50 when p_model ilike '%opus%' then 20 when p_model ilike '%sonnet%' then 10 else 5 end)) / 1000000.0
$$;

create or replace function public.admin_wines(p_q text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(row_to_json(x)::jsonb) from (
    select w.id, w.naam, w.maker, w.jaar, w.regio, w.land, w.color, w.is_icon, w.tier, w.tier_override, w.tier_reason,
      w.signals, w.label_style->>'v' as label_v, coalesce((w.label_style->>'locked')::boolean, false) as locked,
      case when w.label_style->>'v' = '2' then w.label_style end as label_style, w.created_at,
      (select count(*) from public.cards c where c.wine_id = w.id) as kaarten
    from public.wines w
    where (coalesce(p_q, '') = '' and exists (select 1 from public.cards c where c.wine_id = w.id))
       or (coalesce(p_q, '') <> '' and (w.naam ilike '%' || p_q || '%' or w.maker ilike '%' || p_q || '%'))
    order by w.created_at desc limit 60) x), '[]'::jsonb);
end $$;
revoke all on function public.admin_wines(text) from public, anon;
grant execute on function public.admin_wines(text) to authenticated;
