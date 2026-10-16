-- Vined It database – migratie 019: Edge Functions mogen samenvoegingen lezen en bijwerken
-- (al uitgevoerd via de Supabase-koppeling op 15 okt; staat ook in 017 en 018)
grant select, update on public.wine_merges to service_role;
