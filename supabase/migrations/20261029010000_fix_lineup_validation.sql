create or replace function public.validate_rubber_players() returns trigger language plpgsql security definer set search_path=public as $$
declare v_team_id uuid; n int; max_n int; kind public.rubber_kind;
begin
 select case new.side when 'a' then t.team_a_id else t.team_b_id end,r.kind into v_team_id,kind from public.rubbers r join public.ties t on t.id=r.tie_id where r.id=new.rubber_id;
 if v_team_id is null or not exists(select 1 from public.players p where p.id=new.player_id and p.team_id=v_team_id and p.tournament_id=new.tournament_id) then raise exception 'player_wrong_team'; end if;
 max_n:=case kind when 'singles' then 1 else 2 end;
 select count(*) into n from public.rubber_players where rubber_id=new.rubber_id and side=new.side and id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
 if n>=max_n then raise exception 'lineup_full'; end if; return new;
end $$;
