-- The dry-run switch causes an intentional exception, rolling back all changes.
-- Run against the linked project with supabase db query --file.
-- Set dry_run to false only after reviewing the dry run and taking a backup.
-- Existing ties and their dependent rubbers, games and lineups are deleted.
DO $seed$
DECLARE dry_run boolean := true;
BEGIN
CREATE TEMP TABLE schedule_players (team_no int, alias text, full_name text, gender text, PRIMARY KEY(team_no,alias)) ON COMMIT DROP;
INSERT INTO schedule_players VALUES
(1,'Nhân','Lê Thanh Nhân','m'),
(1,'Bảo','Bảo Thái','m'),
(1,'Q.Long','Phạm Quốc Long','m'),
(1,'P.Long','Nguyễn Lê Phi Long','m'),
(1,'Sang','Sang','m'),
(1,'Thảo','Thảo Đặng','f'),
(2,'Giang','Giang','m'),
(2,'Thiên','Nguyễn Minh Thiên','m'),
(2,'Tú','Trần Văn Tú','m'),
(2,'Luân','Luân pickleball','m'),
(2,'Gương','Guong Pham','f'),
(2,'Phúc','Phuc Cao','f'),
(3,'Dũng','Dũng thứ 2','m'),
(3,'Minh','Minh - RiskVN','m'),
(3,'Huy','Huy Vũ','m'),
(3,'Khánh','Trần Minh Khánh','m'),
(3,'Oanh','Oanh','f'),
(3,'Đức','Nguyễn Ngô Minh Đức','m'),
(4,'Xuân','Nguyễn Viết Xuân','m'),
(4,'An','An Nguyễn','m'),
(4,'Sơn','Thái Sơn','m'),
(4,'Nhực','Nhực Corn','m'),
(4,'Tuấn','Tuấn Bùi','m'),
(4,'Nhi','Nhi Doan','f'),
(5,'Quân','Đồng Minh Quân','m'),
(5,'Tâm','Phạm Ngọc Tâm','m'),
(5,'Hào','Tăng Anh Hào','m'),
(5,'Nhu Em','Lê Hồng Nhu Em','m'),
(5,'Hồng','Nguyễn Ngọc Ánh Hồng','f'),
(5,'Hạnh','Hạnh Phạm','f'),
(6,'Triết','Triết Trương','m'),
(6,'K.Đào','Khánh Đào','m'),
(6,'Cường','Cường Châu','m'),
(6,'Mindy','Mindy','f'),
(6,'T.Huy','Nguyễn Tiến Huy','m'),
(6,'Bình','Nguyễn Thanh Bình','m');
CREATE TEMP TABLE schedule_rows (round_no int, court int, team_a int, team_b int, position int, kind text, a1 text, a2 text, b1 text, b2 text, PRIMARY KEY(round_no,court,position)) ON COMMIT DROP;
INSERT INTO schedule_rows VALUES
(1,10,1,4,1,'doubles','Nhân','Bảo','Xuân','An'),
(1,10,1,4,2,'doubles','Q.Long','Sang','Sơn','Nhực'),
(1,10,1,4,3,'mixed_doubles','P.Long','Thảo','Tuấn','Nhi'),
(1,11,2,5,1,'doubles','Giang','Thiên','Quân','Tâm'),
(1,11,2,5,2,'doubles','Tú','Luân','Hào','Nhu Em'),
(1,11,2,5,3,'mixed_doubles','Giang','Phúc','Tâm','Hạnh'),
(1,12,3,6,1,'doubles','Dũng','Minh','Triết','K.Đào'),
(1,12,3,6,2,'mixed_doubles','Oanh','Đức','Cường','Mindy'),
(1,12,3,6,3,'doubles','Huy','Khánh','T.Huy','Bình'),
(2,10,1,5,1,'doubles','Q.Long','Sang','Quân','Hào'),
(2,10,1,5,2,'doubles','Nhân','P.Long','Tâm','Nhu Em'),
(2,10,1,5,3,'mixed_doubles','Bảo','Thảo','Quân','Hồng'),
(2,11,2,6,1,'mixed_doubles','Luân','Gương','Triết','Mindy'),
(2,11,2,6,2,'doubles','Giang','Tú','Cường','T.Huy'),
(2,11,2,6,3,'doubles','Luân','Thiên','K.Đào','Bình'),
(2,12,3,4,1,'doubles','Dũng','Minh','Xuân','An'),
(2,12,3,4,2,'doubles','Huy','Khánh','Sơn','Nhực'),
(2,12,3,4,3,'mixed_doubles','Oanh','Đức','Tuấn','Nhi'),
(3,10,1,2,1,'doubles','Q.Long','Sang','Giang','Tú'),
(3,10,1,2,2,'doubles','Nhân','P.Long','Luân','Thiên'),
(3,10,1,2,3,'mixed_doubles','Bảo','Thảo','Giang','Gương'),
(3,11,3,5,1,'doubles','Dũng','Minh','Tâm','Hào'),
(3,11,3,5,2,'doubles','Huy','Khánh','Quân','Nhu Em'),
(3,11,3,5,3,'mixed_doubles','Oanh','Đức','Hào','Hồng'),
(3,12,4,6,1,'doubles','Xuân','An','Cường','Triết'),
(3,12,4,6,2,'mixed_doubles','Tuấn','Nhi','T.Huy','Mindy'),
(3,12,4,6,3,'doubles','Sơn','Nhực','K.Đào','Bình'),
(4,10,1,3,1,'doubles','Nhân','P.Long','Huy','Khánh'),
(4,10,1,3,2,'mixed_doubles','Sang','Thảo','Oanh','Đức'),
(4,10,1,3,3,'doubles','Bảo','Q.Long','Dũng','Minh'),
(4,11,2,4,1,'mixed_doubles','Tú','Phúc','An','Nhi'),
(4,11,2,4,2,'doubles','Giang','Thiên','Xuân','Sơn'),
(4,11,2,4,3,'doubles','Tú','Luân','Nhực','Tuấn'),
(4,12,5,6,1,'doubles','Tâm','Quân','Cường','Triết'),
(4,12,5,6,2,'doubles','Hào','Nhu Em','K.Đào','Bình'),
(4,12,5,6,3,'mixed_doubles','Tâm','Hồng','T.Huy','Mindy'),
(5,10,1,6,1,'doubles','Nhân','P.Long','Triết','Bình'),
(5,10,1,6,2,'doubles','Bảo','Q.Long','Cường','K.Đào'),
(5,10,1,6,3,'mixed_doubles','Sang','Thảo','T.Huy','Mindy'),
(5,11,2,3,1,'mixed_doubles','Giang','Phúc','Oanh','Đức'),
(5,11,2,3,2,'doubles','Tú','Thiên','Huy','Khánh'),
(5,11,2,3,3,'doubles','Giang','Luân','Dũng','Minh'),
(5,12,4,5,1,'mixed_doubles','Sơn','Nhi','Quân','Hạnh'),
(5,12,4,5,2,'doubles','Nhực','An','Tâm','Nhu Em'),
(5,12,4,5,3,'doubles','Xuân','Tuấn','Quân','Hào');
DECLARE
 tid constant uuid := 'c90dd0b1-a512-412b-ba3c-e7ae4d40db73';
 gid uuid; x record; pid uuid; new_tie uuid; new_rubber uuid; side_name text; alias_name text; team_num int; n int;
BEGIN
 -- Lock writes and verify assumptions again in the same transaction.
 LOCK TABLE public.tournaments, public.tournament_groups, public.teams, public.players, public.ties, public.rubbers, public.rubber_players, public.games IN SHARE ROW EXCLUSIVE MODE;
 IF NOT EXISTS (SELECT 1 FROM public.tournaments WHERE id=tid AND status <> 'finished' AND start_date='2026-10-31' AND rubber_template=ARRAY['doubles','doubles','mixed_doubles']::public.rubber_kind[]) THEN RAISE EXCEPTION 'Tournament missing, finished, or template changed'; END IF;
 SELECT id INTO gid FROM public.tournament_groups WHERE tournament_id=tid AND name='Bảng A';
 IF gid IS NULL OR (SELECT count(*) FROM public.tournament_groups WHERE tournament_id=tid AND name='Bảng A') <> 1 THEN RAISE EXCEPTION 'Expected one Bảng A'; END IF;
 IF (SELECT count(*) FROM public.teams WHERE tournament_id=tid) <> 6 OR (SELECT count(DISTINCT name) FROM public.teams WHERE tournament_id=tid AND group_id=gid AND name IN ('Đội 1','Đội 2','Đội 3','Đội 4','Đội 5','Đội 6')) <> 6 THEN RAISE EXCEPTION 'Teams/groups changed'; END IF;
 IF EXISTS (SELECT 1 FROM schedule_players p WHERE (SELECT count(*) FROM public.players pl JOIN public.teams t ON t.id=pl.team_id WHERE pl.tournament_id=tid AND t.name='Đội '||p.team_no AND pl.full_name=p.full_name AND pl.gender::text=p.gender)<>1) THEN RAISE EXCEPTION 'Expected player name, team or gender missing/ambiguous'; END IF;
 IF (SELECT count(*) FROM schedule_rows)<>45 OR (SELECT count(*) FROM (SELECT DISTINCT round_no,court,team_a,team_b FROM schedule_rows) q)<>15 THEN RAISE EXCEPTION 'Schedule row count invalid'; END IF;
 IF EXISTS (SELECT 1 FROM schedule_rows s CROSS JOIN LATERAL (VALUES (s.team_a,s.a1),(s.team_a,s.a2),(s.team_b,s.b1),(s.team_b,s.b2)) v(team_no,alias) LEFT JOIN schedule_players p ON p.team_no=v.team_no AND p.alias=v.alias WHERE p.alias IS NULL) THEN RAISE EXCEPTION 'Schedule has unknown player alias'; END IF;
 IF EXISTS (SELECT 1 FROM schedule_rows s CROSS JOIN LATERAL (VALUES (s.team_a,s.a1,s.a2),(s.team_b,s.b1,s.b2)) v(team_no,p1,p2) JOIN schedule_players p1 ON p1.team_no=v.team_no AND p1.alias=v.p1 JOIN schedule_players p2 ON p2.team_no=v.team_no AND p2.alias=v.p2 WHERE v.p1=v.p2 OR (s.kind='mixed_doubles' AND p1.gender=p2.gender) OR (s.kind='doubles' AND (p1.gender<>'m' OR p2.gender<>'m'))) THEN RAISE EXCEPTION 'Invalid lineup or gender'; END IF;
 -- Stop if any existing match, score, lineup or assignment changed since review.
 IF md5(coalesce((SELECT string_agg(to_jsonb(t)::text,',' ORDER BY id) FROM public.ties t WHERE tournament_id=tid),'') || '|' || coalesce((SELECT string_agg(to_jsonb(r)::text,',' ORDER BY id) FROM public.rubbers r WHERE tournament_id=tid),'') || '|' || coalesce((SELECT string_agg(to_jsonb(g)::text,',' ORDER BY id) FROM public.games g WHERE tournament_id=tid),'') || '|' || coalesce((SELECT string_agg(to_jsonb(p)::text,',' ORDER BY id) FROM public.rubber_players p WHERE tournament_id=tid),'')) <> 'af4b65ac80192026b8350b4fb39e4b18' THEN RAISE EXCEPTION 'Existing schedule changed since review; refresh fingerprint and review impact'; END IF;
 RAISE NOTICE 'Will replace % ties, % rubbers, % games, % lineup rows, % referee assignments', (SELECT count(*) FROM public.ties WHERE tournament_id=tid), (SELECT count(*) FROM public.rubbers WHERE tournament_id=tid), (SELECT count(*) FROM public.games WHERE tournament_id=tid), (SELECT count(*) FROM public.rubber_players WHERE tournament_id=tid), (SELECT count(*) FROM public.rubbers WHERE tournament_id=tid AND referee_id IS NOT NULL);
 DELETE FROM public.ties WHERE tournament_id=tid;
 FOR x IN SELECT DISTINCT round_no,court,team_a,team_b FROM schedule_rows ORDER BY round_no,court LOOP
   INSERT INTO public.ties(tournament_id,stage,group_id,round_label,round_order,team_a_id,team_b_id,court,scheduled_at)
   SELECT tid,'group',gid,'Vòng '||x.round_no,x.round_no,ta.id,tb.id,'Sân '||x.court, (timestamp '2026-10-31 08:15:00' + (x.round_no-1)*21*interval '1 minute') AT TIME ZONE 'Asia/Ho_Chi_Minh'
   FROM public.teams ta, public.teams tb WHERE ta.tournament_id=tid AND ta.name='Đội '||x.team_a AND tb.tournament_id=tid AND tb.name='Đội '||x.team_b RETURNING id INTO new_tie;
   FOR n IN 1..3 LOOP
     SELECT * INTO STRICT x FROM schedule_rows WHERE round_no=x.round_no AND court=x.court AND position=n;
     UPDATE public.rubbers SET kind=x.kind::public.rubber_kind,court='Sân '||x.court,scheduled_at=(timestamp '2026-10-31 08:15:00' + ((x.round_no-1)*3+x.position-1)*7*interval '1 minute') AT TIME ZONE 'Asia/Ho_Chi_Minh' WHERE tie_id=new_tie AND position=n RETURNING id INTO STRICT new_rubber;
     FOR side_name,team_num,alias_name IN SELECT * FROM (VALUES ('a',x.team_a,x.a1),('a',x.team_a,x.a2),('b',x.team_b,x.b1),('b',x.team_b,x.b2)) AS v(side_name,team_num,alias_name) LOOP
       SELECT pl.id INTO STRICT pid FROM schedule_players sp JOIN public.teams t ON t.tournament_id=tid AND t.name='Đội '||sp.team_no JOIN public.players pl ON pl.team_id=t.id AND pl.tournament_id=tid AND pl.full_name=sp.full_name WHERE sp.team_no=team_num AND sp.alias=alias_name;
       INSERT INTO public.rubber_players(tournament_id,rubber_id,side,player_id) VALUES(tid,new_rubber,side_name::public.side,pid);
     END LOOP;
   END LOOP;
 END LOOP;
 IF (SELECT count(*) FROM public.ties WHERE tournament_id=tid)<>15 OR (SELECT count(*) FROM public.rubbers WHERE tournament_id=tid)<>45 OR (SELECT count(*) FROM public.rubber_players WHERE tournament_id=tid)<>180 THEN RAISE EXCEPTION 'Seed count validation failed'; END IF;
END;
IF dry_run THEN
  RAISE EXCEPTION 'DRY RUN OK: 15 ties, 45 rubbers and 180 lineup rows validated; transaction rolled back';
END IF;
END $seed$;
