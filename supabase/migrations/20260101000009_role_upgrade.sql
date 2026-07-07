-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 09 role upgrade: let trusted server code change user role  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Phase 7.7 adds a self-serve customer → contractor upgrade ("Become a Scout
-- Pro") and a role-selection step for first-time Google OAuth signups. Both
-- perform the role transition in a server action via the service-role client
-- (lib/supabase/admin.ts) after verifying the authenticated user and their
-- current role.
--
-- The guard_user_sensitive_fields trigger (migration 00) blocked EVERY
-- non-admin role/status change — including the service role, which bypasses
-- RLS but not triggers. Relax it with the same trusted-writer detection as the
-- migration-07 money guards: `auth.uid() is null` admits the service role,
-- seeds and psql, while browser-originated sessions always carry an auth.uid()
-- and stay blocked. Direct PostgREST self-escalation therefore still fails.
create or replace function public.guard_user_sensitive_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin may change role or status';
  end if;
  return new;
end;
$$;
