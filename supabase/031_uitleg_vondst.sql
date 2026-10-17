-- Uitleg van de klasse: hoe makkelijk de fles te vinden is (geen prijsoordeel), jargon opgeschoond
create or replace function public.wine_tier(p_s jsonb, p_jaar integer, p_color text, p_is_icon boolean)
returns jsonb language plpgsql stable as $function$
declare
  lo numeric := nullif(p_s->>'price_eur_low','')::numeric;
  hi numeric := nullif(p_s->>'price_eur_high','')::numeric;
  p numeric; pp numeric; plus numeric := 0; minus numeric := 0; total numeric; tier text;
  why text[] := '{}';
  age int; old boolean := false;
  vq text := coalesce(p_s->>'vintage_quality','onbekend');
  shops int := nullif(p_s->>'nl_shops','')::int;
  critic int := nullif(p_s->>'critic_max','')::int;
  vcount int := nullif(p_s->>'vivino_count','')::int;
  aw text := p_s->>'ageworthy';
  peak boolean := coalesce((p_s->>'past_peak')::boolean, false);
  iconic boolean := coalesce((p_s->>'iconic')::boolean, false);
begin
  if lo is not null or hi is not null then p := (coalesce(lo,hi) + coalesce(hi,lo)) / 2; end if;
  -- Anker: prijs van deze jaargang (75 cl)
  pp := (case when p is null then 0 when p < 12 then 0 when p < 20 then 0.5 when p < 35 then 1
              when p < 60 then 1.5 when p < 100 then 2 when p < 200 then 2.5 when p < 400 then 3 else 3.5 end);

  -- Bonussen (samen max. 1)
  plus := plus + (case p_s->>'classification' when 'top' then 0.25 when 'premium' then 0.1 else 0 end);
  plus := plus + (case p_s->>'producer_fame' when 'wereldberoemd' then 0.25 when 'gerenommeerd' then 0.1 else 0 end);
  plus := plus + (case p_s->>'production' when 'zeer klein' then 0.25 when 'klein' then 0.1 else 0 end);
  -- Zeldzaam in NL: inschatting (na opzoeken), maar nooit als hij bij een keten/supermarkt of in 4+ NL-webshops ligt
  if coalesce(shops, 0) < 4 then
    plus := plus + (case p_s->>'rarity_nl' when 'zeldzaam' then 0.4 when 'ongewoon' then 0.15 else 0 end);
  end if;
  plus := plus + (case vq when 'top' then 0.25 when 'goed' then 0.1 else 0 end);
  plus := plus + (case when critic >= 95 then 0.25 when critic >= 92 then 0.1 else 0 end);
  if iconic then plus := plus + 0.25; end if;
  -- Oude fles: alleen een bonus voor bewaarwijnen die nog niet over hun hoogtepunt zijn
  if p_jaar is not null then
    age := extract(year from now())::int - p_jaar;
    old := age >= (case when p_color = 'wit' then 10 else 15 end);
    if old and not peak and (aw is null or aw = 'true') then plus := plus + 0.25; else old := false; end if;
  end if;
  if coalesce((p_s->>'large_format')::boolean, false) then plus := plus + 0.25; end if;
  plus := least(plus, 1);

  -- Minpunten (samen max. -0,5)
  minus := minus + (case when p_s->>'producer_fame' = 'merk' then 0.25 else 0 end);
  minus := minus + (case when p_s->>'production' = 'massa' then 0.25 else 0 end);
  minus := minus + (case when vq = 'slecht' then 0.25 else 0 end);
  minus := minus + (case when vcount >= 25000 then 0.1 else 0 end);
  minus := least(minus, 0.5);

  total := pp + plus - minus;
  tier := (case when total >= 3 then 'ultra' when total >= 2 then 'superrare' when total >= 1 then 'rare' else 'common' end);
  if p_is_icon then tier := 'icon'; end if;

  -- Uitleg in gewone taal (max. 4 onderdelen); prijs als woord
  if p is not null then why := why || (case when p < 12 then 'makkelijk te vinden' when p < 25 then 'een goede ontdekking'
       when p < 60 then 'lastig op te sporen' when p < 200 then 'een echte vondst' else 'een zeldzame vondst' end)::text; end if;
  if iconic then why := why || 'iconische wijn'::text; end if;
  if p_s->>'producer_fame' = 'wereldberoemd' then why := why || 'wereldberoemd huis'::text;
  elsif p_s->>'producer_fame' = 'gerenommeerd' then why := why || 'gerenommeerde maker'::text; end if;
  if critic >= 95 then why := why || 'topscores van critici'::text; elsif critic >= 92 then why := why || 'hoge critici-scores'::text; end if;
  if p_s->>'classification' = 'top' then why := why || 'hoogste classificatie'::text;
  elsif p_s->>'classification' = 'premium' then why := why || 'een reserva of cru'::text; end if;
  if coalesce(shops, 0) < 4 and p_s->>'rarity_nl' = 'zeldzaam' then why := why || 'amper in Nederlandse winkels'::text;
  elsif coalesce(shops, 0) < 4 and p_s->>'rarity_nl' = 'ongewoon' then why := why || 'weinig in Nederlandse winkels'::text; end if;
  if vq = 'top' then why := why || ('topjaar' || coalesce(' ' || p_jaar, ''));
  elsif vq = 'slecht' then why := why || ('moeilijk wijnjaar' || coalesce(' ' || p_jaar, '')); end if;
  if p_s->>'production' in ('klein', 'zeer klein') then why := why || 'kleine oplage'::text; end if;
  if old then why := why || 'bewaarwijn op leeftijd'::text; end if;
  if coalesce((p_s->>'large_format')::boolean, false) then why := why || 'magnum of groter'::text; end if;
  if p_s->>'producer_fame' = 'merk' and tier = 'common' then why := why || 'bekende naam'::text; end if;

  return jsonb_build_object('tier', tier, 'reason', array_to_string(why[1:4], ' · '), 'score', round(total, 2));
end;
$function$;
