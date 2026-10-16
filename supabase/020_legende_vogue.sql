-- =====================================================================
-- Vined It database – migratie 020: de 21e Legende
-- Musigny van Comte Georges de Vogüé komt erbij (naast de Musigny van Leroy).
-- Veilig om opnieuw te draaien.
-- =====================================================================
insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags, is_icon, tier, variant)
values ('comte georges de vogüé|musigny', 'Musigny', 'Comte Georges de Vogüé', 2015, 'Pinot Noir', 'Rood, verfijnd', 'bourgogne', 'Frankrijk',
        'Musigny Grand Cru', 'Pinot Noir', 'stil', 'rood', '{}'::text[], true, 'icon', (abs(hashtext('comte georges de vogüé|musigny')) % 4))
on conflict (wine_key) do update set is_icon = true, tier = 'icon';

-- Al gescande Vogüé-Musigny's (onder een iets andere naam) worden ook Legende, met hun kaarten
update public.wines set is_icon = true, tier = 'icon'
 where maker ilike '%vog%' and naam ilike '%musigny%';
update public.cards c set tier = 'icon', full_art = false
  from public.wines w where w.id = c.wine_id and w.maker ilike '%vog%' and w.naam ilike '%musigny%';
