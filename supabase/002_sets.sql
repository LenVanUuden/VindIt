-- =====================================================================
-- Winex database – migratie 002: sets
-- Draai NA schema.sql. Plak in Supabase → SQL Editor → New query → Run.
-- Veilig om opnieuw te draaien.
-- =====================================================================

-- ---------- Extra wijnvelden voor het matchen van sets ----------
alter table public.wines add column if not exists appellation text;
alter table public.wines add column if not exists grape       text;   -- hoofddruif, leeg bij blends
alter table public.wines add column if not exists style       text;   -- stil | mousserend | zoet | versterkt
alter table public.wines add column if not exists color       text;   -- rood | wit | rosé
alter table public.wines add column if not exists tags        text[] not null default '{}';

-- ---------- Scanfunctie bijwerken ----------
create or replace function public.scan_wine(p_wine jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_limit constant int := 3;
  v_key   text;
  v_wine  public.wines;
  v_card  public.cards;
  v_col   public.collectors;
  v_today int;
  v_tier  text;
  v_roll  double precision;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if coalesce(trim(p_wine->>'naam'), '') = '' or coalesce(trim(p_wine->>'regio'), '') = '' then
    raise exception 'invalid_wine' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  v_key := lower(trim(coalesce(p_wine->>'maker', ''))) || '|' || lower(trim(p_wine->>'naam'));

  insert into public.collectors (user_id) values (v_uid) on conflict do nothing;
  select * into v_col from public.collectors where user_id = v_uid for update;

  select * into v_wine from public.wines where wine_key = v_key;
  if v_wine.id is not null then
    select * into v_card from public.cards where user_id = v_uid and wine_id = v_wine.id;
    if v_card.id is not null then
      return jsonb_build_object('status', 'duplicate', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine));
    end if;
  end if;

  select count(*) into v_today
    from public.cards
   where user_id = v_uid
     and (created_at at time zone 'Europe/Amsterdam')::date = (now() at time zone 'Europe/Amsterdam')::date;
  if v_today >= v_limit then
    return jsonb_build_object('status', 'limit', 'scans_today', v_today);
  end if;

  if v_wine.id is null then
    insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags, variant, first_scanned_by)
    values (
      v_key,
      trim(p_wine->>'naam'),
      trim(coalesce(p_wine->>'maker', '')),
      case when coalesce(p_wine->>'jaar', '') ~ '^\d{4}$' then (p_wine->>'jaar')::int end,
      nullif(trim(coalesce(p_wine->>'druif', '')), ''),
      nullif(trim(coalesce(p_wine->>'stijl', '')), ''),
      trim(p_wine->>'regio'),
      nullif(trim(coalesce(p_wine->>'land', '')), ''),
      nullif(trim(coalesce(p_wine->>'app', '')), ''),
      nullif(trim(coalesce(p_wine->>'grape', '')), ''),
      nullif(trim(coalesce(p_wine->>'style', '')), ''),
      nullif(trim(coalesce(p_wine->>'color', '')), ''),
      coalesce((select array_agg(lower(t)) from jsonb_array_elements_text(coalesce(p_wine->'tags', '[]'::jsonb)) t), '{}'),
      (abs(hashtext(v_key)) % 4),
      v_uid
    )
    on conflict (wine_key) do update set wine_key = excluded.wine_key
    returning * into v_wine;
  elsif v_wine.first_scanned_by is null then
    -- Vooraf ingevoerde wijn (zoals een Icon): de eerste echte scanner wordt Eerste Ontdekker.
    update public.wines set first_scanned_by = v_uid where id = v_wine.id returning * into v_wine;
  end if;

  if v_wine.is_icon then
    v_tier := 'icon';
  elsif v_col.scans_since_ultra >= 99 then
    v_tier := 'ultra';
  elsif v_col.scans_since_superrare >= 24 then
    v_tier := 'superrare';
  else
    v_roll := random();
    v_tier := case
      when v_roll < 0.01 then 'ultra'
      when v_roll < 0.06 then 'superrare'
      when v_roll < 0.24 then 'rare'
      else 'common'
    end;
  end if;

  insert into public.cards (user_id, wine_id, tier)
  values (v_uid, v_wine.id, v_tier)
  returning * into v_card;

  update public.collectors set
    scans_since_ultra     = case when v_tier = 'ultra' then 0 else scans_since_ultra + 1 end,
    scans_since_superrare = case when v_tier in ('superrare', 'ultra') then 0 else scans_since_superrare + 1 end
  where user_id = v_uid;

  return jsonb_build_object('status', 'new', 'card', to_jsonb(v_card), 'wine', to_jsonb(v_wine), 'scans_today', v_today + 1);
end;
$$;

revoke all on function public.scan_wine(jsonb) from public, anon;
grant execute on function public.scan_wine(jsonb) to authenticated;

-- ---------- Demowijnen en Icons ----------
-- Bestaande wijnen krijgen hun setgegevens; de echte Icons worden vooraf ingevoerd.
-- De fictieve demo-Icons uit v1 zijn geen Icon meer (al getrokken kaarten blijven zoals ze zijn).
with v (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags, is_icon) as (values
  ('bordeaux supérieur|château lamothe-sablon', 'Château Lamothe-Sablon', 'Bordeaux Supérieur', 2019, 'Merlot, Cabernet Franc', 'Rood, soepel', 'bordeaux', 'Frankrijk', 'Bordeaux Supérieur', 'Merlot', 'stil', 'rood', '{}'::text[], false),
  ('graves|clos des graves pâles', 'Clos des Graves Pâles', 'Graves', 2021, 'Sauvignon Blanc, Sémillon', 'Wit, fris', 'bordeaux', 'Frankrijk', 'Graves', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], false),
  ('saint-émilion grand cru|château belair-roque', 'Château Belair-Roque', 'Saint-Émilion Grand Cru', 2018, 'Merlot', 'Rood, vol', 'bordeaux', 'Frankrijk', 'Saint-Émilion Grand Cru', 'Merlot', 'stil', 'rood', '{}'::text[], false),
  ('médoc|les hauts de ferrand', 'Les Hauts de Ferrand', 'Médoc', 2020, 'Cabernet Sauvignon', 'Rood, stevig', 'bordeaux', 'Frankrijk', 'Médoc', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('pauillac|château du pin doré', 'Château du Pin Doré', 'Pauillac', 2016, 'Cabernet Sauvignon, Merlot', 'Rood, krachtig', 'bordeaux', 'Frankrijk', 'Pauillac', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('bourgogne aoc|vernier-lacombe pinot noir', 'Vernier-Lacombe Pinot Noir', 'Bourgogne AOC', 2021, 'Pinot Noir', 'Rood, licht', 'bourgogne', 'Frankrijk', 'Bourgogne', 'Pinot Noir', 'stil', 'rood', '{}'::text[], false),
  ('domaine des crays|mâcon-villages les crays', 'Mâcon-Villages Les Crays', 'Domaine des Crays', 2022, 'Chardonnay', 'Wit, rond', 'bourgogne', 'Frankrijk', 'Mâcon-Villages', 'Chardonnay', 'stil', 'wit', '{}'::text[], false),
  ('domaine morel-vaudé|chablis les bastions', 'Chablis Les Bastions', 'Domaine Morel-Vaudé', 2022, 'Chardonnay', 'Wit, mineraal', 'bourgogne', 'Frankrijk', 'Chablis', 'Chardonnay', 'stil', 'wit', '{}'::text[], false),
  ('côte de nuits-villages|clos ravel', 'Clos Ravel', 'Côte de Nuits-Villages', 2020, 'Pinot Noir', 'Rood, elegant', 'bourgogne', 'Frankrijk', 'Côte de Nuits-Villages', 'Pinot Noir', 'stil', 'rood', '{}'::text[], false),
  ('crémant de bourgogne|brut perle', 'Brut Perle', 'Crémant de Bourgogne', 2021, 'Chardonnay, Pinot Noir', 'Mousserend, droog', 'bourgogne', 'Frankrijk', 'Crémant de Bourgogne', null, 'mousserend', 'wit', array['crémant']::text[], false),
  ('côtes du jura|domaine des sapins', 'Domaine des Sapins', 'Côtes du Jura', 2022, 'Chardonnay', 'Wit, mineraal', 'jura', 'Frankrijk', 'Côtes du Jura', 'Chardonnay', 'stil', 'wit', '{}'::text[], false),
  ('arbois|ploussard des combes', 'Ploussard des Combes', 'Arbois', 2021, 'Poulsard', 'Rood, heel licht', 'jura', 'Frankrijk', 'Arbois', 'Poulsard', 'stil', 'rood', '{}'::text[], false),
  ('château-chalon|vin jaune les roches', 'Vin Jaune Les Roches', 'Château-Chalon', 2015, 'Savagnin', 'Wit, oxidatief', 'jura', 'Frankrijk', 'Château-Chalon', 'Savagnin', 'stil', 'wit', array['vin jaune']::text[], false),
  ('arbois|trousseau du moulin', 'Trousseau du Moulin', 'Arbois', 2020, 'Trousseau', 'Rood, licht', 'jura', 'Frankrijk', 'Arbois', 'Trousseau', 'stil', 'rood', '{}'::text[], false),
  ('crémant du jura|givre', 'Givre', 'Crémant du Jura', 2021, 'Chardonnay', 'Mousserend, fris', 'jura', 'Frankrijk', 'Crémant du Jura', 'Chardonnay', 'mousserend', 'wit', array['crémant']::text[], false),
  ('chianti classico|poggio alto', 'Poggio Alto', 'Chianti Classico', 2020, 'Sangiovese', 'Rood, stevig', 'toscane', 'Italië', 'Chianti Classico', 'Sangiovese', 'stil', 'rood', '{}'::text[], false),
  ('toscana igt|sassorosso', 'Sassorosso', 'Toscana IGT', 2019, 'Cabernet Sauvignon, Merlot', 'Rood, vol', 'toscane', 'Italië', 'Toscana IGT', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('rosso di montalcino|casa rondine', 'Casa Rondine', 'Rosso di Montalcino', 2021, 'Sangiovese', 'Rood, elegant', 'toscane', 'Italië', 'Rosso di Montalcino', 'Sangiovese', 'stil', 'rood', '{}'::text[], false),
  ('brunello di montalcino|vigna del falco', 'Vigna del Falco', 'Brunello di Montalcino', 2017, 'Sangiovese', 'Rood, krachtig', 'toscane', 'Italië', 'Brunello di Montalcino', 'Sangiovese', 'stil', 'rood', '{}'::text[], false),
  ('toscana igt|bianco delle colline', 'Bianco delle Colline', 'Toscana IGT', 2023, 'Vermentino', 'Wit, fris', 'toscane', 'Italië', 'Toscana IGT', 'Vermentino', 'stil', 'wit', '{}'::text[], false),
  ('rioja doca|bodegas ventura crianza', 'Bodegas Ventura Crianza', 'Rioja DOCa', 2020, 'Tempranillo', 'Rood, houtgerijpt', 'rioja', 'Spanje', 'Rioja', 'Tempranillo', 'stil', 'rood', array['crianza']::text[], false),
  ('rioja doca|viña clara blanco', 'Viña Clara Blanco', 'Rioja DOCa', 2022, 'Viura', 'Wit, fris', 'rioja', 'Spanje', 'Rioja', 'Viura', 'stil', 'wit', '{}'::text[], false),
  ('rioja doca|marqués de alcor reserva', 'Marqués de Alcor Reserva', 'Rioja DOCa', 2016, 'Tempranillo, Graciano', 'Rood, rijp', 'rioja', 'Spanje', 'Rioja', 'Tempranillo', 'stil', 'rood', array['reserva','rioja alta']::text[], false),
  ('rioja doca|rosado de la sierra', 'Rosado de la Sierra', 'Rioja DOCa', 2023, 'Garnacha', 'Rosé, sappig', 'rioja', 'Spanje', 'Rioja', 'Garnacha', 'stil', 'rosé', '{}'::text[], false),
  ('rioja doca|cuatro vientos gran reserva', 'Cuatro Vientos Gran Reserva', 'Rioja DOCa', 2012, 'Tempranillo', 'Rood, complex', 'rioja', 'Spanje', 'Rioja', 'Tempranillo', 'stil', 'rood', array['gran reserva']::text[], false),
  ('marlborough|kowhai bay', 'Kowhai Bay', 'Marlborough', 2023, 'Sauvignon Blanc', 'Wit, uitbundig', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Marlborough', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], false),
  ('marlborough|wairau stone', 'Wairau Stone', 'Marlborough', 2022, 'Pinot Noir', 'Rood, sappig', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Marlborough', 'Pinot Noir', 'stil', 'rood', '{}'::text[], false),
  ('marlborough|cloudy ridge', 'Cloudy Ridge', 'Marlborough', 2023, 'Pinot Noir', 'Rosé, droog', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Marlborough', 'Pinot Noir', 'stil', 'rosé', '{}'::text[], false),
  ('marlborough|tui valley', 'Tui Valley', 'Marlborough', 2022, 'Chardonnay', 'Wit, romig', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Marlborough', 'Chardonnay', 'stil', 'wit', '{}'::text[], false),
  ('marlborough|awatere flint', 'Awatere Flint', 'Marlborough', 2023, 'Sauvignon Blanc', 'Wit, strak', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Marlborough', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], false),
  ('château margelle|château margelle', 'Château Margelle', 'Château Margelle', 2018, 'Cabernet Sauvignon, Merlot', 'Rood, elegant', 'bordeaux', 'Frankrijk', 'Margaux', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('clos du tertre|clos du tertre', 'Clos du Tertre', 'Clos du Tertre', 2017, 'Merlot', 'Rood, fluweelzacht', 'bordeaux', 'Frankrijk', 'Pomerol', 'Merlot', 'stil', 'rood', '{}'::text[], false),
  ('château lusseau|château lusseau', 'Château Lusseau', 'Château Lusseau', 2019, 'Cabernet Sauvignon, Merlot', 'Rood, rokerig', 'bordeaux', 'Frankrijk', 'Pessac-Léognan', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('château doisy-laurent|château doisy-laurent', 'Château Doisy-Laurent', 'Château Doisy-Laurent', 2015, 'Sémillon', 'Wit, zoet', 'bordeaux', 'Frankrijk', 'Sauternes', 'Sémillon', 'zoet', 'wit', '{}'::text[], false),
  ('château rive haute|château rive haute', 'Château Rive Haute', 'Château Rive Haute', 2020, 'Cabernet Sauvignon', 'Rood, stevig', 'bordeaux', 'Frankrijk', 'Haut-Médoc', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('château bel-fronsac|château bel-fronsac', 'Château Bel-Fronsac', 'Château Bel-Fronsac', 2019, 'Merlot', 'Rood, rond', 'bordeaux', 'Frankrijk', 'Fronsac', 'Merlot', 'stil', 'rood', '{}'::text[], false),
  ('domaine des pierres dorées|domaine des pierres dorées', 'Domaine des Pierres Dorées', 'Domaine des Pierres Dorées', 2023, 'Gamay', 'Rood, fruitig', 'beaujolais', 'Frankrijk', 'Beaujolais', 'Gamay', 'stil', 'rood', '{}'::text[], false),
  ('domaine de la côte|domaine de la côte', 'Domaine de la Côte', 'Domaine de la Côte', 2023, 'Gamay', 'Rood, sappig', 'beaujolais', 'Frankrijk', 'Beaujolais-Villages', 'Gamay', 'stil', 'rood', '{}'::text[], false),
  ('domaine vernay|les granits roses', 'Les Granits Roses', 'Domaine Vernay', 2022, 'Gamay', 'Rood, stevig', 'beaujolais', 'Frankrijk', 'Morgon', 'Gamay', 'stil', 'rood', '{}'::text[], false),
  ('domaine aubel|clos des vignes fleuries', 'Clos des Vignes Fleuries', 'Domaine Aubel', 2022, 'Gamay', 'Rood, bloemig', 'beaujolais', 'Frankrijk', 'Fleurie', 'Gamay', 'stil', 'rood', '{}'::text[], false),
  ('château des ailes|vent du moulin', 'Vent du Moulin', 'Château des Ailes', 2021, 'Gamay', 'Rood, vol', 'beaujolais', 'Frankrijk', 'Moulin-à-Vent', 'Gamay', 'stil', 'rood', '{}'::text[], false),
  ('domaine ferrand-aubert|pouilly-fuissé vieilles vignes', 'Pouilly-Fuissé Vieilles Vignes', 'Domaine Ferrand-Aubert', 2021, 'Chardonnay', 'Wit, rijk', 'bourgogne', 'Frankrijk', 'Pouilly-Fuissé', 'Chardonnay', 'stil', 'wit', '{}'::text[], false),
  ('domaine lavigne|givry clos lavigne', 'Givry Clos Lavigne', 'Domaine Lavigne', 2021, 'Pinot Noir', 'Rood, kersig', 'bourgogne', 'Frankrijk', 'Givry', 'Pinot Noir', 'stil', 'rood', '{}'::text[], false),
  ('les galets ronds|les galets ronds', 'Les Galets Ronds', 'Les Galets Ronds', 2022, 'Grenache, Syrah', 'Rood, kruidig', 'rhone', 'Frankrijk', 'Côtes du Rhône', 'Grenache', 'stil', 'rood', '{}'::text[], false),
  ('domaine du mistral|domaine du mistral', 'Domaine du Mistral', 'Domaine du Mistral', 2021, 'Grenache, Syrah', 'Rood, warm', 'rhone', 'Frankrijk', 'Côtes du Rhône Villages', 'Grenache', 'stil', 'rood', '{}'::text[], false),
  ('clos des papes anciens|clos des papes anciens', 'Clos des Papes Anciens', 'Clos des Papes Anciens', 2019, 'Grenache', 'Rood, krachtig', 'rhone', 'Frankrijk', 'Châteauneuf-du-Pape', 'Grenache', 'stil', 'rood', '{}'::text[], false),
  ('domaine de la colline|domaine de la colline', 'Domaine de la Colline', 'Domaine de la Colline', 2021, 'Syrah', 'Rood, peperig', 'rhone', 'Frankrijk', 'Crozes-Hermitage', 'Syrah', 'stil', 'rood', '{}'::text[], false),
  ('domaine brunel|les dentelles', 'Les Dentelles', 'Domaine Brunel', 2020, 'Grenache, Mourvèdre', 'Rood, rijp', 'rhone', 'Frankrijk', 'Gigondas', 'Grenache', 'stil', 'rood', '{}'::text[], false),
  ('domaine roux-bellier|les caillottes', 'Les Caillottes', 'Domaine Roux-Bellier', 2023, 'Sauvignon Blanc', 'Wit, mineraal', 'loire', 'Frankrijk', 'Sancerre', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], false),
  ('château de la ragotière|château de la ragotière', 'Château de la Ragotière', 'Château de la Ragotière', 2023, 'Melon de Bourgogne', 'Wit, zilt', 'loire', 'Frankrijk', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'stil', 'wit', '{}'::text[], false),
  ('domaine desroches|clos fumé', 'Clos Fumé', 'Domaine Desroches', 2022, 'Sauvignon Blanc', 'Wit, rokerig', 'loire', 'Frankrijk', 'Pouilly-Fumé', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], false),
  ('domaine huet-marin|les coteaux', 'Les Coteaux', 'Domaine Huet-Marin', 2022, 'Chenin Blanc', 'Wit, halfdroog', 'loire', 'Frankrijk', 'Vouvray', 'Chenin Blanc', 'stil', 'wit', '{}'::text[], false),
  ('domaine de la bergerie|la bergerie', 'La Bergerie', 'Domaine de la Bergerie', 2021, 'Cabernet Franc', 'Rood, fris', 'loire', 'Frankrijk', 'Chinon', 'Cabernet Franc', 'stil', 'rood', '{}'::text[], false),
  ('caves de saumur|brut ligérien', 'Brut Ligérien', 'Caves de Saumur', 2021, 'Chenin Blanc', 'Mousserend, droog', 'loire', 'Frankrijk', 'Crémant de Loire', 'Chenin Blanc', 'mousserend', 'wit', array['crémant']::text[], false),
  ('fattoria il leccio|fattoria il leccio', 'Fattoria Il Leccio', 'Fattoria Il Leccio', 2022, 'Sangiovese', 'Rood, kersig', 'toscane', 'Italië', 'Chianti', 'Sangiovese', 'stil', 'rood', '{}'::text[], false),
  ('podere le querce|podere le querce', 'Podere Le Querce', 'Podere Le Querce', 2020, 'Sangiovese', 'Rood, elegant', 'toscane', 'Italië', 'Vino Nobile di Montepulciano', 'Sangiovese', 'stil', 'rood', '{}'::text[], false),
  ('tenuta mare alto|tenuta mare alto', 'Tenuta Mare Alto', 'Tenuta Mare Alto', 2019, 'Cabernet Sauvignon, Merlot', 'Rood, vol', 'toscane', 'Italië', 'Bolgheri', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('bodegas el ciervo|el ciervo joven', 'El Ciervo Joven', 'Bodegas El Ciervo', 2023, 'Tempranillo', 'Rood, fruitig', 'rioja', 'Spanje', 'Rioja', 'Tempranillo', 'stil', 'rood', array['joven','rioja alavesa']::text[], false),
  ('kererū ridge|kererū ridge', 'Kererū Ridge', 'Kererū Ridge', 2021, 'Pinot Noir', 'Rood, zijdezacht', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Central Otago', 'Pinot Noir', 'stil', 'rood', '{}'::text[], false),
  ('gannet bay|gannet bay syrah', 'Gannet Bay Syrah', 'Gannet Bay', 2020, 'Syrah', 'Rood, peperig', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Hawke''s Bay', 'Syrah', 'stil', 'rood', '{}'::text[], false),
  ('maison arlaux-prévost|brut réserve', 'Brut Réserve', 'Maison Arlaux-Prévost', null, 'Chardonnay, Pinot Noir, Meunier', 'Mousserend, droog', 'champagne', 'Frankrijk', 'Champagne', null, 'mousserend', 'wit', '{}'::text[], false),
  ('champagne delorme|blanc de blancs', 'Blanc de Blancs', 'Champagne Delorme', null, 'Chardonnay', 'Mousserend, fijn', 'champagne', 'Frankrijk', 'Champagne', 'Chardonnay', 'mousserend', 'wit', '{}'::text[], false),
  ('caves montserrat|brut nature', 'Brut Nature', 'Caves Montserrat', null, 'Xarel·lo, Macabeo, Parellada', 'Mousserend, droog', 'penedes', 'Spanje', 'Cava', null, 'mousserend', 'wit', '{}'::text[], false),
  ('colli trevigiani|extra dry', 'Extra Dry', 'Colli Trevigiani', null, 'Glera', 'Mousserend, fruitig', 'veneto', 'Italië', 'Prosecco', 'Glera', 'mousserend', 'wit', '{}'::text[], false),
  ('quinta do vale escuro|quinta do vale escuro', 'Quinta do Vale Escuro', 'Quinta do Vale Escuro', 2020, 'Touriga Nacional', 'Rood, donker', 'douro', 'Portugal', 'Douro', 'Touriga Nacional', 'stil', 'rood', '{}'::text[], false),
  ('weingut steinbach|steinbach riesling', 'Steinbach Riesling', 'Weingut Steinbach', 2022, 'Riesling', 'Wit, fris', 'mosel', 'Duitsland', 'Mosel', 'Riesling', 'stil', 'wit', '{}'::text[], false),
  ('weingut hollerbach|spätburgunder kalkstein', 'Spätburgunder Kalkstein', 'Weingut Hollerbach', 2021, 'Pinot Noir', 'Rood, licht', 'pfalz', 'Duitsland', 'Pfalz', 'Pinot Noir', 'stil', 'rood', '{}'::text[], false),
  ('wijngaard de heuvelrug|heuvelrug wit', 'Heuvelrug Wit', 'Wijngaard De Heuvelrug', 2023, 'Solaris', 'Wit, fris', 'nederland', 'Nederland', 'Nederland', 'Solaris', 'stil', 'wit', '{}'::text[], false),
  ('oak valley estate|stellenbosch oak cabernet', 'Stellenbosch Oak Cabernet', 'Oak Valley Estate', 2020, 'Cabernet Sauvignon', 'Rood, stevig', 'stellenbosch', 'Zuid-Afrika', 'Stellenbosch', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('walker cove|walker cove chardonnay', 'Walker Cove Chardonnay', 'Walker Cove', 2022, 'Chardonnay', 'Wit, elegant', 'walker-bay', 'Zuid-Afrika', 'Hemel-en-Aarde', 'Chardonnay', 'stil', 'wit', '{}'::text[], false),
  ('kaapse ster|kaapse ster brut', 'Kaapse Ster Brut', 'Kaapse Ster', null, 'Chardonnay, Pinot Noir', 'Mousserend, droog', 'stellenbosch', 'Zuid-Afrika', 'Cap Classique', null, 'mousserend', 'wit', '{}'::text[], false),
  ('viña cordillera|cordillera cabernet', 'Cordillera Cabernet', 'Viña Cordillera', 2021, 'Cabernet Sauvignon', 'Rood, rond', 'maipo', 'Chili', 'Maipo', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('viña costa fría|costa fría', 'Costa Fría', 'Viña Costa Fría', 2023, 'Sauvignon Blanc', 'Wit, fris', 'casablanca', 'Chili', 'Casablanca', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], false),
  ('bodega alto andes|alto andes malbec', 'Alto Andes Malbec', 'Bodega Alto Andes', 2021, 'Malbec', 'Rood, vol', 'mendoza', 'Argentinië', 'Mendoza', 'Malbec', 'stil', 'rood', '{}'::text[], false),
  ('redwood crest|redwood crest chardonnay', 'Redwood Crest Chardonnay', 'Redwood Crest', 2021, 'Chardonnay', 'Wit, romig', 'californie', 'Verenigde Staten', 'Sonoma', 'Chardonnay', 'stil', 'wit', '{}'::text[], false),
  ('napa bench cellars|napa bench cabernet', 'Napa Bench Cabernet', 'Napa Bench Cellars', 2019, 'Cabernet Sauvignon', 'Rood, krachtig', 'californie', 'Verenigde Staten', 'Napa Valley', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], false),
  ('red gum estate|red gum shiraz', 'Red Gum Shiraz', 'Red Gum Estate', 2020, 'Shiraz', 'Rood, vol', 'barossa', 'Australië', 'Barossa Valley', 'Syrah', 'stil', 'rood', '{}'::text[], false),
  ('weingut pölzl|steirische klassik', 'Steirische Klassik', 'Weingut Pölzl', 2022, 'Sauvignon Blanc', 'Wit, fris', 'steiermark', 'Oostenrijk', 'Südsteiermark', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], false),
  ('chalk downs|chalk downs brut', 'Chalk Downs Brut', 'Chalk Downs', null, 'Chardonnay, Pinot Noir', 'Mousserend, strak', 'sussex', 'Verenigd Koninkrijk', 'Sussex', null, 'mousserend', 'wit', '{}'::text[], false),
  ('cloudy bay|cloudy bay sauvignon blanc', 'Cloudy Bay Sauvignon Blanc', 'Cloudy Bay', 2023, 'Sauvignon Blanc', 'Wit, uitbundig', 'nieuw-zeeland', 'Nieuw-Zeeland', 'Marlborough', 'Sauvignon Blanc', 'stil', 'wit', '{}'::text[], true),
  ('marchesi antinori|tignanello', 'Tignanello', 'Marchesi Antinori', 2020, 'Sangiovese, Cabernet Sauvignon', 'Rood, vol', 'toscane', 'Italië', 'Toscana IGT', 'Sangiovese', 'stil', 'rood', '{}'::text[], true),
  ('moët & chandon|dom pérignon', 'Dom Pérignon', 'Moët & Chandon', 2013, 'Chardonnay, Pinot Noir', 'Mousserend, verfijnd', 'champagne', 'Frankrijk', 'Champagne', null, 'mousserend', 'wit', '{}'::text[], true),
  ('krug|krug grande cuvée', 'Krug Grande Cuvée', 'Krug', null, 'Pinot Noir, Chardonnay, Meunier', 'Mousserend, rijk', 'champagne', 'Frankrijk', 'Champagne', null, 'mousserend', 'wit', '{}'::text[], true),
  ('tenuta san guido|sassicaia', 'Sassicaia', 'Tenuta San Guido', 2019, 'Cabernet Sauvignon, Cabernet Franc', 'Rood, elegant', 'toscane', 'Italië', 'Bolgheri Sassicaia', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], true),
  ('vega sicilia|vega sicilia único', 'Vega Sicilia Único', 'Vega Sicilia', 2012, 'Tempranillo, Cabernet Sauvignon', 'Rood, complex', 'ribera', 'Spanje', 'Ribera del Duero', 'Tempranillo', 'stil', 'rood', '{}'::text[], true),
  ('château d''yquem|château d''yquem', 'Château d''Yquem', 'Château d''Yquem', 2015, 'Sémillon, Sauvignon Blanc', 'Wit, zoet', 'bordeaux', 'Frankrijk', 'Sauternes', 'Sémillon', 'zoet', 'wit', '{}'::text[], true),
  ('penfolds|penfolds grange', 'Penfolds Grange', 'Penfolds', 2018, 'Shiraz', 'Rood, krachtig', 'barossa', 'Australië', 'South Australia', 'Syrah', 'stil', 'rood', '{}'::text[], true),
  ('opus one|opus one', 'Opus One', 'Opus One', 2019, 'Cabernet Sauvignon, Merlot', 'Rood, vol', 'californie', 'Verenigde Staten', 'Napa Valley', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], true),
  ('château margaux|château margaux', 'Château Margaux', 'Château Margaux', 2015, 'Cabernet Sauvignon, Merlot', 'Rood, verfijnd', 'bordeaux', 'Frankrijk', 'Margaux', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[], true),
  ('pétrus|pétrus', 'Pétrus', 'Pétrus', 2016, 'Merlot', 'Rood, fluweelzacht', 'bordeaux', 'Frankrijk', 'Pomerol', 'Merlot', 'stil', 'rood', '{}'::text[], true),
  ('domaine de la romanée-conti|romanée-conti', 'Romanée-Conti', 'Domaine de la Romanée-Conti', 2018, 'Pinot Noir', 'Rood, legendarisch', 'bourgogne', 'Frankrijk', 'Romanée-Conti Grand Cru', 'Pinot Noir', 'stil', 'rood', '{}'::text[], true)
),
upd as (
  update public.wines w set
    regio = v.regio, land = v.land, appellation = v.appellation, grape = v.grape,
    style = v.style, color = v.color, tags = v.tags, is_icon = v.is_icon
  from v where w.wine_key = v.wine_key
  returning w.wine_key
)
insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags, is_icon, variant)
select v.wine_key, v.naam, v.maker, v.jaar, v.druif, v.stijl, v.regio, v.land, v.appellation, v.grape, v.style, v.color, v.tags, v.is_icon, (abs(hashtext(v.wine_key)) % 4)
from v
where v.is_icon and not exists (select 1 from upd where upd.wine_key = v.wine_key)
on conflict (wine_key) do nothing;
