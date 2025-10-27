-- migration: 20251027110000_disable_symptoms_rls.sql
-- description: disables row-level security and removes all associated policies for the public.symptoms table. this change effectively makes the table's data publicly accessible and modifiable by any authenticated or anonymous user, removing the previous restrictions that limited access to data owners.

--
-- section: drop rls policies for symptoms table
-- description: remove all existing row-level security policies on the public.symptoms table to open up data access.
--

-- drop anonymous user policies
drop policy if exists symptoms_anon_select on public.symptoms;
drop policy if exists symptoms_anon_insert on public.symptoms;
drop policy if exists symptoms_anon_update on public.symptoms;
drop policy if exists symptoms_anon_delete on public.symptoms;

-- drop authenticated user policies
drop policy if exists symptoms_auth_select on public.symptoms;
drop policy if exists symptoms_auth_insert on public.symptoms;
drop policy if exists symptoms_auth_update on public.symptoms;
drop policy if exists symptoms_auth_delete on public.symptoms;

--
-- section: disable row level security
-- description: disable row-level security on the public.symptoms table.
--
alter table public.symptoms disable row level security;
