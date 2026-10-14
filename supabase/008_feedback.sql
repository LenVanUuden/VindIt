-- =====================================================================
-- Vined It database – migratie 008: feedback van testers
-- Draai NA 007_scannen.sql. Plak in Supabase → SQL Editor → New query → Run.
-- Veilig om opnieuw te draaien.
-- =====================================================================

create table if not exists public.feedback (
  id         bigserial primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  kind       text not null check (kind in ('bug', 'idee', 'compliment', 'anders')),
  message    text not null check (char_length(message) between 1 and 2000),
  context    jsonb not null default '{}'::jsonb
);
alter table public.feedback enable row level security;

-- Testers mogen alleen hun eigen feedback toevoegen; lezen doe jij in het dashboard.
drop policy if exists "feedback toevoegen" on public.feedback;
create policy "feedback toevoegen" on public.feedback
  for insert to authenticated
  with check (user_id = auth.uid());

grant insert on public.feedback to authenticated;
grant usage, select on sequence public.feedback_id_seq to authenticated;

-- Overzicht met e-mailadres (alleen zichtbaar in het dashboard, niet in de app):
create or replace view public.feedback_overzicht
with (security_invoker = true) as
select f.created_at at time zone 'Europe/Amsterdam' as tijd,
       u.email, f.kind as soort, f.message as bericht, f.context
from public.feedback f
join auth.users u on u.id = f.user_id
order by f.created_at desc;
revoke all on public.feedback_overzicht from public, anon, authenticated;

-- Bekijken: select * from public.feedback_overzicht;
