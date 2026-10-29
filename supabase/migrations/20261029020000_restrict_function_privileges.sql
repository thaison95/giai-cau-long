-- Remove Supabase's default PUBLIC/role grants from all privileged helpers and RPCs.
revoke execute on function public.add_tournament_creator() from public, anon, authenticated;
revoke execute on function public.guard_last_organizer() from public, anon, authenticated;
revoke execute on function public.create_tie_rubbers() from public, anon, authenticated;
revoke execute on function public.create_referee_token() from public, anon, authenticated;
revoke execute on function public.validate_rubber_players() from public, anon, authenticated;
revoke execute on function public.assert_can_score(uuid,text) from public, anon, authenticated;
revoke execute on function public.recompute_tie(uuid) from public, anon, authenticated;
revoke execute on function public.is_organizer(uuid) from public, anon, authenticated;
revoke execute on function public.is_tournament_visible(uuid) from public, anon, authenticated;
revoke execute on function public.start_rubber(uuid,text) from public, anon, authenticated;
revoke execute on function public.score_point(uuid,public.side,text) from public, anon, authenticated;
revoke execute on function public.undo_point(uuid,public.side,text) from public, anon, authenticated;
revoke execute on function public.end_rubber_early(uuid,public.side,text) from public, anon, authenticated;
revoke execute on function public.end_rubber_walkover(uuid,public.side) from public, anon, authenticated;
revoke execute on function public.add_organizer_by_email(uuid,text) from public, anon, authenticated;
revoke execute on function public.finish_tournament(uuid) from public, anon, authenticated;
revoke execute on function public.referee_whoami(text) from public, anon, authenticated;

-- The visibility helper is the only helper exposed to anonymous reads. Organizer checks are
-- available to authenticated policy evaluation, never directly to anon.
grant execute on function public.is_tournament_visible(uuid) to anon, authenticated;
grant execute on function public.is_organizer(uuid) to authenticated;
grant execute on function public.start_rubber(uuid,text), public.score_point(uuid,public.side,text), public.undo_point(uuid,public.side,text), public.end_rubber_early(uuid,public.side,text), public.referee_whoami(text) to anon, authenticated;
grant execute on function public.end_rubber_walkover(uuid,public.side), public.add_organizer_by_email(uuid,text), public.finish_tournament(uuid) to authenticated;

 drop policy tournament_read on public.tournaments;
 create policy tournament_read on public.tournaments for select using(public.is_tournament_visible(id));
