create extension if not exists pgcrypto with schema extensions;

do $$ begin
  create type public.tournament_status as enum ('draft','published','finished');
  create type public.rubber_kind as enum ('singles','doubles');
  create type public.tie_stage as enum ('group','knockout');
  create type public.tie_status as enum ('scheduled','live','finished');
  create type public.rubber_status as enum ('scheduled','live','finished','skipped');
  create type public.side as enum ('a','b');
  create type public.gender as enum ('m','f');
  create type public.rubber_end_reason as enum ('normal','retired','walkover');
end $$;

create table public.tournaments (
 id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
 name text not null, description text, venue text, start_date date, end_date date,
 status public.tournament_status not null default 'draft', created_by uuid not null references auth.users(id),
 rule_points_to_win int not null default 21, rule_points_cap int not null default 30,
 rule_games_to_win int not null default 2, rule_rubbers_to_win_tie int not null default 3,
 rule_tie_win_points int not null default 1,
 rubber_template public.rubber_kind[] not null default array['singles','doubles','singles','doubles','singles']::public.rubber_kind[],
 created_at timestamptz not null default now(),
 check(rule_points_cap >= rule_points_to_win), check(array_length(rubber_template,1)>=1)
);
create table public.tournament_organizers (
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 user_id uuid not null references auth.users(id), email text, created_at timestamptz not null default now(), primary key(tournament_id,user_id)
);
create table public.tournament_groups (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 name text not null, sort_order int not null default 0, created_at timestamptz not null default now(), unique(id,tournament_id)
);
create table public.teams (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 name text not null, short_name text not null check(char_length(short_name)<=4), flag_emoji text,
 group_id uuid, seed int, created_at timestamptz not null default now(),
 unique(tournament_id,short_name), unique(id,tournament_id),
 foreign key(group_id,tournament_id) references public.tournament_groups(id,tournament_id) on delete set null (group_id)
);
create table public.players (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 team_id uuid not null references public.teams(id) on delete cascade, full_name text not null,
 gender public.gender, sort_order int not null default 0, created_at timestamptz not null default now(), unique(id,tournament_id)
);
create table public.ties (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 stage public.tie_stage not null, group_id uuid, round_label text not null, round_order int not null default 0,
 team_a_id uuid, team_b_id uuid, scheduled_at timestamptz, court text,
 status public.tie_status not null default 'scheduled', rubbers_won_a int not null default 0,
 rubbers_won_b int not null default 0, winner_team_id uuid,
 created_at timestamptz not null default now(), unique(id,tournament_id),
 foreign key(group_id,tournament_id) references public.tournament_groups(id,tournament_id) on delete set null (group_id),
 foreign key(team_a_id,tournament_id) references public.teams(id,tournament_id),
 foreign key(team_b_id,tournament_id) references public.teams(id,tournament_id),
 foreign key(winner_team_id,tournament_id) references public.teams(id,tournament_id),
 check(team_a_id is null or team_b_id is null or team_a_id <> team_b_id)
);
create table public.referees (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 name text not null, created_at timestamptz not null default now(), unique(id,tournament_id)
);
create table public.rubbers (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 tie_id uuid not null references public.ties(id) on delete cascade, position int not null, kind public.rubber_kind not null,
 referee_id uuid, court text, scheduled_at timestamptz,
 status public.rubber_status not null default 'scheduled', current_game int not null default 1,
 games_won_a int not null default 0, games_won_b int not null default 0,
 winner_side public.side, end_reason public.rubber_end_reason, started_at timestamptz, ended_at timestamptz,
 created_at timestamptz not null default now(), unique(tie_id,position), unique(id,tournament_id),
 foreign key(referee_id,tournament_id) references public.referees(id,tournament_id) on delete set null (referee_id)
);
create table public.rubber_players (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 rubber_id uuid not null references public.rubbers(id) on delete cascade, side public.side not null,
 player_id uuid not null references public.players(id) on delete cascade, created_at timestamptz not null default now(),
 unique(rubber_id,player_id)
);
create table public.games (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 tie_id uuid not null references public.ties(id) on delete cascade, rubber_id uuid not null references public.rubbers(id) on delete cascade,
 game_no int not null, score_a int not null default 0, score_b int not null default 0, winner_side public.side,
 created_at timestamptz not null default now(), unique(rubber_id,game_no)
);
create table public.referee_tokens (
 referee_id uuid primary key references public.referees(id) on delete cascade,
 token text not null unique
);
create index ties_tournament_round_idx on public.ties(tournament_id,round_order);
create index ties_group_idx on public.ties(group_id);
create index rubbers_tie_position_idx on public.rubbers(tie_id,position);
create index rubbers_referee_idx on public.rubbers(referee_id);
create index games_rubber_no_idx on public.games(rubber_id,game_no);
create index games_tie_idx on public.games(tie_id);
create index teams_tournament_idx on public.teams(tournament_id);
create index players_team_idx on public.players(team_id);
create index rubber_players_rubber_idx on public.rubber_players(rubber_id);

create or replace function public.add_tournament_creator() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.tournament_organizers(tournament_id,user_id,email) values(new.id,new.created_by,(select email from auth.users where id=new.created_by)); return new; end $$;
create trigger tournaments_add_creator after insert on public.tournaments for each row execute function public.add_tournament_creator();

create or replace function public.guard_last_organizer() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if pg_trigger_depth()>1 then return old; end if;
 if (select count(*) from public.tournament_organizers where tournament_id=old.tournament_id)<=1 then raise exception 'last_organizer'; end if;
 return old;
end $$;
create trigger tournament_organizers_guard_delete before delete on public.tournament_organizers for each row execute function public.guard_last_organizer();

create or replace function public.create_tie_rubbers() returns trigger language plpgsql security definer set search_path=public as $$
declare k public.rubber_kind; pos int:=0; template public.rubber_kind[];
begin select rubber_template into template from public.tournaments where id=new.tournament_id; foreach k in array template loop pos:=pos+1; insert into public.rubbers(tournament_id,tie_id,position,kind) values(new.tournament_id,new.id,pos,k); end loop; return new; end $$;
create trigger ties_create_rubbers after insert on public.ties for each row execute function public.create_tie_rubbers();

create or replace function public.create_referee_token() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.referee_tokens(referee_id,token) values(new.id,rtrim(translate(encode(extensions.gen_random_bytes(24),'base64'),'+/','-_'),'=')); return new; end $$;
create trigger referees_create_token after insert on public.referees for each row execute function public.create_referee_token();

create or replace function public.validate_rubber_players() returns trigger language plpgsql security definer set search_path=public as $$
declare v_team_id uuid; n int; max_n int; kind public.rubber_kind;
begin
 select case new.side when 'a' then t.team_a_id else t.team_b_id end,r.kind into v_team_id,kind from public.rubbers r join public.ties t on t.id=r.tie_id where r.id=new.rubber_id;
 if v_team_id is null or not exists(select 1 from public.players p where p.id=new.player_id and p.team_id=v_team_id and p.tournament_id=new.tournament_id) then raise exception 'player_wrong_team'; end if;
 max_n:=case kind when 'singles' then 1 else 2 end;
 select count(*) into n from public.rubber_players where rubber_id=new.rubber_id and side=new.side and id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
 if n>=max_n then raise exception 'lineup_full'; end if; return new;
end $$;
create trigger rubber_players_validate before insert or update on public.rubber_players for each row execute function public.validate_rubber_players();

create or replace function public.is_organizer(p_tournament_id uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.tournament_organizers where tournament_id=p_tournament_id and user_id=auth.uid()) $$;
create or replace function public.is_tournament_visible(p_tournament_id uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.tournaments where id=p_tournament_id and (status<>'draft' or public.is_organizer(id))) $$;

DO $$ declare t text; begin foreach t in array array['tournaments','tournament_organizers','tournament_groups','teams','players','ties','rubbers','rubber_players','games','referees','referee_tokens'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;
create policy tournament_read on public.tournaments for select using(status<>'draft' or public.is_organizer(id));
create policy tournament_insert on public.tournaments for insert to authenticated with check(created_by=auth.uid());
create policy tournament_update on public.tournaments for update to authenticated using(public.is_organizer(id)) with check(public.is_organizer(id));
create policy tournament_delete on public.tournaments for delete to authenticated using(public.is_organizer(id));
create policy organizers_read on public.tournament_organizers for select using(public.is_organizer(tournament_id));
create policy organizers_delete on public.tournament_organizers for delete to authenticated using(public.is_organizer(tournament_id));
DO $$ declare t text; begin foreach t in array array['tournament_groups','teams','players','ties','rubbers','rubber_players','games','referees'] loop
 execute format('create policy %I on public.%I for select using(public.is_tournament_visible(tournament_id))',t||'_visible_read',t);
end loop; end $$;
DO $$ declare t text; begin foreach t in array array['tournament_groups','teams','players','ties','rubber_players','referees'] loop
 execute format('create policy %I on public.%I for all to authenticated using(public.is_organizer(tournament_id)) with check(public.is_organizer(tournament_id))',t||'_organizer_write',t);
end loop; end $$;
create policy rubbers_organizer_update on public.rubbers for update to authenticated using(public.is_organizer(tournament_id)) with check(public.is_organizer(tournament_id));
create policy referee_tokens_organizer_read on public.referee_tokens for select to authenticated using(exists(select 1 from public.referees r where r.id=referee_id and public.is_organizer(r.tournament_id)));
revoke all on all tables in schema public from anon, authenticated;
grant select on public.tournaments,public.tournament_groups,public.teams,public.players,public.ties,public.rubbers,public.rubber_players,public.games,public.referees to anon,authenticated;
grant select,insert,update,delete on public.tournaments,public.tournament_groups,public.teams,public.players,public.ties,public.rubber_players,public.referees to authenticated;
grant select,delete on public.tournament_organizers to authenticated;
grant select on public.referee_tokens to authenticated;
revoke update on public.ties,public.rubbers from authenticated;
grant update(stage,group_id,round_label,round_order,team_a_id,team_b_id,scheduled_at,court) on public.ties to authenticated;
grant update(referee_id,court,scheduled_at) on public.rubbers to authenticated;

create or replace function public.assert_can_score(p_rubber_id uuid,p_token text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare tid uuid; rid uuid;
begin
 select tournament_id,referee_id into tid,rid from public.rubbers where id=p_rubber_id;
 if tid is null then raise exception 'rubber_not_found'; end if;
 if public.is_organizer(tid) then return tid; end if;
 if p_token is not null and exists(select 1 from public.referee_tokens rt join public.referees r on r.id=rt.referee_id join public.tournaments t on t.id=r.tournament_id where rt.token=p_token and r.id=rid and t.status<>'finished') then return tid; end if;
 raise exception 'forbidden';
end $$;
revoke all on function public.assert_can_score(uuid,text) from public,anon,authenticated;

create or replace function public.start_rubber(p_rubber_id uuid,p_token text default null) returns void language plpgsql security definer set search_path=public as $$
declare r public.rubbers; t public.ties; expected int;
begin
 select * into r from public.rubbers where id=p_rubber_id for update; if not found then raise exception 'rubber_not_found'; end if;
 perform public.assert_can_score(p_rubber_id,p_token);
 if r.status<>'scheduled' then raise exception 'invalid_status'; end if;
 select * into t from public.ties where id=r.tie_id;
 if t.team_a_id is null or t.team_b_id is null then raise exception 'teams_required'; end if;
 expected:=case r.kind when 'singles' then 1 else 2 end;
 if (select count(*) from public.rubber_players where rubber_id=r.id and side='a')<>expected or (select count(*) from public.rubber_players where rubber_id=r.id and side='b')<>expected then raise exception 'lineup_incomplete'; end if;
 update public.rubbers set status='live',started_at=now(),current_game=1 where id=r.id;
 insert into public.games(tournament_id,tie_id,rubber_id,game_no) values(r.tournament_id,r.tie_id,r.id,1);
 update public.ties set status='live' where id=t.id and status='scheduled';
end $$;

create or replace function public.recompute_tie(p_tie_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare a int; b int; target int; ta uuid; tb uuid; remaining int; tid uuid;
begin
 select tournament_id,team_a_id,team_b_id into tid,ta,tb from public.ties where id=p_tie_id for update;
 select count(*) filter(where winner_side='a'),count(*) filter(where winner_side='b') into a,b from public.rubbers where tie_id=p_tie_id and status='finished';
 select rule_rubbers_to_win_tie into target from public.tournaments where id=tid;
 if a>=target or b>=target then
  update public.ties set rubbers_won_a=a,rubbers_won_b=b,status='finished',winner_team_id=case when a>b then ta else tb end where id=p_tie_id;
  update public.rubbers set status='skipped' where tie_id=p_tie_id and status='scheduled';
 else
  select count(*) into remaining from public.rubbers where tie_id=p_tie_id and status not in ('finished','skipped');
  update public.ties set rubbers_won_a=a,rubbers_won_b=b,status=case when remaining=0 then 'finished' else status end,
   winner_team_id=case when remaining=0 and a<>b then case when a>b then ta else tb end else winner_team_id end where id=p_tie_id;
 end if;
end $$;
revoke all on function public.recompute_tie(uuid) from public,anon,authenticated;

create or replace function public.score_point(p_rubber_id uuid,p_side public.side,p_token text default null) returns void language plpgsql security definer set search_path=public as $$
declare r public.rubbers; g public.games; p int; cap int; need int; a int; b int; w public.side;
begin
 select * into r from public.rubbers where id=p_rubber_id for update; if not found then raise exception 'rubber_not_found'; end if;
 perform public.assert_can_score(p_rubber_id,p_token); if r.status<>'live' then raise exception 'invalid_status'; end if;
 select * into g from public.games where rubber_id=r.id and game_no=r.current_game for update;
 update public.games set score_a=score_a+case when p_side='a' then 1 else 0 end,score_b=score_b+case when p_side='b' then 1 else 0 end where id=g.id returning score_a,score_b into a,b;
 select rule_points_to_win,rule_points_cap,rule_games_to_win into p,cap,need from public.tournaments where id=r.tournament_id;
 if ((greatest(a,b)>=p and abs(a-b)>=2) or greatest(a,b)=cap) then
  w:=case when a>b then 'a'::public.side else 'b'::public.side end;
  update public.games set winner_side=w where id=g.id;
  update public.rubbers set games_won_a=games_won_a+case when w='a' then 1 else 0 end,games_won_b=games_won_b+case when w='b' then 1 else 0 end where id=r.id returning * into r;
  if (case when w='a' then r.games_won_a else r.games_won_b end)>=need then
   update public.rubbers set status='finished',winner_side=w,end_reason='normal',ended_at=now() where id=r.id;
   perform public.recompute_tie(r.tie_id);
  else
   update public.rubbers set current_game=current_game+1 where id=r.id;
   insert into public.games(tournament_id,tie_id,rubber_id,game_no) values(r.tournament_id,r.tie_id,r.id,r.current_game+1);
  end if;
 end if;
end $$;

create or replace function public.undo_point(p_rubber_id uuid,p_side public.side,p_token text default null) returns void language plpgsql security definer set search_path=public as $$
declare r public.rubbers; g public.games;
begin
 select * into r from public.rubbers where id=p_rubber_id for update; if not found then raise exception 'rubber_not_found'; end if;
 perform public.assert_can_score(p_rubber_id,p_token); if r.status<>'live' then raise exception 'invalid_status'; end if;
 select * into g from public.games where rubber_id=r.id and game_no=r.current_game for update;
 if (p_side='a' and g.score_a=0) or (p_side='b' and g.score_b=0) then raise exception 'no_point_to_undo'; end if;
 update public.games set score_a=score_a-case when p_side='a' then 1 else 0 end,score_b=score_b-case when p_side='b' then 1 else 0 end where id=g.id;
end $$;
create or replace function public.end_rubber_early(p_rubber_id uuid,p_winner_side public.side,p_token text default null) returns void language plpgsql security definer set search_path=public as $$
declare r public.rubbers;
begin select * into r from public.rubbers where id=p_rubber_id for update; if not found then raise exception 'rubber_not_found'; end if;
 perform public.assert_can_score(p_rubber_id,p_token); if r.status<>'live' then raise exception 'invalid_status'; end if;
 update public.rubbers set status='finished',winner_side=p_winner_side,end_reason='retired',ended_at=now() where id=r.id; perform public.recompute_tie(r.tie_id); end $$;
create or replace function public.end_rubber_walkover(p_rubber_id uuid,p_winner_side public.side) returns void language plpgsql security definer set search_path=public as $$
declare r public.rubbers;
begin select * into r from public.rubbers where id=p_rubber_id for update; if not found then raise exception 'rubber_not_found'; end if;
 if not public.is_organizer(r.tournament_id) then raise exception 'forbidden'; end if; if r.status<>'scheduled' then raise exception 'invalid_status'; end if;
 update public.rubbers set status='finished',winner_side=p_winner_side,end_reason='walkover',ended_at=now() where id=r.id; perform public.recompute_tie(r.tie_id); end $$;

create or replace function public.add_organizer_by_email(p_tournament_id uuid,p_email text) returns void language plpgsql security definer set search_path=public as $$
declare uid uuid; em text;
begin if not public.is_organizer(p_tournament_id) then raise exception 'forbidden'; end if;
 select id,email into uid,em from auth.users where lower(email)=lower(p_email) limit 1;
 if uid is null then raise exception 'user_not_found'; end if;
 insert into public.tournament_organizers(tournament_id,user_id,email) values(p_tournament_id,uid,em) on conflict do nothing; end $$;
create or replace function public.finish_tournament(p_tournament_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin if not public.is_organizer(p_tournament_id) then raise exception 'forbidden'; end if;
 update public.tournaments set status='finished' where id=p_tournament_id;
 delete from public.referees where tournament_id=p_tournament_id; end $$;
create or replace function public.referee_whoami(p_token text) returns table(referee_id uuid,name text,tournament_id uuid) language plpgsql security definer set search_path=public as $$
begin return query select r.id,r.name,r.tournament_id from public.referee_tokens rt join public.referees r on r.id=rt.referee_id join public.tournaments t on t.id=r.tournament_id where rt.token=p_token and t.status<>'finished';
 if not found then raise exception 'invalid_token'; end if; end $$;

revoke all on function public.start_rubber(uuid,text),public.score_point(uuid,public.side,text),public.undo_point(uuid,public.side,text),public.end_rubber_early(uuid,public.side,text),public.end_rubber_walkover(uuid,public.side),public.add_organizer_by_email(uuid,text),public.finish_tournament(uuid),public.referee_whoami(text) from public;
grant execute on function public.start_rubber(uuid,text),public.score_point(uuid,public.side,text),public.undo_point(uuid,public.side,text),public.end_rubber_early(uuid,public.side,text) to anon,authenticated;
grant execute on function public.end_rubber_walkover(uuid,public.side),public.add_organizer_by_email(uuid,text),public.finish_tournament(uuid) to authenticated;
grant execute on function public.referee_whoami(text) to anon,authenticated;

create or replace view public.group_standings with (security_invoker=true) as
with game_totals as (
 select tie_id, sum(score_a)::int as score_a, sum(score_b)::int as score_b,
  count(*) filter(where winner_side='a')::int as games_a,
  count(*) filter(where winner_side='b')::int as games_b
 from public.games group by tie_id
), tie_sides as (
 select t.tournament_id,t.group_id,t.id as tie_id,t.rubbers_won_a as rubbers_for,t.rubbers_won_b as rubbers_against,
  coalesce(g.games_a,0) as games_for,coalesce(g.games_b,0) as games_against,
  coalesce(g.score_a,0) as points_for,coalesce(g.score_b,0) as points_against,
  t.team_a_id as team_id,(t.rubbers_won_a>t.rubbers_won_b) as won
 from public.ties t left join game_totals g on g.tie_id=t.id
 where t.stage='group' and t.status='finished' and t.group_id is not null and t.team_a_id is not null
 union all
 select t.tournament_id,t.group_id,t.id,t.rubbers_won_b,t.rubbers_won_a,
  coalesce(g.games_b,0),coalesce(g.games_a,0),coalesce(g.score_b,0),coalesce(g.score_a,0),
  t.team_b_id,(t.rubbers_won_b>t.rubbers_won_a)
 from public.ties t left join game_totals g on g.tie_id=t.id
 where t.stage='group' and t.status='finished' and t.group_id is not null and t.team_b_id is not null
)
select s.tournament_id,s.group_id,s.team_id,count(*)::int as played,
 count(*) filter(where s.won)::int as won,count(*) filter(where not s.won)::int as lost,
 (count(*) filter(where s.won)*max(tn.rule_tie_win_points))::int as points,
 sum(s.rubbers_for)::int as rubbers_for,sum(s.rubbers_against)::int as rubbers_against,
 sum(s.games_for-s.games_against)::int as games_diff,sum(s.points_for-s.points_against)::int as points_diff
from tie_sides s join public.tournaments tn on tn.id=s.tournament_id
group by s.tournament_id,s.group_id,s.team_id;
grant select on public.group_standings to anon,authenticated;

do $$ begin
 alter publication supabase_realtime add table public.ties;
 alter publication supabase_realtime add table public.rubbers;
 alter publication supabase_realtime add table public.games;
exception when duplicate_object then null; end $$;
