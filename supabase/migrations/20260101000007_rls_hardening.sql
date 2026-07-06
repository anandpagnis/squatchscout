-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 07 RLS hardening: money-column guards + public review view ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── Fix 1a: bookings — money columns are server/admin-only on UPDATE ─────────
-- RLS lets a customer update their own booking row (needed for cancel), which
-- also let them rewrite final_price / contractor_payout / platform_fee via a
-- direct PostgREST call. Column-level restriction isn't possible in a policy,
-- so a BEFORE UPDATE trigger raises instead.
--
-- Trusted-writer detection: checkout and other privileged actions write via
-- the service-role client (lib/supabase/admin.ts), which bypasses RLS but NOT
-- triggers, and carries no auth.uid(). Allowing `auth.uid() is null` therefore
-- admits the service role, seeds and psql — while anon web users are already
-- unable to UPDATE these tables at all (every update policy requires a
-- matching auth.uid() or is_admin()), so they never reach this trigger.
create or replace function public.guard_booking_money_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.quoted_price      is distinct from old.quoted_price
     or new.final_price       is distinct from old.final_price
     or new.tip                is distinct from old.tip
     or new.platform_fee       is distinct from old.platform_fee
     or new.contractor_payout  is distinct from old.contractor_payout
     or new.currency           is distinct from old.currency then
    raise exception 'Booking price fields are managed by SquatchScout — not editable directly';
  end if;

  return new;
end;
$$;

create trigger bookings_guard_money_fields
  before update on public.bookings
  for each row execute function public.guard_booking_money_fields();

-- ── Fix 1b: quotes — customers may only accept/decline, never reprice ────────
-- The "quotes: customer accepts" policy is row-scoped, so an accepting
-- customer could also rewrite amount/expiry. Only the owning contractor (or
-- admin / server) may touch anything beyond status.
create or replace function public.guard_quote_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null
     or public.is_admin()
     or public.owns_contractor(old.contractor_id) then
    return new;
  end if;

  if new.amount           is distinct from old.amount
     or new.message        is distinct from old.message
     or new.expires_at     is distinct from old.expires_at
     or new.booking_id     is distinct from old.booking_id
     or new.contractor_id  is distinct from old.contractor_id then
    raise exception 'Only the quoting pro may change quote terms — customers may accept or decline';
  end if;

  return new;
end;
$$;

create trigger quotes_guard_fields
  before update on public.quotes
  for each row execute function public.guard_quote_fields();

-- ── Fix 2: reviews — keep the reverse (pro→customer) rating private ──────────
-- The old public-read policy exposed reverse_rating / reverse_comment to
-- everyone. Public discovery now reads a column-safe view; the base table is
-- visible only to the two booking parties and admins.
--
-- The view is intentionally SECURITY DEFINER (postgres-owned, the Postgres
-- default) so anon can still read the public columns after the base-table
-- policy tightens. It exposes exactly the columns that were always meant to
-- be public — no reverse_* fields, no customer_id.
create or replace view public.reviews_public
with (security_invoker = false) as
select
  id,
  booking_id,
  contractor_id,
  rating,
  comment,
  customer_display_name,
  contractor_reply,
  created_at
from public.reviews;

grant select on public.reviews_public to anon, authenticated;

drop policy if exists "reviews: public read" on public.reviews;

-- ── Fix 3: service_role was never granted DML on public tables ───────────────
-- Migration 06 granted anon/authenticated but not service_role, which has
-- BYPASSRLS yet no base table privileges — so every service-role write from
-- the app (checkout's payment insert + booking price update via
-- lib/supabase/admin.ts) failed with "permission denied". Grant now, and set
-- default privileges so tables added by future migrations are covered too.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;

create policy "reviews: parties and admin read" on public.reviews
  for select using (
    customer_id = auth.uid()
    or public.owns_contractor(contractor_id)
    or public.is_admin()
  );
