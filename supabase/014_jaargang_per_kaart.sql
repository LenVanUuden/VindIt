-- =====================================================================
-- Vined It database – migratie 014: jaargang per kaart
-- Draai NA 013. Plak in Supabase → SQL Editor → Run. Veilig om opnieuw te draaien.
--
-- Een wijn (producent + cuvée) is gedeeld door iedereen, maar de jaargang
-- verschilt per fles. Tot nu toe toonde elke kaart de jaargang van de
-- allereerste scan van die wijn, door wie dan ook. Nu heeft elke kaart een
-- eigen jaargang: die van jouw laatst gescande fles.
-- =====================================================================
alter table public.cards add column if not exists jaar int;
update public.cards c set jaar = w.jaar from public.wines w where c.wine_id = w.id and c.jaar is null;

create or replace function public.set_card_vintage(p_wine uuid, p_jaar int)
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_jaar is null or p_jaar < 1800 or p_jaar > extract(year from now())::int + 1 then return null; end if;
  update public.cards set jaar = p_jaar where user_id = auth.uid() and wine_id = p_wine;
  return p_jaar;
end;
$$;
revoke all on function public.set_card_vintage(uuid, int) from public, anon;
grant execute on function public.set_card_vintage(uuid, int) to authenticated;

-- Wijnvrienden zien ook de jaargang van de kaart (niet die van de eerste scan)
create or replace function public.friend_album(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_c public.collectors;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not public.vi_is_friend(p_id) then return jsonb_build_object('status', 'not_friends'); end if;
  select * into v_c from public.collectors where user_id = p_id;
  return jsonb_build_object(
    'status', 'ok',
    'id', p_id,
    'name', public.vi_display_name(p_id),
    'cover', coalesce(v_c.cover_color, 'bordeaux'),
    'pages', coalesce(v_c.page_color, 'zwart'),
    'cards', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', c.id, 'tier', c.tier, 'created_at', c.created_at,
               'fav_rank', c.fav_rank, 'top_at', c.top_at, 'full_art', c.full_art, 'bottles', c.bottles, 'jaar', c.jaar,
               'wine', to_jsonb(w)) order by c.created_at)
        from public.cards c join public.wines w on w.id = c.wine_id
       where c.user_id = p_id), '[]'::jsonb),
    'stickers', coalesce((select jsonb_object_agg(page, items) from public.stickers where user_id = p_id), '{}'::jsonb)
  );
end;
$$;
revoke all on function public.friend_album(uuid) from public, anon;
grant execute on function public.friend_album(uuid) to authenticated;
