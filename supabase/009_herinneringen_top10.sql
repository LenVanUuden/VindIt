-- =====================================================================
-- Vined It database – migratie 009: herinneringen, top 10 en stapels
-- Draai NA 008_feedback.sql. Plak in Supabase → SQL Editor → New query → Run.
-- Veilig om opnieuw te draaien.
-- =====================================================================

alter table public.cards add column if not exists memo     text;
alter table public.cards add column if not exists memo_at  timestamptz;
alter table public.cards add column if not exists fav_rank smallint;

alter table public.cards drop constraint if exists cards_memo_len;
alter table public.cards add constraint cards_memo_len check (memo is null or char_length(memo) <= 140);
alter table public.cards drop constraint if exists cards_fav_rank_range;
alter table public.cards add constraint cards_fav_rank_range check (fav_rank is null or fav_rank between 1 and 10);

-- Herinnering schrijven, aanpassen of wissen (lege tekst = wissen). De eerste schrijfdatum blijft staan.
create or replace function public.set_memo(p_card uuid, p_text text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_text text := nullif(btrim(coalesce(p_text, '')), '');
  v_card public.cards;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  update public.cards
     set memo    = left(v_text, 140),
         memo_at = case when v_text is null then null else coalesce(memo_at, now()) end
   where id = p_card and user_id = v_uid
  returning * into v_card;
  if v_card.id is null then raise exception 'no_card' using errcode = '22023'; end if;
  return jsonb_build_object('id', v_card.id, 'memo', v_card.memo, 'memo_at', v_card.memo_at);
end;
$$;
revoke all on function public.set_memo(uuid, text) from public, anon;
grant execute on function public.set_memo(uuid, text) to authenticated;

-- Kaart op een plek in de top 10 zetten (1–10), of eruit halen (null). Andere kaarten schuiven door.
create or replace function public.set_favorite(p_card uuid, p_rank int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.cards where id = p_card and user_id = v_uid) then
    raise exception 'no_card' using errcode = '22023';
  end if;
  if p_rank is not null and (p_rank < 1 or p_rank > 10) then
    raise exception 'bad_rank' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('fav-' || v_uid::text, 0));

  update public.cards set fav_rank = null where id = p_card;
  if p_rank is not null then
    update public.cards
       set fav_rank = case when fav_rank >= 10 then null else fav_rank + 1 end
     where user_id = v_uid and fav_rank >= p_rank;
    update public.cards set fav_rank = p_rank where id = p_card;
  end if;

  -- Gaten dichten: altijd 1..n
  with r as (
    select id, row_number() over (order by fav_rank, id) as rn
      from public.cards where user_id = v_uid and fav_rank is not null
  )
  update public.cards c set fav_rank = case when r.rn <= 10 then r.rn else null end
    from r where c.id = r.id;

  return coalesce((select jsonb_agg(jsonb_build_object('id', id, 'fav_rank', fav_rank) order by fav_rank)
                     from public.cards where user_id = v_uid and fav_rank is not null), '[]'::jsonb);
end;
$$;
revoke all on function public.set_favorite(uuid, int) from public, anon;
grant execute on function public.set_favorite(uuid, int) to authenticated;

-- Stapels: kies welke kaart bovenop ligt in een vak (de app kijkt naar de laatst gekozen kaart).
alter table public.cards add column if not exists top_at timestamptz;

create or replace function public.pick_top(p_card uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_at  timestamptz;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  update public.cards set top_at = now() where id = p_card and user_id = v_uid returning top_at into v_at;
  if v_at is null then raise exception 'no_card' using errcode = '22023'; end if;
  return jsonb_build_object('id', p_card, 'top_at', v_at);
end;
$$;
revoke all on function public.pick_top(uuid) from public, anon;
grant execute on function public.pick_top(uuid) to authenticated;
