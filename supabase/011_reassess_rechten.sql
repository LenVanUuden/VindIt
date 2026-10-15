-- Vined It – 011: leesrecht voor de Edge Function "reassess"
-- reassess leest de wijnlijst met de service_role; die had geen SELECT op wines
-- (fout 42501 "permission denied for table wines"). Schrijven blijft via set_wine_signals().
grant select on public.wines to service_role;
