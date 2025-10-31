-- migration: 20251031120100_disable_reports_rls.sql
-- description: disables row-level security and removes all associated policies for the public.reports table. this change effectively makes the table's data accessible and modifiable through service role or functions, removing the previous restrictions that limited access to data owners.

--
-- section: drop rls policies for reports table
-- description: remove all existing row-level security policies on the public.reports table to open up data access.
--

-- drop anonymous user policies
drop policy if exists reports_anon_select on public.reports;
drop policy if exists reports_anon_insert on public.reports;
drop policy if exists reports_anon_update on public.reports;
drop policy if exists reports_anon_delete on public.reports;

-- drop authenticated user policies
drop policy if exists reports_auth_select on public.reports;
drop policy if exists reports_auth_insert on public.reports;
drop policy if exists reports_auth_update on public.reports;
drop policy if exists reports_auth_delete on public.reports;

--
-- section: disable row level security
-- description: disable row-level security on the public.reports table.
--
alter table public.reports disable row level security;

