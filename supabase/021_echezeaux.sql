-- =====================================================================
-- Vined It database – migratie 021: Échezeaux (DRC) vervangt Musigny (Leroy)
-- Veilig om opnieuw te draaien. Niemand had een Leroy-kaart.
-- =====================================================================
update public.wines set is_icon = false, tier = null, tier_reason = null
 where wine_key = 'domaine leroy|musigny' and signals is null;
update public.wines set is_icon = false where wine_key = 'domaine leroy|musigny';

insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags, is_icon, tier, variant)
values ('domaine de la romanée-conti|échezeaux', 'Échezeaux', 'Domaine de la Romanée-Conti', 2004, 'Pinot Noir', 'Rood, verfijnd', 'bourgogne', 'Frankrijk',
        'Échezeaux Grand Cru', 'Pinot Noir', 'stil', 'rood', '{}'::text[], true, 'icon', (abs(hashtext('domaine de la romanée-conti|échezeaux')) % 4))
on conflict (wine_key) do update set is_icon = true, tier = 'icon';

-- Al gescande DRC-Échezeaux (onder een iets andere naam) worden ook Legende
update public.wines set is_icon = true, tier = 'icon'
 where maker ilike '%romanée-conti%' and naam ilike '%chezeaux%' and naam not ilike '%grands%';
update public.cards c set tier = 'icon', full_art = false
  from public.wines w where w.id = c.wine_id and w.maker ilike '%romanée-conti%' and w.naam ilike '%chezeaux%' and w.naam not ilike '%grands%';
