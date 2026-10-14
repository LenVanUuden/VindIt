-- =====================================================================
-- Vin’d It database – migratie 007: echt scannen
-- Draai NA 006_testerlimiet.sql. Plak in Supabase → SQL Editor → New query → Run.
-- Veilig om opnieuw te draaien.
-- =====================================================================

-- ---------- Budget: herkenningen per maand (alle gebruikers samen) ----------
create table if not exists public.api_usage (
  month text primary key,          -- 'YYYY-MM'
  calls int not null default 0
);
alter table public.api_usage enable row level security;   -- geen policies: alleen de server

-- ---------- Herkenningen per gebruiker (voor de daglimiet) ----------
create table if not exists public.recognitions (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists recognitions_user_created on public.recognitions (user_id, created_at);
alter table public.recognitions enable row level security; -- geen policies: alleen de server

-- Alleen aan te roepen door de Edge Function (service role).
create or replace function public.claim_recognition(p_user uuid, p_month_cap int, p_day_cap int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month text := to_char(now() at time zone 'Europe/Amsterdam', 'YYYY-MM');
  v_calls int;
  v_today int;
  v_cap   int;
begin
  perform pg_advisory_xact_lock(hashtextextended('recognize-' || p_user::text, 0));

  select coalesce(calls, 0) into v_calls from public.api_usage where month = v_month;
  if coalesce(v_calls, 0) >= p_month_cap then
    return 'month_cap';
  end if;

  select greatest(p_day_cap, coalesce((select daily_limit from public.collectors where user_id = p_user), 3) * 5) into v_cap;
  select count(*) into v_today from public.recognitions
   where user_id = p_user
     and (created_at at time zone 'Europe/Amsterdam')::date = (now() at time zone 'Europe/Amsterdam')::date;
  if v_today >= v_cap then
    return 'day_cap';
  end if;

  insert into public.api_usage (month, calls) values (v_month, 1)
  on conflict (month) do update set calls = public.api_usage.calls + 1;
  insert into public.recognitions (user_id) values (p_user);
  return 'ok';
end;
$$;
revoke all on function public.claim_recognition(uuid, int, int) from public, anon, authenticated;
grant execute on function public.claim_recognition(uuid, int, int) to service_role;

-- ---------- Opslag voor kaartafbeeldingen (jouw flesfoto in posterstijl) ----------
insert into storage.buckets (id, name, public)
values ('card-art', 'card-art', true)
on conflict (id) do update set public = true;

drop policy if exists "kaartafbeelding uploaden" on storage.objects;
create policy "kaartafbeelding uploaden" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'card-art' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "kaartafbeelding vervangen" on storage.objects;
create policy "kaartafbeelding vervangen" on storage.objects
  for update to authenticated
  using (bucket_id = 'card-art' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'card-art' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "kaartafbeelding lezen" on storage.objects;
create policy "kaartafbeelding lezen" on storage.objects
  for select to authenticated
  using (bucket_id = 'card-art' and (storage.foldername(name))[1] = auth.uid()::text);

-- Overzicht van het verbruik (draai dit los als je wilt kijken):
-- select * from public.api_usage order by month desc;
