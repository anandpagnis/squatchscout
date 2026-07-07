-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 08 booking slot guard: no double-booking + range index     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- btree_gist lets a GiST index mix scalar equality (contractor_id) with
-- range overlap (scheduled window) in one exclusion constraint.
create extension if not exists btree_gist;

-- No two ACTIVE bookings for the same contractor may overlap in time.
-- Active = anything a customer or pro still expects to happen; terminal or
-- rejected states (declined/cancelled/completed/refunded) release the slot so
-- it can be rebooked. Half-open range '[)' lets back-to-back bookings share a
-- boundary (one ends 10:00, next starts 10:00).
alter table public.bookings
  add constraint bookings_no_double_booking
  exclude using gist (
    contractor_id with =,
    tstzrange(scheduled_start, scheduled_end, '[)') with &&
  )
  where (
    status in ('requested', 'accepted', 'scheduled', 'in_progress')
    and scheduled_start is not null
    and scheduled_end is not null
    and deleted_at is null
  );

-- The slot picker asks "what does contractor X have between date A and B?".
-- bookings_schedule_idx is on scheduled_start alone; this composite serves
-- the per-contractor range scan directly.
create index bookings_contractor_schedule_idx
  on public.bookings (contractor_id, scheduled_start);
