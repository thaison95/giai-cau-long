-- Migration 20261029040000: Fix RLS for tournament creation with RETURNING clause
-- When inserting a tournament with status='draft', RETURNING id enforces the SELECT policy (WCO_RLS_SELECT_CHECK).
-- At that exact instant, the AFTER INSERT trigger has not yet added the user to tournament_organizers,
-- causing is_organizer(id) to be false and raising 42501.
-- Adding created_by = auth.uid() directly allows the insert ... returning to succeed cleanly.

alter table public.tournaments alter column created_by set default auth.uid();

drop policy if exists tournament_read on public.tournaments;
create policy tournament_read on public.tournaments for select using (
  status <> 'draft' or created_by = auth.uid() or public.is_organizer(id)
);

create or replace function public.is_tournament_visible(p_tournament_id uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.tournaments
    where id = p_tournament_id
      and (status <> 'draft' or created_by = auth.uid() or public.is_organizer(id))
  )
$$;

drop policy if exists tournament_update on public.tournaments;
create policy tournament_update on public.tournaments for update to authenticated
  using (created_by = auth.uid() or public.is_organizer(id))
  with check (created_by = auth.uid() or public.is_organizer(id));

drop policy if exists tournament_delete on public.tournaments;
create policy tournament_delete on public.tournaments for delete to authenticated
  using (created_by = auth.uid() or public.is_organizer(id));

drop policy if exists organizers_read on public.tournament_organizers;
create policy organizers_read on public.tournament_organizers for select
  using (user_id = auth.uid() or public.is_organizer(tournament_id));
