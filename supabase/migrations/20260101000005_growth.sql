-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 05 growth: promo codes, referrals, disputes                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── promo_codes ──────────────────────────────────────────────────────────────
create table public.promo_codes (
  id           uuid primary key default gen_random_uuid(),
  code         citext not null unique,
  type         public.promo_type not null,
  value        numeric(10,2) not null,
  min_subtotal numeric(10,2),
  max_uses     integer,
  used_count   integer not null default 0,
  expires_at   timestamptz,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger promo_codes_set_updated_at
  before update on public.promo_codes
  for each row execute function public.set_updated_at();

-- ── referrals ────────────────────────────────────────────────────────────────
create table public.referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.users (id) on delete cascade,
  referred_user_id uuid references public.users (id) on delete set null,
  code             text not null,
  reward_status    public.referral_status not null default 'pending',
  created_at       timestamptz not null default now()
);
create index referrals_referrer_idx on public.referrals (referrer_user_id);
create index referrals_code_idx on public.referrals (code);

-- ── disputes ─────────────────────────────────────────────────────────────────
create table public.disputes (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings (id) on delete cascade,
  opened_by   uuid not null references public.users (id) on delete set null,
  subject     text not null,
  description text,
  status      public.dispute_status not null default 'open',
  resolution  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index disputes_booking_idx on public.disputes (booking_id);
create trigger disputes_set_updated_at
  before update on public.disputes
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.promo_codes enable row level security;
alter table public.referrals   enable row level security;
alter table public.disputes    enable row level security;

-- promo_codes: anyone signed in can read ACTIVE codes (to validate at checkout); admin writes
create policy "promo_codes: read active" on public.promo_codes
  for select using (active and (expires_at is null or expires_at > now()));
create policy "promo_codes: admin" on public.promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- referrals: referrer reads own; admin all (creation server-side)
create policy "referrals: referrer reads" on public.referrals
  for select using (referrer_user_id = auth.uid());
create policy "referrals: referrer creates" on public.referrals
  for insert with check (referrer_user_id = auth.uid());
create policy "referrals: admin" on public.referrals
  for all using (public.is_admin()) with check (public.is_admin());

-- disputes: booking parties read + open; admin resolves
create policy "disputes: party reads" on public.disputes
  for select using (public.is_booking_party(booking_id));
create policy "disputes: party opens" on public.disputes
  for insert with check (opened_by = auth.uid() and public.is_booking_party(booking_id));
create policy "disputes: admin" on public.disputes
  for all using (public.is_admin()) with check (public.is_admin());
