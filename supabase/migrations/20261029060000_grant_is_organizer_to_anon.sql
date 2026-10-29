-- Migration 20261029060000: Grant execute on is_organizer to anon
--
-- In migration 20261029040000, tournament_read policy was updated to:
--   using (status <> 'draft' or created_by = auth.uid() or public.is_organizer(id))
-- When an anonymous user queries public.tournaments, Postgres checks permission on public.is_organizer(uuid).
-- Because migration 20261029020000 revoked execute from anon, Postgres threw:
--   42501: permission denied for function is_organizer (mapped to HTTP 401 by PostgREST).
--
-- is_organizer only checks whether auth.uid() is in tournament_organizers.
-- For anon, auth.uid() is always NULL, safely returning FALSE without leaking any data.
-- Granting execute to anon allows anonymous viewers to query published tournaments without 401/42501 errors.

grant execute on function public.is_organizer(uuid) to anon;
