-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 04 engagement: reviews, messaging, favorites, notifs, log  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── reviews (two-way; customer→pro is the public one) ────────────────────────
create table public.reviews (
  id                    uuid primary key default gen_random_uuid(),
  booking_id            uuid not null unique references public.bookings (id) on delete cascade,
  customer_id           uuid not null references public.users (id) on delete cascade,
  contractor_id         uuid not null references public.contractor_profiles (id) on delete cascade,
  rating                smallint not null check (rating between 1 and 5),
  comment               text,
  customer_display_name text,            -- snapshot for public display (no users PII)
  contractor_reply      text,
  -- optional reverse rating (contractor → customer)
  reverse_rating        smallint check (reverse_rating between 1 and 5),
  reverse_comment       text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index reviews_contractor_idx on public.reviews (contractor_id, created_at desc);
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Each side may only edit their own portion of a review.
create or replace function public.guard_review_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if auth.uid() = old.customer_id then
    new.contractor_reply := old.contractor_reply;       -- customer can't write the reply
    new.reverse_rating   := old.reverse_rating;
    new.reverse_comment  := old.reverse_comment;
  elsif public.owns_contractor(old.contractor_id) then
    new.rating                := old.rating;             -- pro can't alter the rating/comment
    new.comment               := old.comment;
    new.customer_display_name := old.customer_display_name;
    new.customer_id           := old.customer_id;
  end if;
  return new;
end;
$$;
create trigger reviews_guard_fields
  before update on public.reviews
  for each row execute function public.guard_review_fields();

-- ── conversations + messages ─────────────────────────────────────────────────
create table public.conversations (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.users (id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles (id) on delete cascade,
  booking_id    uuid references public.bookings (id) on delete set null,
  last_message_at timestamptz,
  created_at    timestamptz not null default now(),
  unique (customer_id, contractor_id)
);
create index conversations_customer_idx   on public.conversations (customer_id, last_message_at desc);
create index conversations_contractor_idx on public.conversations (contractor_id, last_message_at desc);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.users (id) on delete cascade,
  body            text,
  attachment_url  text,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create or replace function public.is_conversation_party(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversations cv
    where cv.id = p_conversation_id
      and (
        cv.customer_id = auth.uid()
        or exists (
          select 1 from public.contractor_profiles c
          where c.id = cv.contractor_id and c.user_id = auth.uid()
        )
      )
  );
$$;
grant execute on function public.is_conversation_party(uuid) to authenticated;

-- ── favorites (saved pros) ───────────────────────────────────────────────────
create table public.favorites (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.users (id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (customer_id, contractor_id)
);
create index favorites_customer_idx on public.favorites (customer_id);

-- ── notifications ────────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ── activity_log (audit trail for both sides) ────────────────────────────────
create table public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users (id) on delete set null,
  actor_role  public.user_role,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index activity_log_user_idx on public.activity_log (user_id, created_at desc);
create index activity_log_entity_idx on public.activity_log (entity_type, entity_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.reviews       enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.favorites     enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log  enable row level security;

-- reviews: public read; customer authors; contractor replies; admin all
create policy "reviews: public read" on public.reviews
  for select using (true);
create policy "reviews: customer writes own" on public.reviews
  for insert with check (customer_id = auth.uid());
create policy "reviews: customer updates own" on public.reviews
  for update using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "reviews: contractor replies" on public.reviews
  for update using (public.owns_contractor(contractor_id))
  with check (public.owns_contractor(contractor_id));
create policy "reviews: admin" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- conversations: parties only
create policy "conversations: party reads" on public.conversations
  for select using (
    customer_id = auth.uid() or public.owns_contractor(contractor_id)
  );
create policy "conversations: party creates" on public.conversations
  for insert with check (
    customer_id = auth.uid() or public.owns_contractor(contractor_id)
  );
create policy "conversations: admin" on public.conversations
  for all using (public.is_admin()) with check (public.is_admin());

-- messages: only conversation parties; sender must be self
create policy "messages: party reads" on public.messages
  for select using (public.is_conversation_party(conversation_id));
create policy "messages: party sends" on public.messages
  for insert with check (
    sender_id = auth.uid() and public.is_conversation_party(conversation_id)
  );
create policy "messages: mark read" on public.messages
  for update using (public.is_conversation_party(conversation_id))
  with check (public.is_conversation_party(conversation_id));
create policy "messages: admin" on public.messages
  for all using (public.is_admin()) with check (public.is_admin());

-- favorites: owner only
create policy "favorites: owner" on public.favorites
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

-- notifications: owner reads + marks read (created server-side)
create policy "notifications: owner reads" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications: owner updates" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: admin" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- activity_log: owner reads own; admin all (writes happen server-side)
create policy "activity_log: owner reads" on public.activity_log
  for select using (user_id = auth.uid());
create policy "activity_log: admin" on public.activity_log
  for all using (public.is_admin()) with check (public.is_admin());
