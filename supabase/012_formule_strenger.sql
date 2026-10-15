-- =====================================================================
-- Vined It database – migratie 012: strengere klasseformule
-- Draai NA 011. Plak in Supabase → SQL Editor → Run. Veilig om opnieuw te draaien.
--
-- Waarom: de eerste formule stapelde te veel kleine bonussen. Een wijn van €10
-- met "goed jaar" werd al Rare, en 23 van de 56 wijnen werden Super Rare.
-- Nieuw: de prijs is het anker. Alle bonussen samen tellen voor hooguit
-- 0,75 punt (minder dan één klasse), minpunten voor hooguit -0,5.
-- Het recept wordt opnieuw toegepast op de opgeslagen signalen: geen
-- Claude-aanroep nodig, gratis en direct.
-- =====================================================================

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
  if p_is_icon or (coalesce((p_s->>'iconic')::boolean, false) and coalesce(p, 0) >= 300) then tier := 'icon'; end if;

  -- Uitleg in gewone taal (max. 4 onderdelen)
  if p is not null then why := why || ('±€' || (case when p < 100 then round(p) else round(p / 10) * 10 end)::text); end if;
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

-- Opnieuw toepassen op alle wijnen met opgeslagen signalen
update public.wines w
   set tier = t->>'tier', tier_reason = t->>'reason'
  from (select id, public.wine_tier(signals, jaar, color, coalesce(is_icon, false)) as t
          from public.wines where signals is not null) x
 where w.id = x.id;

-- Kaarten volgen hun wijn (een handmatige vastzetting gaat voor)
update public.cards c
   set tier = coalesce(w.tier_override, w.tier)
  from public.wines w
 where c.wine_id = w.id and coalesce(w.tier_override, w.tier) is not null
   and c.tier is distinct from coalesce(w.tier_override, w.tier);

-- Resultaat: nieuwe verdeling
select coalesce(tier_override, tier, '(nog niet beoordeeld)') as klasse,
       count(*) as aantal,
       string_agg(naam || ' (' || coalesce(tier_reason,'-') || ')', '  |  ' order by naam) as wijnen
  from public.wines
 group by 1
 order by array_position(array['common','rare','superrare','ultra','icon','(nog niet beoordeeld)'], coalesce(tier_override, tier, '(nog niet beoordeeld)'));
