-- =====================================================================
-- Winex database – migratie 003: instellingen
-- Draai NA 002_sets.sql. Plak in Supabase → SQL Editor → New query → Run.
-- Veilig om opnieuw te draaien.
-- =====================================================================

alter table public.collectors add column if not exists cover_color text not null default 'bordeaux';
alter table public.collectors add column if not exists page_color  text not null default 'zwart';

-- Alleen via deze functie aan te passen, zodat niemand zijn garantietellers kan wijzigen.
create or replace function public.update_settings(p_name text, p_cover text, p_pages text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_name text := nullif(trim(coalesce(p_name, '')), '');
  v_row  public.collectors;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_cover not in ('bordeaux', 'groen', 'blauw', 'cognac', 'zwart') then
    raise exception 'invalid_cover' using errcode = '22023';
  end if;
  if p_pages not in ('zwart', 'creme') then
    raise exception 'invalid_pages' using errcode = '22023';
  end if;
  if v_name is not null and (char_length(v_name) > 24 or v_name !~ '^[[:alnum:] .''&-]+$') then
    raise exception 'invalid_name' using errcode = '22023';
  end if;

  insert into public.collectors (user_id, display_name, cover_color, page_color)
  values (v_uid, v_name, p_cover, p_pages)
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        cover_color  = excluded.cover_color,
        page_color   = excluded.page_color
  returning * into v_row;

  return jsonb_build_object('display_name', v_row.display_name, 'cover_color', v_row.cover_color, 'page_color', v_row.page_color);
end;
$$;

revoke all on function public.update_settings(text, text, text) from public, anon;
grant execute on function public.update_settings(text, text, text) to authenticated;
