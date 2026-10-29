begin;
select plan(9);

select ok((select count(*) = 11 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity), 'RLS is enabled on all application tables');
select ok(not has_table_privilege('anon','public.referee_tokens','select'), 'anon cannot read referee tokens');
select ok(not has_table_privilege('anon','public.games','insert'), 'anon cannot insert games');
select ok(not has_table_privilege('anon','public.tournaments','update') and not has_table_privilege('anon','public.teams','update') and not has_table_privilege('anon','public.players','update') and not has_table_privilege('anon','public.ties','update') and not has_table_privilege('anon','public.rubbers','update') and not has_table_privilege('anon','public.rubber_players','update') and not has_table_privilege('anon','public.referees','update'), 'anon cannot update application data');
select ok(not has_column_privilege('authenticated','public.ties','status','update') and not has_column_privilege('authenticated','public.ties','winner_team_id','update') and not has_column_privilege('authenticated','public.rubbers','status','update') and not has_column_privilege('authenticated','public.rubbers','games_won_a','update'), 'organizers cannot update system-managed score columns');
select has_function('public','score_point',array['uuid','public.side','text']);
select has_function('public','start_rubber',array['uuid','text']);
select ok((select count(*)=3 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename in ('ties','rubbers','games')), 'score tables are in supabase_realtime');
select ok(exists(select 1 from pg_attrdef d join pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='public.tournaments'::regclass and a.attname='rubber_template' and pg_get_expr(d.adbin,d.adrelid) like '%singles%'), 'default rubber template is configured');

select * from finish();
rollback;
