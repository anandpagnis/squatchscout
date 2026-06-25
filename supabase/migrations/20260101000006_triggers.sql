-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout — 06 triggers: new-user provisioning, rollups, grants, RT    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── Provision public.users + role profile when an auth user is created ───────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare
  v_role public.user_role;
begin
  v_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'role', '')::public.user_role,
    'customer'
  );

  insert into public.users (id, email, role, full_name, phone, avatar_url)
  values (
    new.id,
    new.email,
    v_role,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  -- Mirror role into app_metadata (not user-editable) so the JWT carries it.
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object('role', v_role::text)
  where id = new.id;

  if v_role = 'customer' then
    insert into public.customer_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  elsif v_role = 'contractor' then
    insert into public.contractor_profiles (user_id, business_name)
    values (
      new.id,
      coalesce(
        nullif(new.raw_user_meta_data ->> 'business_name', ''),
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        'New Scout Pro'
      )
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Keep contractor rating_avg / rating_count in sync with reviews ───────────
create or replace function public.update_contractor_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_id uuid := coalesce(new.contractor_id, old.contractor_id);
begin
  update public.contractor_profiles cp
  set rating_avg   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where contractor_id = v_id), 0),
      rating_count = (select count(*) from public.reviews where contractor_id = v_id)
  where cp.id = v_id;
  return null;
end;
$$;
create trigger reviews_rating_rollup
  after insert or delete or update of rating on public.reviews
  for each row execute function public.update_contractor_rating();

-- ── Booking lifecycle: stamp timestamps + bump jobs_completed ────────────────
create or replace function public.on_booking_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.accepted_at := coalesce(new.accepted_at, now());
  end if;
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    new.cancelled_at := coalesce(new.cancelled_at, now());
  end if;
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at := coalesce(new.completed_at, now());
    update public.contractor_profiles
    set jobs_completed = jobs_completed + 1
    where id = new.contractor_id;
  end if;
  return new;
end;
$$;
create trigger bookings_status_change
  before update of status on public.bookings
  for each row execute function public.on_booking_status_change();

-- ── Bump conversation.last_message_at on each new message ────────────────────
create or replace function public.touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return null;
end;
$$;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ── Privileges (RLS still governs row visibility) ────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- ── Realtime: stream chat, notifications and booking updates ─────────────────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
    alter publication supabase_realtime add table public.notifications;
    alter publication supabase_realtime add table public.bookings;
    alter publication supabase_realtime add table public.conversations;
  end if;
end
$$;
