-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 03 bookings: bookings, quotes, payments                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create sequence if not exists public.booking_number_seq start 1001;

-- ── bookings ─────────────────────────────────────────────────────────────────
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  booking_number  text not null unique
                  default ('SS-' || lpad(nextval('public.booking_number_seq')::text, 6, '0')),
  customer_id     uuid not null references public.users (id) on delete restrict,
  contractor_id   uuid not null references public.contractor_profiles (id) on delete restrict,
  service_id      uuid not null references public.services (id) on delete restrict,
  status          public.booking_status not null default 'requested',
  scheduled_start timestamptz,
  scheduled_end   timestamptz,

  -- Address: reference + snapshot (so the assigned pro can see it without
  -- needing access to the customer's address book).
  address_id      uuid references public.customer_addresses (id) on delete set null,
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  zip             text,
  lat             double precision,
  lng             double precision,

  job_notes       text,
  photos          text[] not null default '{}',

  quoted_price       numeric(10,2),
  final_price        numeric(10,2),
  tip                numeric(10,2) not null default 0,
  platform_fee       numeric(10,2),
  contractor_payout  numeric(10,2),
  currency           text not null default 'usd',

  cancel_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  accepted_at     timestamptz,
  completed_at    timestamptz,
  cancelled_at    timestamptz,
  deleted_at      timestamptz
);
create index bookings_customer_idx   on public.bookings (customer_id, created_at desc);
create index bookings_contractor_idx on public.bookings (contractor_id, created_at desc);
create index bookings_status_idx     on public.bookings (status);
create index bookings_schedule_idx   on public.bookings (scheduled_start);
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- True when auth.uid() is either party (customer or the booking's contractor).
create or replace function public.is_booking_party(p_booking_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.bookings b
    where b.id = p_booking_id
      and (
        b.customer_id = auth.uid()
        or exists (
          select 1 from public.contractor_profiles c
          where c.id = b.contractor_id and c.user_id = auth.uid()
        )
      )
  );
$$;
grant execute on function public.is_booking_party(uuid) to authenticated;

-- ── quotes (for quote-type jobs) ─────────────────────────────────────────────
create table public.quotes (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references public.bookings (id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles (id) on delete cascade,
  amount        numeric(10,2) not null,
  message       text,
  status        public.quote_status not null default 'sent',
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index quotes_booking_idx on public.quotes (booking_id);
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ── payments ─────────────────────────────────────────────────────────────────
create table public.payments (
  id                       uuid primary key default gen_random_uuid(),
  booking_id               uuid not null references public.bookings (id) on delete restrict,
  customer_id              uuid not null references public.users (id) on delete restrict,
  contractor_id            uuid not null references public.contractor_profiles (id) on delete restrict,
  amount                   numeric(10,2) not null,
  tip                      numeric(10,2) not null default 0,
  platform_fee             numeric(10,2) not null default 0,
  payout_amount            numeric(10,2) not null default 0,
  currency                 text not null default 'usd',
  stripe_payment_intent_id text,
  status                   public.payment_status not null default 'pending',
  paid_at                  timestamptz,
  refunded_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index payments_booking_idx on public.payments (booking_id);
create unique index payments_intent_idx on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.bookings enable row level security;
alter table public.quotes   enable row level security;
alter table public.payments enable row level security;

-- bookings: customer owns theirs; assigned contractor sees/updates theirs; admin all
create policy "bookings: customer reads own" on public.bookings
  for select using (customer_id = auth.uid());
create policy "bookings: contractor reads assigned" on public.bookings
  for select using (public.owns_contractor(contractor_id));
create policy "bookings: customer creates" on public.bookings
  for insert with check (customer_id = auth.uid());
create policy "bookings: customer updates own" on public.bookings
  for update using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "bookings: contractor updates assigned" on public.bookings
  for update using (public.owns_contractor(contractor_id))
  with check (public.owns_contractor(contractor_id));
create policy "bookings: admin" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- The assigned contractor may also read the referenced address row.
create policy "customer_addresses: assigned contractor reads" on public.customer_addresses
  for select using (
    exists (
      select 1 from public.bookings b
      join public.contractor_profiles c on c.id = b.contractor_id
      where b.address_id = customer_addresses.id and c.user_id = auth.uid()
    )
  );

-- quotes: either booking party can read; contractor manages; admin all
create policy "quotes: party reads" on public.quotes
  for select using (public.is_booking_party(booking_id));
create policy "quotes: contractor writes" on public.quotes
  for all using (public.owns_contractor(contractor_id))
  with check (public.owns_contractor(contractor_id));
create policy "quotes: customer accepts" on public.quotes
  for update using (public.is_booking_party(booking_id))
  with check (public.is_booking_party(booking_id));
create policy "quotes: admin" on public.quotes
  for all using (public.is_admin()) with check (public.is_admin());

-- payments: either party reads (no client writes — created by trusted server only)
create policy "payments: party reads" on public.payments
  for select using (public.is_booking_party(booking_id));
create policy "payments: admin" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());
