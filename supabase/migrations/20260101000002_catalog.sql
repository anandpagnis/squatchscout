-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 02 catalog: categories, services, pricing, availability    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Ownership helpers (contractor_id == contractor_profiles.id).
create or replace function public.owns_contractor(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.contractor_profiles
    where id = p_id and user_id = auth.uid()
  );
$$;
create or replace function public.current_contractor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.contractor_profiles where user_id = auth.uid();
$$;
grant execute on function public.owns_contractor(uuid) to authenticated;
grant execute on function public.current_contractor_id() to authenticated;

-- ── service_categories ───────────────────────────────────────────────────────
create table public.service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text,            -- lucide icon name
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger service_categories_set_updated_at
  before update on public.service_categories
  for each row execute function public.set_updated_at();

-- ── services ─────────────────────────────────────────────────────────────────
create table public.services (
  id                   uuid primary key default gen_random_uuid(),
  category_id          uuid not null references public.service_categories (id) on delete cascade,
  name                 text not null,
  slug                 text not null unique,
  description          text,
  default_pricing_type public.pricing_type not null default 'hourly',
  suggested_min_price  numeric(10,2),
  est_duration_mins    integer,
  image_url            text,
  sort_order           integer not null default 0,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index services_category_idx on public.services (category_id);
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ── contractor_services (what a pro offers + their rate) ─────────────────────
create table public.contractor_services (
  id            uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles (id) on delete cascade,
  service_id    uuid not null references public.services (id) on delete cascade,
  pricing_type  public.pricing_type not null default 'hourly',
  price         numeric(10,2),
  price_unit    text not null default 'per hour',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (contractor_id, service_id)
);
create index contractor_services_service_idx on public.contractor_services (service_id) where is_active;
create index contractor_services_contractor_idx on public.contractor_services (contractor_id);
create trigger contractor_services_set_updated_at
  before update on public.contractor_services
  for each row execute function public.set_updated_at();

-- ── availability (weekly recurring) ──────────────────────────────────────────
create table public.availability (
  id            uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles (id) on delete cascade,
  day_of_week   smallint not null check (day_of_week between 0 and 6),  -- 0 = Sunday
  start_time    time not null,
  end_time      time not null,
  created_at    timestamptz not null default now(),
  check (end_time > start_time)
);
create index availability_contractor_idx on public.availability (contractor_id);

-- ── availability_blocks (time off / booked) ──────────────────────────────────
create table public.availability_blocks (
  id             uuid primary key default gen_random_uuid(),
  contractor_id  uuid not null references public.contractor_profiles (id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime   timestamptz not null,
  reason         text,
  created_at     timestamptz not null default now(),
  check (end_datetime > start_datetime)
);
create index availability_blocks_contractor_idx on public.availability_blocks (contractor_id, start_datetime);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.service_categories   enable row level security;
alter table public.services             enable row level security;
alter table public.contractor_services  enable row level security;
alter table public.availability         enable row level security;
alter table public.availability_blocks  enable row level security;

-- Catalog is public read; admin write.
create policy "service_categories: public read" on public.service_categories
  for select using (true);
create policy "service_categories: admin write" on public.service_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "services: public read" on public.services
  for select using (true);
create policy "services: admin write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- Contractor pricing: public read; owner manages own; admin all.
create policy "contractor_services: public read" on public.contractor_services
  for select using (true);
create policy "contractor_services: owner writes" on public.contractor_services
  for all using (public.owns_contractor(contractor_id))
  with check (public.owns_contractor(contractor_id));
create policy "contractor_services: admin" on public.contractor_services
  for all using (public.is_admin()) with check (public.is_admin());

-- Availability: public read (booking UI); owner manages; admin all.
create policy "availability: public read" on public.availability
  for select using (true);
create policy "availability: owner writes" on public.availability
  for all using (public.owns_contractor(contractor_id))
  with check (public.owns_contractor(contractor_id));
create policy "availability: admin" on public.availability
  for all using (public.is_admin()) with check (public.is_admin());

create policy "availability_blocks: public read" on public.availability_blocks
  for select using (true);
create policy "availability_blocks: owner writes" on public.availability_blocks
  for all using (public.owns_contractor(contractor_id))
  with check (public.owns_contractor(contractor_id));
create policy "availability_blocks: admin" on public.availability_blocks
  for all using (public.is_admin()) with check (public.is_admin());
