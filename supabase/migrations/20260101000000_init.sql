-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 00 init: extensions, enums, helpers, users + RLS plumbing  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create extension if not exists pgcrypto;   -- gen_random_uuid(), crypt()
create extension if not exists citext;      -- case-insensitive email

-- ── Enums ────────────────────────────────────────────────────────────────────
create type public.user_role           as enum ('customer', 'contractor', 'admin');
create type public.user_status         as enum ('active', 'suspended');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.check_status        as enum ('not_started', 'pending', 'passed', 'failed');
create type public.pricing_type        as enum ('hourly', 'fixed', 'quote');
create type public.booking_status      as enum (
  'requested', 'accepted', 'declined', 'scheduled',
  'in_progress', 'completed', 'cancelled', 'refunded'
);
create type public.quote_status        as enum ('sent', 'accepted', 'declined', 'expired');
create type public.payment_status      as enum ('pending', 'paid', 'refunded', 'failed');
create type public.promo_type          as enum ('percent', 'fixed');
create type public.referral_status     as enum ('pending', 'completed', 'rewarded');
create type public.dispute_status      as enum ('open', 'under_review', 'resolved', 'rejected');

-- ── Shared helper functions ──────────────────────────────────────────────────

-- Keep updated_at fresh on any row update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Great-circle distance in miles (no PostGIS dependency).
create or replace function public.haversine_miles(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision
language sql immutable parallel safe as $$
  select 3958.7613 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- ── users (mirrors auth.users; Supabase Auth owns password + email confirm) ──
create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role   not null default 'customer',
  email       citext             not null,
  full_name   text,
  phone       text,
  avatar_url  text,
  status      public.user_status not null default 'active',
  created_at  timestamptz        not null default now(),
  updated_at  timestamptz        not null default now(),
  deleted_at  timestamptz
);
create unique index users_email_key on public.users (email) where deleted_at is null;
create index users_role_idx on public.users (role) where deleted_at is null;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ── RLS helper functions (SECURITY DEFINER avoids recursive policy lookups) ──
create or replace function public.auth_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

grant execute on function public.auth_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.haversine_miles(double precision, double precision, double precision, double precision) to anon, authenticated;

-- Block privilege escalation: only admins may change role or status.
create or replace function public.guard_user_sensitive_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not public.is_admin() then
    raise exception 'Only an admin may change role or status';
  end if;
  return new;
end;
$$;

create trigger users_guard_sensitive
  before update on public.users
  for each row execute function public.guard_user_sensitive_fields();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.users enable row level security;

create policy "users: read own" on public.users
  for select using (id = auth.uid());

create policy "users: admin reads all" on public.users
  for select using (public.is_admin());

create policy "users: update own" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "users: admin writes all" on public.users
  for all using (public.is_admin()) with check (public.is_admin());
