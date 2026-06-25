-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 01 profiles: customer + contractor profiles, addresses     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── customer_profiles ────────────────────────────────────────────────────────
create table public.customer_profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references public.users (id) on delete cascade,
  default_address    text,
  lat                double precision,
  lng                double precision,
  stripe_customer_id text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger customer_profiles_set_updated_at
  before update on public.customer_profiles
  for each row execute function public.set_updated_at();

-- ── customer_addresses ───────────────────────────────────────────────────────
create table public.customer_addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users (id) on delete cascade,
  label       text,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  zip         text not null,
  lat         double precision,
  lng         double precision,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index customer_addresses_customer_idx on public.customer_addresses (customer_id) where deleted_at is null;
create unique index customer_addresses_one_default
  on public.customer_addresses (customer_id) where is_default and deleted_at is null;
create trigger customer_addresses_set_updated_at
  before update on public.customer_addresses
  for each row execute function public.set_updated_at();

-- ── contractor_profiles ──────────────────────────────────────────────────────
create table public.contractor_profiles (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references public.users (id) on delete cascade,
  slug                    text unique,
  business_name           text not null,
  headline                text,
  bio                     text,
  avatar_url              text,          -- public display avatar (kept off users for PII safety)
  years_experience        integer not null default 0,
  base_lat                double precision,
  base_lng                double precision,
  base_city               text,
  base_state              text,
  service_radius_miles    integer not null default 25,
  verification_status     public.verification_status not null default 'pending',
  background_check_status public.check_status not null default 'not_started',
  insurance_url           text,          -- private storage (verification bucket)
  id_doc_url              text,          -- private storage (verification bucket)
  stripe_account_id       text,          -- Stripe Connect account
  payouts_enabled         boolean not null default false,
  rating_avg              numeric(3,2) not null default 0,
  rating_count            integer not null default 0,
  jobs_completed          integer not null default 0,
  response_time_mins      integer,
  is_active               boolean not null default false,  -- live = approved + toggled on
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz,
  constraint rating_avg_range check (rating_avg >= 0 and rating_avg <= 5)
);
create index contractor_profiles_active_idx
  on public.contractor_profiles (is_active, verification_status) where deleted_at is null;
create index contractor_profiles_geo_idx on public.contractor_profiles (base_lat, base_lng);
create index contractor_profiles_rating_idx on public.contractor_profiles (rating_avg desc);
create trigger contractor_profiles_set_updated_at
  before update on public.contractor_profiles
  for each row execute function public.set_updated_at();

-- Helper: is the current user a contractor whose profile is publicly live?
create or replace function public.is_live_contractor(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.contractor_profiles
    where id = p_id and is_active and verification_status = 'approved' and deleted_at is null
  );
$$;
grant execute on function public.is_live_contractor(uuid) to anon, authenticated;

-- A contractor may edit their profile but NOT approve themselves: verification,
-- background-check and payout flags are staff-controlled.
create or replace function public.guard_contractor_verification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if new.verification_status     is distinct from old.verification_status
       or new.background_check_status is distinct from old.background_check_status
       or new.payouts_enabled         is distinct from old.payouts_enabled then
      raise exception 'Verification, background-check and payout flags are managed by SquatchScout staff';
    end if;
  end if;
  return new;
end;
$$;
create trigger contractor_profiles_guard_verification
  before update on public.contractor_profiles
  for each row execute function public.guard_contractor_verification();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.customer_profiles   enable row level security;
alter table public.customer_addresses  enable row level security;
alter table public.contractor_profiles enable row level security;

-- customer_profiles: owner + admin only
create policy "customer_profiles: owner" on public.customer_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "customer_profiles: admin" on public.customer_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- customer_addresses: owner + admin (contractors get booking-scoped access later)
create policy "customer_addresses: owner" on public.customer_addresses
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "customer_addresses: admin" on public.customer_addresses
  for all using (public.is_admin()) with check (public.is_admin());

-- contractor_profiles: public can read LIVE pros; owner manages own; admin all
create policy "contractor_profiles: public reads live" on public.contractor_profiles
  for select using (is_active and verification_status = 'approved' and deleted_at is null);
create policy "contractor_profiles: owner reads own" on public.contractor_profiles
  for select using (user_id = auth.uid());
create policy "contractor_profiles: owner writes own" on public.contractor_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "contractor_profiles: owner inserts own" on public.contractor_profiles
  for insert with check (user_id = auth.uid());
create policy "contractor_profiles: admin" on public.contractor_profiles
  for all using (public.is_admin()) with check (public.is_admin());
