-- Migration 20261029050000: Corporate Tournament Support
-- Adds mixed_doubles kind, play_all_rubbers and standings_points_mode to tournaments,
-- updates validate_rubber_players, recompute_tie, group_standings view,
-- and adds generate_placement_ties and reopen_finished_rubber RPCs.

alter type public.rubber_kind add value if not exists 'mixed_doubles';

alter table public.tournaments
  add column if not exists play_all_rubbers boolean not null default false,
  add column if not exists standings_points_mode text not null default 'tie_wins'
    check (standings_points_mode in ('tie_wins', 'rubbers_won'));

-- Update lineup validator trigger function to support mixed_doubles and validate opposite genders
create or replace function public.validate_rubber_players() returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_team_id uuid;
  n int;
  max_n int;
  kind public.rubber_kind;
  v_new_gender public.gender;
  v_other_gender public.gender;
begin
  select case new.side when 'a' then t.team_a_id else t.team_b_id end, r.kind
    into v_team_id, kind
    from public.rubbers r
    join public.ties t on t.id = r.tie_id
    where r.id = new.rubber_id;

  if v_team_id is null or not exists(
    select 1 from public.players p
    where p.id = new.player_id and p.team_id = v_team_id and p.tournament_id = new.tournament_id
  ) then
    raise exception 'player_wrong_team';
  end if;

  max_n := case kind when 'singles' then 1 else 2 end;

  select count(*) into n
    from public.rubber_players
    where rubber_id = new.rubber_id
      and side = new.side
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if n >= max_n then
    raise exception 'lineup_full';
  end if;

  if kind = 'mixed_doubles' then
    select gender into v_new_gender from public.players where id = new.player_id;
    select p.gender into v_other_gender
      from public.rubber_players rp
      join public.players p on p.id = rp.player_id
      where rp.rubber_id = new.rubber_id
        and rp.side = new.side
        and rp.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      limit 1;

    if v_new_gender is not null and v_other_gender is not null and v_new_gender = v_other_gender then
      raise exception 'mixed_doubles_gender_invalid';
    end if;
  end if;

  return new;
end $$;

-- Update recompute_tie to respect play_all_rubbers and handle reopening cleanly
create or replace function public.recompute_tie(p_tie_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare
  a int;
  b int;
  target int;
  ta uuid;
  tb uuid;
  remaining int;
  tid uuid;
  v_play_all boolean;
begin
  select tournament_id, team_a_id, team_b_id into tid, ta, tb from public.ties where id = p_tie_id for update;
  select count(*) filter(where winner_side = 'a'), count(*) filter(where winner_side = 'b')
    into a, b
    from public.rubbers
    where tie_id = p_tie_id and status = 'finished';
  select rule_rubbers_to_win_tie, play_all_rubbers into target, v_play_all from public.tournaments where id = tid;

  if v_play_all then
    select count(*) into remaining from public.rubbers where tie_id = p_tie_id and status not in ('finished', 'skipped');
    update public.ties
    set rubbers_won_a = a,
        rubbers_won_b = b,
        status = case when remaining = 0 then 'finished' when status = 'finished' then 'live' else status end,
        winner_team_id = case
          when remaining = 0 and a > b then ta
          when remaining = 0 and b > a then tb
          else null
        end
    where id = p_tie_id;
  else
    if a >= target or b >= target then
      update public.ties
      set rubbers_won_a = a,
          rubbers_won_b = b,
          status = 'finished',
          winner_team_id = case when a > b then ta else tb end
      where id = p_tie_id;
      update public.rubbers set status = 'skipped' where tie_id = p_tie_id and status = 'scheduled';
    else
      select count(*) into remaining from public.rubbers where tie_id = p_tie_id and status not in ('finished', 'skipped');
      update public.ties
      set rubbers_won_a = a,
          rubbers_won_b = b,
          status = case when remaining = 0 then 'finished' when status = 'finished' then 'live' else status end,
          winner_team_id = case
            when remaining = 0 and a > b then ta
            when remaining = 0 and b > a then tb
            else null
          end
      where id = p_tie_id;
    end if;
  end if;
end $$;

revoke all on function public.recompute_tie(uuid) from public, anon, authenticated;

-- Update group_standings view to support standings_points_mode (tie_wins vs rubbers_won)
create or replace view public.group_standings with (security_invoker=true) as
with game_totals as (
  select tie_id, sum(score_a)::int as score_a, sum(score_b)::int as score_b,
    count(*) filter(where winner_side = 'a')::int as games_a,
    count(*) filter(where winner_side = 'b')::int as games_b
  from public.games group by tie_id
), tie_sides as (
  select t.tournament_id, t.group_id, t.id as tie_id, t.rubbers_won_a as rubbers_for, t.rubbers_won_b as rubbers_against,
    coalesce(g.games_a, 0) as games_for, coalesce(g.games_b, 0) as games_against,
    coalesce(g.score_a, 0) as points_for, coalesce(g.score_b, 0) as points_against,
    t.team_a_id as team_id, (t.rubbers_won_a > t.rubbers_won_b) as won
  from public.ties t left join game_totals g on g.tie_id = t.id
  where t.stage = 'group' and t.status = 'finished' and t.group_id is not null and t.team_a_id is not null
  union all
  select t.tournament_id, t.group_id, t.id, t.rubbers_won_b, t.rubbers_won_a,
    coalesce(g.games_b, 0), coalesce(g.games_a, 0), coalesce(g.score_b, 0), coalesce(g.score_a, 0),
    t.team_b_id, (t.rubbers_won_b > t.rubbers_won_a)
  from public.ties t left join game_totals g on g.tie_id = t.id
  where t.stage = 'group' and t.status = 'finished' and t.group_id is not null and t.team_b_id is not null
)
select
  s.tournament_id,
  s.group_id,
  s.team_id,
  count(*)::int as played,
  count(*) filter(where s.won)::int as won,
  count(*) filter(where not s.won)::int as lost,
  case
    when max(tn.standings_points_mode) = 'rubbers_won' then sum(s.rubbers_for)::int
    else (count(*) filter(where s.won) * max(tn.rule_tie_win_points))::int
  end as points,
  sum(s.rubbers_for)::int as rubbers_for,
  sum(s.rubbers_against)::int as rubbers_against,
  sum(s.games_for - s.games_against)::int as games_diff,
  sum(s.points_for - s.points_against)::int as points_diff
from tie_sides s
join public.tournaments tn on tn.id = s.tournament_id
group by s.tournament_id, s.group_id, s.team_id;

grant select on public.group_standings to anon, authenticated;

-- RPC to automatically generate placement ties (1-2, 3-4, 5-6) after group matches finish
create or replace function public.generate_placement_ties(p_tournament_id uuid, p_group_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare
  v_ranked_teams uuid[];
  v_tie_id uuid;
begin
  if not public.is_organizer(p_tournament_id) then
    raise exception 'forbidden';
  end if;

  if exists(
    select 1 from public.ties
    where group_id = p_group_id and tournament_id = p_tournament_id and status <> 'finished'
  ) or not exists(
    select 1 from public.ties
    where group_id = p_group_id and tournament_id = p_tournament_id
  ) then
    raise exception 'group_not_finished';
  end if;

  select array_agg(team_id order by points desc, (rubbers_for - rubbers_against) desc, games_diff desc, points_diff desc)
    into v_ranked_teams
    from public.group_standings
    where tournament_id = p_tournament_id and group_id = p_group_id;

  if v_ranked_teams is null or cardinality(v_ranked_teams) < 6 then
    raise exception 'insufficient_teams_for_placement';
  end if;

  -- Match 1: Rank 1 vs Rank 2 (Final)
  insert into public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  values(p_tournament_id, 'knockout', null, 'Tranh Hạng 1–2 (Chung kết)', 101, v_ranked_teams[1], v_ranked_teams[2], 'Sân 1, 2, 3')
  returning id into v_tie_id;
  update public.rubbers set court = 'Sân ' || position where tie_id = v_tie_id and position between 1 and 3;

  -- Match 2: Rank 3 vs Rank 4
  insert into public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  values(p_tournament_id, 'knockout', null, 'Tranh Hạng 3–4', 102, v_ranked_teams[3], v_ranked_teams[4], 'Sân 1, 2, 3')
  returning id into v_tie_id;
  update public.rubbers set court = 'Sân ' || position where tie_id = v_tie_id and position between 1 and 3;

  -- Match 3: Rank 5 vs Rank 6
  insert into public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
  values(p_tournament_id, 'knockout', null, 'Tranh Hạng 5–6', 103, v_ranked_teams[5], v_ranked_teams[6], 'Sân 1, 2, 3')
  returning id into v_tie_id;
  update public.rubbers set court = 'Sân ' || position where tie_id = v_tie_id and position between 1 and 3;
end $$;

revoke all on function public.generate_placement_ties(uuid, uuid) from public, anon;
grant execute on function public.generate_placement_ties(uuid, uuid) to authenticated;

-- RPC to reopen a finished rubber (e.g. if referee accidentally clicked the 21st point)
create or replace function public.reopen_finished_rubber(p_rubber_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare
  r public.rubbers;
  g public.games;
  w public.side;
begin
  select * into r from public.rubbers where id = p_rubber_id for update;
  if not found then raise exception 'rubber_not_found'; end if;
  if not public.is_organizer(r.tournament_id) then raise exception 'forbidden'; end if;
  if r.status <> 'finished' then raise exception 'invalid_status'; end if;

  w := r.winner_side;

  -- Reopen last game and decrement 1 winning point
  select * into g from public.games
    where rubber_id = r.id and game_no = r.current_game
    for update;

  if g.id is not null then
    update public.games
    set score_a = score_a - case when w = 'a' and score_a > 0 then 1 else 0 end,
        score_b = score_b - case when w = 'b' and score_b > 0 then 1 else 0 end,
        winner_side = null
    where id = g.id;
  end if;

  -- Reopen rubber
  update public.rubbers
  set status = 'live',
      winner_side = null,
      end_reason = null,
      ended_at = null,
      games_won_a = games_won_a - case when w = 'a' and games_won_a > 0 then 1 else 0 end,
      games_won_b = games_won_b - case when w = 'b' and games_won_b > 0 then 1 else 0 end
  where id = r.id;

  -- Recompute parent tie
  perform public.recompute_tie(r.tie_id);
end $$;

revoke all on function public.reopen_finished_rubber(uuid) from public, anon;
grant execute on function public.reopen_finished_rubber(uuid) to authenticated;
