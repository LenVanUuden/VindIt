-- =====================================================================
-- Vined It database – migratie 022: makersstickers alleen voor de maker
-- De drie knipoog-stickers ('o:zegel', 'o:etiket', 'o:postzegel') mag alleen
-- de maker van de app plakken. Wijnvrienden zien ze wel op zijn album.
-- Veilig om opnieuw te draaien.
-- =====================================================================
create or replace function public.save_page_stickers(p_page text, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_page is null or char_length(p_page) not between 1 and 80 then raise exception 'invalid_page' using errcode = '22023'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 40 or pg_column_size(p_items) > 12000 then
    raise exception 'invalid_items' using errcode = '22023';
  end if;
  -- Makersstickers ('o:…') zijn alleen voor de maker van de app
  if exists (select 1 from jsonb_array_elements(p_items) e where e->>'s' like 'o:%')
     and lower(coalesce(auth.jwt()->>'email', '')) <> 'l.v.uuden3@gmail.com' then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if jsonb_array_length(p_items) = 0 then
    delete from public.stickers where user_id = v_uid and page = p_page;
  else
    insert into public.stickers (user_id, page, items) values (v_uid, p_page, p_items)
    on conflict (user_id, page) do update set items = excluded.items, updated_at = now();
  end if;
end;
$$;
revoke all on function public.save_page_stickers(text, jsonb) from public, anon;
grant execute on function public.save_page_stickers(text, jsonb) to authenticated;
