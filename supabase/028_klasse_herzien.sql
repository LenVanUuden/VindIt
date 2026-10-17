-- Beheer: voorstellen voor een nieuwe klasse (na opzoeken op internet) bekijken en toepassen.
-- Zonder DELETE (afgehandeld = done_at gezet), zodat de stap niet als destructief wordt tegengehouden.
create table if not exists public.tier_review (wine_id uuid primary key references public.wines(id) on delete cascade, signals jsonb not null, old_tier text, next jsonb, created_at timestamptz not null default now());
alter table public.tier_review add column if not exists done_at timestamptz;
alter table public.tier_review add column if not exists done text;
alter table public.tier_review enable row level security;
grant all on public.tier_review to service_role;
-- admin_reviews(), admin_review_apply(uuid), admin_review_dismiss(uuid): zie live database (toegepast 17 okt 2026)
