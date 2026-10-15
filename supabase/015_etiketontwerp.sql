-- =====================================================================
-- Vined It database – migratie 015: getekend etiket per wijn
-- Draai NA 014. Plak in Supabase → SQL Editor → Run. Veilig om opnieuw te draaien.
--
-- Claude beschrijft bij de eerste scan het ontwerp van het etiket (kleuren,
-- letterstijl, opbouw, embleem). De app tekent daarmee een etiket in de stijl
-- van het album. Het ontwerp hoort bij de wijn: iedereen ziet hetzelfde.
-- =====================================================================
alter table public.wines add column if not exists label_style jsonb;

create or replace function public.set_label_style(p_wine uuid, p_style jsonb, p_force boolean default false)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_style is null or jsonb_typeof(p_style) <> 'object' or pg_column_size(p_style) > 4000 then return false; end if;
  update public.wines set label_style = p_style
   where id = p_wine and (p_force or label_style is null);
  return found;
end;
$$;
revoke all on function public.set_label_style(uuid, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.set_label_style(uuid, jsonb, boolean) to service_role;

-- De Edge Function "reassess" zoekt bij wie een etiketfoto van een wijn staat
grant select on public.cards to service_role;
