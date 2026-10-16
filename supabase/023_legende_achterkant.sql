-- =====================================================================
-- Vined It database – migratie 023: Legende pas na foto van de achterkant
-- Bij een Legende die je nog niet hebt, maakt de herkenning nog geen kaart.
-- Eerst een foto van de achterkant van dezelfde fles (zelfde maker, wijn en
-- jaargang); pas dan volgt de kaart. Deze tabel bewaart de wachtende controle
-- (alleen de Edge Function leest en schrijft hem).
-- Veilig om opnieuw te draaien.
-- =====================================================================
create table if not exists public.legend_checks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  payload    jsonb not null,
  label_box  jsonb,
  used       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists legend_checks_user on public.legend_checks (user_id, created_at desc);
alter table public.legend_checks enable row level security;
revoke all on public.legend_checks from anon, authenticated;
grant select, insert, update on public.legend_checks to service_role;
grant execute on function public.find_same_wine(jsonb) to service_role;
