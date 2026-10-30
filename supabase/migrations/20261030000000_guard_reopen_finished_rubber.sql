-- Keep tie and rubber states consistent when an organizer reopens a result.
create or replace function public.recompute_tie(p_tie_id uuid) returns void
language plpgsql security definer set search_path=public as $$
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
  select tournament_id, team_a_id, team_b_id into tid, ta, tb
    from public.ties where id = p_tie_id for update;
  select count(*) filter(where winner_side = 'a'), count(*) filter(where winner_side = 'b')
    into a, b from public.rubbers where tie_id = p_tie_id and status = 'finished';
  select rule_rubbers_to_win_tie, play_all_rubbers into target, v_play_all
    from public.tournaments where id = tid;

  if v_play_all then
    select count(*) into remaining from public.rubbers
      where tie_id = p_tie_id and status not in ('finished', 'skipped');
    update public.ties set rubbers_won_a = a, rubbers_won_b = b,
      status = case when remaining = 0 then 'finished' when status = 'finished' then 'live' else status end,
      winner_team_id = case when remaining = 0 and a > b then ta
        when remaining = 0 and b > a then tb else null end
      where id = p_tie_id;
  elsif a >= target or b >= target then
    update public.ties set rubbers_won_a = a, rubbers_won_b = b,
      status = 'finished', winner_team_id = case when a > b then ta else tb end
      where id = p_tie_id;
    update public.rubbers set status = 'skipped'
      where tie_id = p_tie_id and status = 'scheduled';
  else
    -- A previously decided tie is live again after its decisive result is reopened.
    update public.rubbers set status = 'scheduled'
      where tie_id = p_tie_id and status = 'skipped';
    select count(*) into remaining from public.rubbers
      where tie_id = p_tie_id and status not in ('finished', 'skipped');
    update public.ties set rubbers_won_a = a, rubbers_won_b = b,
      status = case when remaining = 0 then 'finished' when status = 'finished' then 'live' else status end,
      winner_team_id = case when remaining = 0 and a > b then ta
        when remaining = 0 and b > a then tb else null end
      where id = p_tie_id;
  end if;
end $$;

revoke all on function public.recompute_tie(uuid) from public, anon, authenticated;

create or replace function public.reopen_finished_rubber(p_rubber_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare
  r public.rubbers;
  g public.games;
begin
  select * into r from public.rubbers where id = p_rubber_id for update;
  if not found then raise exception 'rubber_not_found'; end if;
  if not public.is_organizer(r.tournament_id) then raise exception 'forbidden'; end if;
  if r.status <> 'finished' then raise exception 'invalid_status'; end if;
  -- Only a normal point-scored result has a winning point to roll back. Walkovers
  -- and retirements must not create a live rubber without a current game.
  if r.end_reason <> 'normal' or r.winner_side is null then
    raise exception 'rubber_not_reopenable';
  end if;

  select * into g from public.games
    where rubber_id = r.id and game_no = r.current_game for update;
  if g.id is null or g.winner_side <> r.winner_side then
    raise exception 'rubber_not_reopenable';
  end if;

  update public.games set
    score_a = score_a - case when r.winner_side = 'a' then 1 else 0 end,
    score_b = score_b - case when r.winner_side = 'b' then 1 else 0 end,
    winner_side = null
    where id = g.id;
  update public.rubbers set status = 'live', winner_side = null,
    end_reason = null, ended_at = null,
    games_won_a = games_won_a - case when r.winner_side = 'a' then 1 else 0 end,
    games_won_b = games_won_b - case when r.winner_side = 'b' then 1 else 0 end
    where id = r.id;
  perform public.recompute_tie(r.tie_id);
end $$;

revoke all on function public.reopen_finished_rubber(uuid) from public, anon;
grant execute on function public.reopen_finished_rubber(uuid) to authenticated;
