create or replace function public.guard_last_organizer() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if pg_trigger_depth()>1 then return old; end if;
 if (select count(*) from public.tournament_organizers where tournament_id=old.tournament_id)<=1 then raise exception 'last_organizer'; end if;
 return old;
end $$;
