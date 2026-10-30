-- Restore a retired rubber without changing the score or completed games.
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
  if (r.end_reason is distinct from 'normal' and r.end_reason is distinct from 'retired') or r.winner_side is null then
    raise exception 'rubber_not_reopenable';
  end if;

  select * into g from public.games
    where rubber_id = r.id and game_no = r.current_game for update;
  if g.id is null then raise exception 'rubber_not_reopenable'; end if;

  if r.end_reason = 'normal' then
    if g.winner_side is distinct from r.winner_side then
      raise exception 'rubber_not_reopenable';
    end if;
    update public.games set
      score_a = score_a - case when r.winner_side = 'a' then 1 else 0 end,
      score_b = score_b - case when r.winner_side = 'b' then 1 else 0 end,
      winner_side = null
      where id = g.id;
    update public.rubbers set
      games_won_a = games_won_a - case when r.winner_side = 'a' then 1 else 0 end,
      games_won_b = games_won_b - case when r.winner_side = 'b' then 1 else 0 end
      where id = r.id;
  elsif g.winner_side is not null then
    raise exception 'rubber_not_reopenable';
  end if;

  update public.rubbers set status = 'live', winner_side = null,
    end_reason = null, ended_at = null where id = r.id;
  perform public.recompute_tie(r.tie_id);
end $$;

revoke all on function public.reopen_finished_rubber(uuid) from public, anon;
grant execute on function public.reopen_finished_rubber(uuid) to authenticated;
