-- =====================================================================
-- Vined It database – migratie 016: de twintig Legendes
-- Draai NA 015. Plak in Supabase → SQL Editor → Run. Veilig om opnieuw te draaien.
--
-- De topklasse heet nu "Legende" (intern blijft het 'icon'). Alleen deze twintig
-- wijnen zijn een Legende; de prijs telt daarbij niet. Cloudy Bay, Tignanello,
-- Dom Pérignon, Krug, Sassicaia en Opus One zijn geen Legende meer: hun klasse
-- komt voortaan uit de formule, en de app geeft ze het stempel "Icoon".
-- Een dure wijn met "iconic" wordt niet meer vanzelf de topklasse.
-- De uitleg ("Waarom Rare?") noemt de prijs voortaan in woorden, geen bedrag.
-- =====================================================================

-- 1. Formule: de topklasse alleen via de vaste lijst
create or replace function public.wine_tier(p_s jsonb, p_jaar int, p_color text, p_is_icon boolean)
returns jsonb
language plpgsql
stable
as $$
declare
  lo numeric := nullif(p_s->>'price_eur_low','')::numeric;
  hi numeric := nullif(p_s->>'price_eur_high','')::numeric;
  p  numeric;
  pp numeric;
  plus numeric := 0;
  minus numeric := 0;
  total numeric;
  tier text;
  why text[] := '{}';
  age int;
  old boolean := false;
  vq text := coalesce(p_s->>'vintage_quality','onbekend');
begin
  if lo is not null or hi is not null then p := (coalesce(lo,hi) + coalesce(hi,lo)) / 2; end if;
  -- Anker: prijs in een Nederlandse winkel (75 cl)
  pp := (case when p is null then 0 when p < 12 then 0 when p < 20 then 0.5 when p < 35 then 1
              when p < 60 then 1.5 when p < 100 then 2 when p < 200 then 2.5 when p < 400 then 3 else 3.5 end);

  -- Bonussen (samen max. 0,75)
  plus := plus + (case p_s->>'classification' when 'top' then 0.25 when 'premium' then 0.1 else 0 end);
  plus := plus + (case p_s->>'producer_fame' when 'wereldberoemd' then 0.25 when 'gerenommeerd' then 0.1 else 0 end);
  plus := plus + (case p_s->>'production' when 'zeer klein' then 0.25 when 'klein' then 0.1 else 0 end);
  plus := plus + (case p_s->>'rarity_nl' when 'zeldzaam' then 0.4 when 'ongewoon' then 0.15 else 0 end);
  plus := plus + (case vq when 'top' then 0.25 when 'goed' then 0.1 else 0 end);
  if p_jaar is not null then
    age := extract(year from now())::int - p_jaar;
    old := age >= (case when p_color = 'wit' then 10 else 15 end);
    if old then plus := plus + 0.25; end if;
  end if;
  if coalesce((p_s->>'large_format')::boolean, false) then plus := plus + 0.25; end if;
  plus := least(plus, 0.75);

  -- Minpunten (samen max. -0,5)
  minus := minus + (case when p_s->>'producer_fame' = 'merk' then 0.25 else 0 end);
  minus := minus + (case when p_s->>'production' = 'massa' then 0.25 else 0 end);
  minus := minus + (case when vq = 'slecht' then 0.25 else 0 end);
  minus := least(minus, 0.5);

  total := pp + plus - minus;
  tier := (case when total >= 3 then 'ultra' when total >= 2 then 'superrare' when total >= 1 then 'rare' else 'common' end);
  -- Legende: alleen de twintig wijnen uit de vaste lijst (prijs telt niet)
  if p_is_icon then tier := 'icon'; end if;

  -- Uitleg in gewone taal (max. 4 onderdelen)
  -- Prijs als woord, niet als bedrag: vrienden kijken mee in je album
  if p is not null then why := why || (case when p < 12 then 'betaalbaar' when p < 25 then 'toegankelijk geprijsd'
       when p < 60 then 'middenklasse' when p < 200 then 'hogere prijsklasse' else 'topprijsklasse' end)::text; end if;
  if p_s->>'producer_fame' = 'wereldberoemd' then why := why || 'wereldberoemd huis'::text;
  elsif p_s->>'producer_fame' = 'gerenommeerd' then why := why || 'gerenommeerde maker'::text; end if;
  if p_s->>'classification' = 'top' then why := why || 'topclassificatie'::text;
  elsif p_s->>'classification' = 'premium' then why := why || 'cru/reserva-niveau'::text; end if;
  if p_s->>'rarity_nl' = 'zeldzaam' then why := why || 'zeldzaam in Nederland'::text;
  elsif p_s->>'rarity_nl' = 'ongewoon' then why := why || 'ongewoon in Nederland'::text; end if;
  if vq = 'top' then why := why || ('topjaar' || coalesce(' ' || p_jaar, ''));
  elsif vq = 'slecht' then why := why || ('zwak jaar' || coalesce(' ' || p_jaar, '')); end if;
  if p_s->>'production' in ('klein', 'zeer klein') then why := why || 'kleine oplage'::text; end if;
  if old then why := why || 'oude fles'::text; end if;
  if coalesce((p_s->>'large_format')::boolean, false) then why := why || 'grootformaat'::text; end if;
  if p_s->>'producer_fame' = 'merk' and tier = 'common' then why := why || 'bekend merk, ruim verkrijgbaar'::text; end if;

  return jsonb_build_object('tier', tier, 'reason', array_to_string(why[1:4], ' · '), 'score', round(total, 2));
end;
$$;

-- 2. De twintig Legendes (bestaan ze al, dan worden ze Legende)
with v (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags) as (values
  ('vega sicilia|vega sicilia único', 'Vega Sicilia Único', 'Vega Sicilia', 2012, 'Tempranillo, Cabernet Sauvignon', 'Rood, complex', 'ribera', 'Spanje', 'Ribera del Duero', 'Tempranillo', 'stil', 'rood', '{}'::text[]),
  ('domaine leroy|musigny', 'Musigny', 'Domaine Leroy', 2015, 'Pinot Noir', 'Rood, verfijnd', 'bourgogne', 'Frankrijk', 'Musigny Grand Cru', 'Pinot Noir', 'stil', 'rood', '{}'::text[]),
  ('le pin|le pin', 'Le Pin', 'Le Pin', 2016, 'Merlot', 'Rood, fluweelzacht', 'bordeaux', 'Frankrijk', 'Pomerol', 'Merlot', 'stil', 'rood', '{}'::text[]),
  ('château lafite rothschild|château lafite rothschild', 'Château Lafite Rothschild', 'Château Lafite Rothschild', 2016, 'Cabernet Sauvignon, Merlot', 'Rood, verfijnd', 'bordeaux', 'Frankrijk', 'Pauillac', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[]),
  ('château mouton rothschild|château mouton rothschild', 'Château Mouton Rothschild', 'Château Mouton Rothschild', 2016, 'Cabernet Sauvignon, Merlot', 'Rood, vol', 'bordeaux', 'Frankrijk', 'Pauillac', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[]),
  ('château cheval blanc|château cheval blanc', 'Château Cheval Blanc', 'Château Cheval Blanc', 2015, 'Cabernet Franc, Merlot', 'Rood, elegant', 'bordeaux', 'Frankrijk', 'Saint-Émilion Grand Cru', 'Cabernet Franc', 'stil', 'rood', '{}'::text[]),
  ('salon|salon le mesnil', 'Salon Le Mesnil', 'Salon', 2013, 'Chardonnay', 'Mousserend, strak', 'champagne', 'Frankrijk', 'Champagne', 'Chardonnay', 'mousserend', 'wit', '{millésime,prestige,blanc de blancs}'::text[]),
  ('château rayas|château rayas', 'Château Rayas', 'Château Rayas', 2017, 'Grenache', 'Rood, verfijnd', 'rhone', 'Frankrijk', 'Châteauneuf-du-Pape', 'Grenache', 'stil', 'rood', '{}'::text[]),
  ('masseto|masseto', 'Masseto', 'Masseto', 2018, 'Merlot', 'Rood, vol', 'toscane', 'Italië', 'Toscana IGT', 'Merlot', 'stil', 'rood', '{}'::text[]),
  ('biondi-santi|brunello di montalcino riserva', 'Brunello di Montalcino Riserva', 'Biondi-Santi', 2015, 'Sangiovese', 'Rood, stevig', 'toscane', 'Italië', 'Brunello di Montalcino', 'Sangiovese', 'stil', 'rood', '{}'::text[]),
  ('giacomo conterno|barolo monfortino riserva', 'Barolo Monfortino Riserva', 'Giacomo Conterno', 2015, 'Nebbiolo', 'Rood, stevig', 'piemonte', 'Italië', 'Barolo', 'Nebbiolo', 'stil', 'rood', '{}'::text[]),
  ('dominio de pingus|pingus', 'Pingus', 'Dominio de Pingus', 2019, 'Tempranillo', 'Rood, krachtig', 'ribera', 'Spanje', 'Ribera del Duero', 'Tempranillo', 'stil', 'rood', '{}'::text[]),
  ('egon müller|scharzhofberger riesling trockenbeerenauslese', 'Scharzhofberger Riesling Trockenbeerenauslese', 'Egon Müller', 2018, 'Riesling', 'Wit, edelzoet', 'mosel', 'Duitsland', 'Saar', 'Riesling', 'zoet', 'wit', '{}'::text[]),
  ('screaming eagle|screaming eagle cabernet sauvignon', 'Screaming Eagle Cabernet Sauvignon', 'Screaming Eagle', 2019, 'Cabernet Sauvignon', 'Rood, vol', 'californie', 'Verenigde Staten', 'Napa Valley', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[]),
  ('quinta do noval|quinta do noval nacional', 'Quinta do Noval Nacional', 'Quinta do Noval', 2017, 'Touriga Nacional, Touriga Franca', 'Versterkt, zoet', 'douro', 'Portugal', 'Porto', 'Touriga Nacional', 'versterkt', 'rood', '{}'::text[]),
  ('château d''yquem|château d''yquem', 'Château d''Yquem', 'Château d''Yquem', 2015, 'Sémillon, Sauvignon Blanc', 'Wit, zoet', 'bordeaux', 'Frankrijk', 'Sauternes', 'Sémillon', 'zoet', 'wit', '{}'::text[]),
  ('penfolds|penfolds grange', 'Penfolds Grange', 'Penfolds', 2018, 'Shiraz', 'Rood, krachtig', 'barossa', 'Australië', 'South Australia', 'Syrah', 'stil', 'rood', '{}'::text[]),
  ('château margaux|château margaux', 'Château Margaux', 'Château Margaux', 2015, 'Cabernet Sauvignon, Merlot', 'Rood, verfijnd', 'bordeaux', 'Frankrijk', 'Margaux', 'Cabernet Sauvignon', 'stil', 'rood', '{}'::text[]),
  ('pétrus|pétrus', 'Pétrus', 'Pétrus', 2016, 'Merlot', 'Rood, fluweelzacht', 'bordeaux', 'Frankrijk', 'Pomerol', 'Merlot', 'stil', 'rood', '{}'::text[]),
  ('domaine de la romanée-conti|romanée-conti', 'Romanée-Conti', 'Domaine de la Romanée-Conti', 2018, 'Pinot Noir', 'Rood, legendarisch', 'bourgogne', 'Frankrijk', 'Romanée-Conti Grand Cru', 'Pinot Noir', 'stil', 'rood', '{}'::text[])
),
upd as (
  update public.wines w set is_icon = true,
    regio = v.regio, land = v.land, appellation = v.appellation, grape = v.grape,
    style = v.style, color = v.color, tags = v.tags
  from v where w.wine_key = v.wine_key
  returning w.wine_key
)
insert into public.wines (wine_key, naam, maker, jaar, druif, stijl, regio, land, appellation, grape, style, color, tags, is_icon, variant)
select v.wine_key, v.naam, v.maker, v.jaar, v.druif, v.stijl, v.regio, v.land, v.appellation, v.grape, v.style, v.color, v.tags, true, (abs(hashtext(v.wine_key)) % 4)
from v
where not exists (select 1 from upd where upd.wine_key = v.wine_key)
on conflict (wine_key) do update set is_icon = true;

-- 3. Zes oude topwijnen worden gewone klassen
update public.wines set is_icon = false
 where wine_key in ('cloudy bay|cloudy bay sauvignon blanc', 'marchesi antinori|tignanello', 'moët & chandon|dom pérignon',
                    'krug|krug grande cuvée', 'tenuta san guido|sassicaia', 'opus one|opus one');

-- 4. Klasse opnieuw berekenen voor alle wijnen met signalen
update public.wines w
   set tier = t->>'tier', tier_reason = t->>'reason'
  from (select id, public.wine_tier(signals, jaar, color, coalesce(is_icon, false)) as t
          from public.wines where signals is not null) x
 where w.id = x.id;

-- Zonder signalen (nooit echt gescand): een vaste klasse
update public.wines w set tier = v.tier
  from (values ('cloudy bay|cloudy bay sauvignon blanc', 'rare'), ('marchesi antinori|tignanello', 'superrare'),
               ('moët & chandon|dom pérignon', 'ultra'), ('krug|krug grande cuvée', 'ultra'),
               ('tenuta san guido|sassicaia', 'ultra'), ('opus one|opus one', 'ultra')) v (wine_key, tier)
 where w.wine_key = v.wine_key and w.signals is null;
update public.wines set tier = 'icon' where is_icon and signals is null;
-- Een eerder dure "iconic" wijn die geen Legende is, zonder herberekening: Ultra
update public.wines set tier = 'ultra' where tier = 'icon' and not is_icon;
update public.wines set tier_override = 'ultra' where tier_override = 'icon' and not is_icon;

-- 5. Kaarten volgen hun wijn
update public.cards c
   set tier = case when w.is_icon then 'icon' else coalesce(w.tier_override, w.tier) end
  from public.wines w
 where c.wine_id = w.id
   and (w.is_icon or coalesce(w.tier_override, w.tier) is not null)
   and c.tier is distinct from (case when w.is_icon then 'icon' else coalesce(w.tier_override, w.tier) end);

-- Resultaat: welke wijnen zijn nu Legende, en waar staan de zes oude topwijnen?
select naam, coalesce(tier_override, tier) as klasse, is_icon as legende
  from public.wines
 where is_icon or wine_key in ('cloudy bay|cloudy bay sauvignon blanc', 'marchesi antinori|tignanello', 'moët & chandon|dom pérignon',
                               'krug|krug grande cuvée', 'tenuta san guido|sassicaia', 'opus one|opus one')
 order by is_icon desc, naam;
