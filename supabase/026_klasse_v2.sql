-- Klasse v2: gecontroleerde gegevens van internet (prijs van dít jaar, NL-webshops, critici, bewaarwijn)
-- Ouderdom telt alleen nog bij bewaarwijnen die niet over hun hoogtepunt zijn; de marktprijs van de jaargang doet de rest.

alter table public.ai_usage add column if not exists web_searches int not null default 0;

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
  -- Zeldzaam in NL: gemeten (aantal NL-webshops) gaat voor de schatting
  if shops is not null then
    plus := plus + (case when shops = 0 then 0.4 when shops <= 3 then 0.25 when shops <= 10 then 0.1 else 0 end);
  else
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
  if p is not null then why := why || (case when p < 12 then 'betaalbaar' when p < 25 then 'toegankelijk geprijsd'
       when p < 60 then 'middenklasse' when p < 200 then 'hogere prijsklasse' else 'topprijsklasse' end)::text; end if;
  if iconic then why := why || 'iconische wijn'::text; end if;
  if p_s->>'producer_fame' = 'wereldberoemd' then why := why || 'wereldberoemd huis'::text;
  elsif p_s->>'producer_fame' = 'gerenommeerd' then why := why || 'gerenommeerde maker'::text; end if;
  if critic >= 95 then why := why || 'topscores van critici'::text; elsif critic >= 92 then why := why || 'hoge critici-scores'::text; end if;
  if p_s->>'classification' = 'top' then why := why || 'topclassificatie'::text;
  elsif p_s->>'classification' = 'premium' then why := why || 'cru/reserva-niveau'::text; end if;
  if shops = 0 then why := why || 'nauwelijks te koop in Nederland'::text;
  elsif shops is not null and shops <= 3 then why := why || 'zeldzaam in Nederland'::text;
  elsif shops is null and p_s->>'rarity_nl' = 'zeldzaam' then why := why || 'zeldzaam in Nederland'::text;
  elsif shops is null and p_s->>'rarity_nl' = 'ongewoon' then why := why || 'ongewoon in Nederland'::text; end if;
  if vq = 'top' then why := why || ('topjaar' || coalesce(' ' || p_jaar, ''));
  elsif vq = 'slecht' then why := why || ('zwak jaar' || coalesce(' ' || p_jaar, '')); end if;
  if p_s->>'production' in ('klein', 'zeer klein') then why := why || 'kleine oplage'::text; end if;
  if old then why := why || 'bewaarwijn op leeftijd'::text; end if;
  if coalesce((p_s->>'large_format')::boolean, false) then why := why || 'grootformaat'::text; end if;
  if p_s->>'producer_fame' = 'merk' and tier = 'common' then why := why || 'bekend merk, ruim verkrijgbaar'::text; end if;

  return jsonb_build_object('tier', tier, 'reason', array_to_string(why[1:4], ' · '), 'score', round(total, 2));
end;
$function$;

-- Beheer: nieuwe (gecontroleerde) signalen toepassen; kaarten volgen, behalve bij handmatige klasse of Legende
create or replace function public.admin_apply_signals(p_wine uuid, p_signals jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.wines; t jsonb; old_t text; new_t text;
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into w from public.wines where id = p_wine;
  if w.id is null then raise exception 'not_found'; end if;
  old_t := case when w.is_icon then 'icon' else coalesce(w.tier_override, w.tier) end;
  t := public.wine_tier(p_signals, w.jaar, w.color, coalesce(w.is_icon, false));
  update public.wines set signals = p_signals, tier = t->>'tier', tier_reason = t->>'reason' where id = w.id returning * into w;
  new_t := case when w.is_icon then 'icon' else coalesce(w.tier_override, w.tier) end;
  if new_t is not null then update public.cards set tier = new_t where wine_id = w.id; end if;
  return jsonb_build_object('old', old_t, 'tier', new_t, 'reason', t->>'reason', 'score', t->'score');
end $$;
revoke all on function public.admin_apply_signals(uuid, jsonb) from public, anon;
grant execute on function public.admin_apply_signals(uuid, jsonb) to authenticated;

-- Kosten van zoekopdrachten ($10 per 1000) meetellen in de AI-kosten
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $function$
declare r jsonb;
begin
  if not public.vi_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select jsonb_build_object(
    'users', (select count(*) from public.collectors),
    'active7', (select count(distinct user_id) from public.recognitions where created_at > now() - interval '7 days'),
    'active30', (select count(distinct user_id) from public.recognitions where created_at > now() - interval '30 days'),
    'new7', (select count(*) from public.collectors where created_at > now() - interval '7 days'),
    'cards', (select count(*) from public.cards),
    'cards7', (select count(*) from public.cards where created_at > now() - interval '7 days'),
    'wines', (select count(*) from public.wines where exists (select 1 from public.cards c where c.wine_id = wines.id)),
    'wines7', (select count(*) from public.wines where created_at > now() - interval '7 days' and exists (select 1 from public.cards c where c.wine_id = wines.id)),
    'friends', (select count(*) from public.friendships),
    'feedback_open', (select count(*) from public.feedback where not handled),
    'scans14', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'scans', s, 'kaarten', k) order by d), '[]'::jsonb) from (
        select g::date as d,
          (select count(*) from public.recognitions where created_at::date = g::date) as s,
          (select count(*) from public.cards where created_at::date = g::date) as k
        from generate_series(current_date - 13, current_date, interval '1 day') g) x),
    'tiers', (select coalesce(jsonb_object_agg(tier, n), '{}'::jsonb) from (select tier, count(*) n from public.cards group by tier) t),
    'month_recognitions', (select count(*) from public.recognitions where created_at >= date_trunc('month', now())),
    'ai_month', (select coalesce(jsonb_object_agg(kind, jsonb_build_object('n', n, 'usd', round(usd, 2))), '{}'::jsonb) from (
        select kind, count(*) n, sum(public.vi_ai_cost(model, input_tokens, output_tokens) + web_searches * 0.01) usd
        from public.ai_usage where created_at >= date_trunc('month', now()) group by kind) a),
    'ai_since', (select min(created_at) from public.ai_usage)
  ) into r;
  return r;
end $function$;
