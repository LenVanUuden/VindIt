-- =====================================================================
-- Vined It database – migratie 013: wijnvrienden en stickers
-- Draai NA 012. Plak in Supabase → SQL Editor → Run. Veilig om opnieuw te draaien.
--
-- Wijnvrienden
-- - Iedereen heeft één persoonlijke uitnodigingscode (in een link, te delen via
--   WhatsApp). Wie de link opent en ingelogd is, wordt meteen wijnvriend.
--   Geen e-mail nodig. Een nieuwe code maken maakt de oude ongeldig.
-- - Een wijnvriend ziet je album alleen-lezen, ZONDER je herinneringen.
-- Stickers
-- - Per bladzijde een lijst geplakte stickers (positie, draaiing, grootte).
--   Welke stickers je verdiend hebt, volgt uit je kaarten (in de app).
-- Alles loopt via functies; de tabellen zijn niet direct te beschrijven.
-- =====================================================================

-- ---------- Tabellen ----------
create table if not exists public.friend_invites (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  code       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.friendships (
  a          uuid not null references auth.users(id) on delete cascade,
  b          uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a < b)
);
create index if not exists friendships_b on public.friendships (b);

create table if not exists public.stickers (
  user_id    uuid not null references auth.users(id) on delete cascade,
  page       text not null,
  items      jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, page),
  check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 40),
  check (char_length(page) between 1 and 80)
);

alter table public.friend_invites enable row level security;
alter table public.friendships    enable row level security;
alter table public.stickers       enable row level security;
revoke all on public.friend_invites, public.friendships, public.stickers from anon, authenticated;
grant select on public.stickers to authenticated;
drop policy if exists "eigen stickers lezen" on public.stickers;
create policy "eigen stickers lezen" on public.stickers for select to authenticated using (user_id = auth.uid());

-- ---------- Hulpfuncties ----------
create or replace function public.vi_is_friend(p_other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
     where a = least(auth.uid(), p_other) and b = greatest(auth.uid(), p_other)
  );
$$;
revoke all on function public.vi_is_friend(uuid) from public, anon;

create or replace function public.vi_display_name(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(trim((select display_name from public.collectors where user_id = p_user)), ''),
    initcap(split_part(split_part((select email from auth.users where id = p_user), '@', 1), '.', 1)),
    'Wijnvriend'
  );
$$;
revoke all on function public.vi_display_name(uuid) from public, anon;

-- ---------- Uitnodigen ----------
create or replace function public.my_invite(p_new boolean default false)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_code text;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select code into v_code from public.friend_invites where user_id = v_uid;
  if v_code is null or p_new then
    loop
      v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      exit when char_length(v_code) = 8 and not exists (select 1 from public.friend_invites where code = v_code);
    end loop;
    insert into public.friend_invites (user_id, code) values (v_uid, v_code)
    on conflict (user_id) do update set code = excluded.code, created_at = now();
  end if;
  return v_code;
end;
$$;
revoke all on function public.my_invite(boolean) from public, anon;
grant execute on function public.my_invite(boolean) to authenticated;

create or replace function public.accept_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_other uuid;
  v_new   boolean;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select user_id into v_other from public.friend_invites where code = upper(trim(coalesce(p_code, '')));
  if v_other is null then return jsonb_build_object('status', 'invalid'); end if;
  if v_other = v_uid then return jsonb_build_object('status', 'self'); end if;
  insert into public.friendships (a, b) values (least(v_uid, v_other), greatest(v_uid, v_other))
  on conflict do nothing;
  get diagnostics v_new = row_count;
  return jsonb_build_object('status', case when v_new then 'ok' else 'already' end,
                            'friend', jsonb_build_object('id', v_other, 'name', public.vi_display_name(v_other)));
end;
$$;
revoke all on function public.accept_invite(text) from public, anon;
grant execute on function public.accept_invite(text) to authenticated;

create or replace function public.list_friends()
returns table (id uuid, name text, cover text, kaarten int, since timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, public.vi_display_name(o.id),
         coalesce((select cover_color from public.collectors where user_id = o.id), 'bordeaux'),
         (select count(*)::int from public.cards where user_id = o.id),
         f.created_at
    from public.friendships f
    cross join lateral (select case when f.a = auth.uid() then f.b else f.a end as id) o
   where auth.uid() in (f.a, f.b)
   order by f.created_at;
$$;
revoke all on function public.list_friends() from public, anon;
grant execute on function public.list_friends() to authenticated;

create or replace function public.remove_friend(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.friendships where a = least(auth.uid(), p_id) and b = greatest(auth.uid(), p_id);
$$;
revoke all on function public.remove_friend(uuid) from public, anon;
grant execute on function public.remove_friend(uuid) to authenticated;

-- ---------- Album van een wijnvriend (alleen-lezen, zonder herinneringen) ----------
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
               'fav_rank', c.fav_rank, 'top_at', c.top_at, 'full_art', c.full_art, 'bottles', c.bottles,
               'wine', to_jsonb(w)) order by c.created_at)
        from public.cards c join public.wines w on w.id = c.wine_id
       where c.user_id = p_id), '[]'::jsonb),
    'stickers', coalesce((select jsonb_object_agg(page, items) from public.stickers where user_id = p_id), '{}'::jsonb)
  );
end;
$$;
revoke all on function public.friend_album(uuid) from public, anon;
grant execute on function public.friend_album(uuid) to authenticated;

-- ---------- Stickers opslaan (per bladzijde) ----------
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
