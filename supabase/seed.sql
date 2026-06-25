-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ SquatchScout seed — runs on `supabase db reset`.                          ║
-- ║ Full service catalog + demo admin / customers / Scout Pros / reviews.     ║
-- ║ All demo logins use password: password123                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
set search_path = public, extensions;

-- ─────────────────────────────────────────────────────────────────────────────
-- Service catalog (12 categories from the brief)
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.service_categories (name, slug, icon, description, sort_order) values
  ('Handyman & Repairs', 'handyman-repairs', 'wrench',          'General fixes, assembly and mounting around the home.', 1),
  ('Cleaning',           'cleaning',          'sparkles',        'Standard, deep and move-out cleaning by vetted pros.',  2),
  ('Plumbing',           'plumbing',          'droplets',        'Leaks, fixtures, drains and water heaters.',            3),
  ('Electrical',         'electrical',        'zap',             'Outlets, fixtures, fans, wiring and EV chargers.',      4),
  ('Painting',           'painting',          'paint-roller',    'Interior, exterior and accent walls.',                  5),
  ('Yard Work & Landscaping', 'yard-landscaping', 'trees',      'Mowing, gardening, trimming and seasonal cleanup.',     6),
  ('Moving & Hauling',   'moving-hauling',    'truck',           'Moving help, heavy items, junk removal and delivery.',  7),
  ('Event Setup',        'event-setup',       'party-popper',    'Party setup, tables, AV and teardown.',                 8),
  ('Appliance Repair',   'appliance-repair',  'washing-machine', 'Washer, dryer, fridge, dishwasher and oven repair.',    9),
  ('HVAC',               'hvac',              'thermometer',     'AC, heating and thermostat install & repair.',         10),
  ('Pest Control',       'pest-control',      'bug',             'Inspection and treatment for common pests.',           11),
  ('Home Improvement',   'home-improvement',  'hammer',          'Flooring, carpentry and deck/fence repair.',           12);

insert into public.services (category_id, name, slug, description, default_pricing_type, suggested_min_price, est_duration_mins, sort_order)
select c.id, v.name, v.slug, v.description, v.pricing::public.pricing_type, v.price, v.dur, v.sort
from (values
  -- Handyman & Repairs
  ('handyman-repairs','General Handyman','general-handyman','Odd jobs and small fixes by the hour.','hourly',65,120,1),
  ('handyman-repairs','Furniture Assembly','furniture-assembly','Flat-pack and furniture assembly.','fixed',75,90,2),
  ('handyman-repairs','TV & Shelf Mounting','tv-shelf-mounting','Wall-mount TVs, shelves and art.','fixed',90,75,3),
  ('handyman-repairs','Drywall Patching','drywall-patching','Patch holes and dents, ready to paint.','fixed',120,120,4),
  ('handyman-repairs','Door & Lock Repair','door-lock-repair','Fix sticking doors and replace locks.','fixed',95,90,5),
  -- Cleaning
  ('cleaning','Standard Home Cleaning','standard-home-cleaning','Routine top-to-bottom clean.','hourly',45,150,1),
  ('cleaning','Deep Cleaning','deep-cleaning','Detailed, every-corner clean.','fixed',180,240,2),
  ('cleaning','Move-in / Move-out Cleaning','move-in-out-cleaning','Empty-home deep clean.','fixed',220,300,3),
  ('cleaning','Carpet Cleaning','carpet-cleaning','Steam and stain treatment.','fixed',120,120,4),
  ('cleaning','Window Cleaning','window-cleaning','Interior and reachable exterior glass.','fixed',110,120,5),
  ('cleaning','Post-event Cleanup','post-event-cleanup','After-party reset and haul.','hourly',55,180,6),
  -- Plumbing
  ('plumbing','Leak Repair','leak-repair','Find and fix leaks fast.','quote',null,90,1),
  ('plumbing','Faucet & Fixture Install','faucet-fixture-install','Swap faucets and fixtures.','fixed',140,90,2),
  ('plumbing','Drain Cleaning','drain-cleaning','Clear clogged drains.','fixed',150,75,3),
  ('plumbing','Toilet Install','toilet-install','Remove and install a toilet.','fixed',200,120,4),
  ('plumbing','Water Heater Service','water-heater','Repair or replace water heaters.','quote',null,180,5),
  -- Electrical
  ('electrical','Outlet & Switch','outlet-switch','Install or replace outlets/switches.','fixed',95,60,1),
  ('electrical','Light Fixture & Ceiling Fan','light-fixture-fan-install','Hang fixtures and fans.','fixed',130,90,2),
  ('electrical','Wiring','wiring','Troubleshoot and run new wiring.','quote',null,180,3),
  ('electrical','EV Charger Install','ev-charger-install','Install a home EV charger.','quote',null,240,4),
  -- Painting
  ('painting','Interior Painting','interior-painting','Walls, trim and ceilings.','quote',null,480,1),
  ('painting','Exterior Painting','exterior-painting','Siding, trim and doors.','quote',null,600,2),
  ('painting','Accent Wall','accent-wall','One feature wall, refreshed.','fixed',160,180,3),
  ('painting','Paint Touch-ups','paint-touch-ups','Patch and touch up scuffs.','hourly',55,120,4),
  -- Yard Work & Landscaping
  ('yard-landscaping','Lawn Mowing','lawn-mowing','Mow, edge and tidy.','fixed',50,60,1),
  ('yard-landscaping','Gardening & Weeding','gardening-weeding','Beds, weeding and planting.','hourly',45,120,2),
  ('yard-landscaping','Leaf & Snow Removal','leaf-snow-removal','Seasonal clearing.','fixed',80,90,3),
  ('yard-landscaping','Hedge & Tree Trimming','hedge-tree-trimming','Shape hedges and small trees.','quote',null,150,4),
  ('yard-landscaping','Pressure Washing','pressure-washing','Drives, decks and siding.','fixed',140,150,5),
  -- Moving & Hauling
  ('moving-hauling','Moving Help','moving-help','Load, move and unload.','hourly',70,180,1),
  ('moving-hauling','Heavy-item Moving','heavy-item-moving','Pianos, safes and appliances.','quote',null,120,2),
  ('moving-hauling','Junk Removal','junk-removal','Haul away and dispose.','quote',null,90,3),
  ('moving-hauling','Furniture Delivery','furniture-delivery','Pick up and deliver.','fixed',120,120,4),
  -- Event Setup
  ('event-setup','Party & Decoration Setup','party-decoration-setup','Decor and styling.','hourly',55,180,1),
  ('event-setup','Tables, Chairs & Tent Setup','tables-chairs-tent-setup','Rentals set in place.','fixed',180,180,2),
  ('event-setup','AV Setup','av-setup','Sound and screens.','quote',null,150,3),
  ('event-setup','Teardown','teardown','Pack down and clear.','hourly',50,150,4),
  -- Appliance Repair
  ('appliance-repair','Washer & Dryer Repair','washer-dryer-repair','Diagnose and fix laundry units.','quote',null,90,1),
  ('appliance-repair','Refrigerator Repair','refrigerator-repair','Cooling and seal issues.','quote',null,90,2),
  ('appliance-repair','Dishwasher Repair','dishwasher-repair','Leaks, drainage and parts.','quote',null,75,3),
  ('appliance-repair','Oven Repair','oven-repair','Heating elements and controls.','quote',null,90,4),
  -- HVAC
  ('hvac','AC Repair & Install','ac-repair-install','Cooling service and install.','quote',null,180,1),
  ('hvac','Heating Repair','heating-repair','Furnace and heat service.','quote',null,150,2),
  ('hvac','Thermostat Install','thermostat-install','Smart thermostat setup.','fixed',120,60,3),
  -- Pest Control
  ('pest-control','Pest Inspection & Treatment','pest-inspection-treatment','Inspect and treat common pests.','quote',null,90,1),
  -- Home Improvement
  ('home-improvement','Flooring & Tile','flooring-tile','Install flooring and tile.','quote',null,480,1),
  ('home-improvement','Carpentry','carpentry','Custom builds and trim.','quote',null,300,2),
  ('home-improvement','Deck & Fence Repair','deck-fence-repair','Repair decks and fences.','quote',null,240,3)
) as v(cat_slug, name, slug, description, pricing, price, dur, sort)
join public.service_categories c on c.slug = v.cat_slug;

-- ─────────────────────────────────────────────────────────────────────────────
-- Demo auth users (handle_new_user trigger creates public.users + profiles)
-- ─────────────────────────────────────────────────────────────────────────────
-- Single DO block: avoids cross-statement function resolution in the seed
-- batcher. crypt/gen_salt are qualified to the `extensions` schema (where
-- Supabase pre-installs pgcrypto). The handle_new_user trigger turns each
-- auth.users insert into a public.users row + role profile.
do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('11111111-1111-1111-1111-111111111111'::uuid, 'admin@squatchscout.local',      'password123', '{"role":"admin","full_name":"Ada Ranger"}'::jsonb),
      ('22222222-2222-2222-2222-222222222221'::uuid, 'jordan@example.com',             'password123', '{"role":"customer","full_name":"Jordan Mills","phone":"206-555-0111"}'::jsonb),
      ('22222222-2222-2222-2222-222222222222'::uuid, 'riley@example.com',              'password123', '{"role":"customer","full_name":"Riley Chen","phone":"503-555-0122"}'::jsonb),
      ('33333333-3333-3333-3333-333333333331'::uuid, 'sasquatch.handyman@example.com', 'password123', '{"role":"contractor","full_name":"Sam Forrest","business_name":"Sasquatch Handyman Co."}'::jsonb),
      ('33333333-3333-3333-3333-333333333332'::uuid, 'evergreen.clean@example.com',    'password123', '{"role":"contractor","full_name":"Nora Pine","business_name":"Evergreen Clean"}'::jsonb),
      ('33333333-3333-3333-3333-333333333333'::uuid, 'cascade.plumbing@example.com',   'password123', '{"role":"contractor","full_name":"Marcus Reed","business_name":"Cascade Plumbing"}'::jsonb),
      ('33333333-3333-3333-3333-333333333334'::uuid, 'brightspark@example.com',        'password123', '{"role":"contractor","full_name":"Lena Watts","business_name":"BrightSpark Electric"}'::jsonb),
      ('33333333-3333-3333-3333-333333333335'::uuid, 'timberline.yard@example.com',    'password123', '{"role":"contractor","full_name":"Cole Banks","business_name":"TimberLine Landscaping"}'::jsonb),
      ('33333333-3333-3333-3333-333333333336'::uuid, 'haulbigfoot@example.com',        'password123', '{"role":"contractor","full_name":"Dev Okafor","business_name":"HaulBigfoot Moving"}'::jsonb)
    ) as t(id, email, pwd, meta)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      extensions.crypt(u.pwd, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, u.meta, now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), u.id, u.id::text,
      jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now()
    );
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Flesh out contractor profiles (verification flags are staff-guarded → disable)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.contractor_profiles disable trigger contractor_profiles_guard_verification;

update public.contractor_profiles set
  slug = 'sasquatch-handyman-co', headline = 'Your friendly neighborhood fix-it Squatch',
  bio = 'Two decades of home repairs, mounting and assembly. No job too small.',
  avatar_url = 'https://api.dicebear.com/9.x/initials/svg?seed=Sasquatch%20Handyman',
  years_experience = 18, base_lat = 47.6062, base_lng = -122.3321, base_city = 'Seattle', base_state = 'WA',
  service_radius_miles = 30, verification_status = 'approved', background_check_status = 'passed',
  payouts_enabled = true, response_time_mins = 25, jobs_completed = 214, is_active = true
where user_id = '33333333-3333-3333-3333-333333333331';

update public.contractor_profiles set
  slug = 'evergreen-clean', headline = 'Spotless homes, every time',
  bio = 'Eco-friendly products, detail-obsessed crew. Standard, deep and move-out cleans.',
  avatar_url = 'https://api.dicebear.com/9.x/initials/svg?seed=Evergreen%20Clean',
  years_experience = 9, base_lat = 47.6101, base_lng = -122.2015, base_city = 'Bellevue', base_state = 'WA',
  service_radius_miles = 25, verification_status = 'approved', background_check_status = 'passed',
  payouts_enabled = true, response_time_mins = 15, jobs_completed = 389, is_active = true
where user_id = '33333333-3333-3333-3333-333333333332';

update public.contractor_profiles set
  slug = 'cascade-plumbing', headline = 'Leaks tracked down and sealed',
  bio = 'Licensed plumber. Fast diagnosis, honest quotes, clean work.',
  avatar_url = 'https://api.dicebear.com/9.x/initials/svg?seed=Cascade%20Plumbing',
  years_experience = 14, base_lat = 45.5152, base_lng = -122.6784, base_city = 'Portland', base_state = 'OR',
  service_radius_miles = 35, verification_status = 'approved', background_check_status = 'passed',
  payouts_enabled = true, response_time_mins = 30, jobs_completed = 156, is_active = true
where user_id = '33333333-3333-3333-3333-333333333333';

update public.contractor_profiles set
  slug = 'brightspark-electric', headline = 'Bright ideas, safe wiring',
  bio = 'Master electrician. Fixtures, panels and EV chargers done right.',
  avatar_url = 'https://api.dicebear.com/9.x/initials/svg?seed=BrightSpark%20Electric',
  years_experience = 11, base_lat = 45.5234, base_lng = -122.6762, base_city = 'Portland', base_state = 'OR',
  service_radius_miles = 30, verification_status = 'approved', background_check_status = 'passed',
  payouts_enabled = true, response_time_mins = 40, jobs_completed = 98, is_active = true
where user_id = '33333333-3333-3333-3333-333333333334';

update public.contractor_profiles set
  slug = 'timberline-landscaping', headline = 'Yards worth howling about',
  bio = 'Mowing, trimming, seasonal cleanup and pressure washing.',
  avatar_url = 'https://api.dicebear.com/9.x/initials/svg?seed=TimberLine%20Landscaping',
  years_experience = 7, base_lat = 47.6740, base_lng = -122.1215, base_city = 'Redmond', base_state = 'WA',
  service_radius_miles = 28, verification_status = 'approved', background_check_status = 'passed',
  payouts_enabled = true, response_time_mins = 35, jobs_completed = 142, is_active = true
where user_id = '33333333-3333-3333-3333-333333333335';

update public.contractor_profiles set
  slug = 'haulbigfoot-moving', headline = 'Heavy lifting, light footprint',
  bio = 'Moving help, heavy items and junk removal across the metro.',
  avatar_url = 'https://api.dicebear.com/9.x/initials/svg?seed=HaulBigfoot%20Moving',
  years_experience = 6, base_lat = 41.2565, base_lng = -95.9345, base_city = 'Omaha', base_state = 'NE',
  service_radius_miles = 40, verification_status = 'approved', background_check_status = 'passed',
  payouts_enabled = true, response_time_mins = 20, jobs_completed = 167, is_active = true
where user_id = '33333333-3333-3333-3333-333333333336';

alter table public.contractor_profiles enable trigger contractor_profiles_guard_verification;

-- ─────────────────────────────────────────────────────────────────────────────
-- What each pro offers + their rates
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.contractor_services (contractor_id, service_id, pricing_type, price, price_unit)
select cp.id, s.id,
       (case when o.unit = 'quote'    then 'quote'
             when o.unit = 'per hour' then 'hourly'
             else 'fixed' end)::public.pricing_type,
       nullif(o.price, 0),
       o.unit
from (values
  ('33333333-3333-3333-3333-333333333331','general-handyman',75,'per hour'),
  ('33333333-3333-3333-3333-333333333331','furniture-assembly',85,'per job'),
  ('33333333-3333-3333-3333-333333333331','tv-shelf-mounting',99,'per job'),
  ('33333333-3333-3333-3333-333333333331','door-lock-repair',110,'per job'),
  ('33333333-3333-3333-3333-333333333332','standard-home-cleaning',55,'per hour'),
  ('33333333-3333-3333-3333-333333333332','deep-cleaning',210,'per job'),
  ('33333333-3333-3333-3333-333333333332','move-in-out-cleaning',260,'per job'),
  ('33333333-3333-3333-3333-333333333333','leak-repair',0,'quote'),
  ('33333333-3333-3333-3333-333333333333','faucet-fixture-install',160,'per job'),
  ('33333333-3333-3333-3333-333333333333','drain-cleaning',170,'per job'),
  ('33333333-3333-3333-3333-333333333334','outlet-switch',110,'per job'),
  ('33333333-3333-3333-3333-333333333334','light-fixture-fan-install',150,'per job'),
  ('33333333-3333-3333-3333-333333333334','ev-charger-install',0,'quote'),
  ('33333333-3333-3333-3333-333333333335','lawn-mowing',60,'per job'),
  ('33333333-3333-3333-3333-333333333335','hedge-tree-trimming',0,'quote'),
  ('33333333-3333-3333-3333-333333333335','pressure-washing',160,'per job'),
  ('33333333-3333-3333-3333-333333333336','moving-help',80,'per hour'),
  ('33333333-3333-3333-3333-333333333336','junk-removal',0,'quote'),
  ('33333333-3333-3333-3333-333333333336','furniture-delivery',135,'per job')
) as o(user_id, service_slug, price, unit)
join public.contractor_profiles cp on cp.user_id = o.user_id::uuid
join public.services s on s.slug = o.service_slug
on conflict (contractor_id, service_id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- Weekly availability: Mon–Sat, 8:00–18:00 for every pro
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.availability (contractor_id, day_of_week, start_time, end_time)
select cp.id, d.dow, time '08:00', time '18:00'
from public.contractor_profiles cp
cross join generate_series(1, 6) as d(dow);

-- ─────────────────────────────────────────────────────────────────────────────
-- Customer addresses + profiles
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.customer_addresses (customer_id, label, line1, city, state, zip, lat, lng, is_default) values
  ('22222222-2222-2222-2222-222222222221','Home','1812 Cedar Ave','Seattle','WA','98122',47.6145,-122.3032,true),
  ('22222222-2222-2222-2222-222222222222','Home','905 SE Alder St','Portland','OR','97214',45.5152,-122.6540,true);

update public.customer_profiles set default_address = '1812 Cedar Ave, Seattle, WA 98122', lat = 47.6145, lng = -122.3032
  where user_id = '22222222-2222-2222-2222-222222222221';
update public.customer_profiles set default_address = '905 SE Alder St, Portland, OR 97214', lat = 45.5152, lng = -122.6540
  where user_id = '22222222-2222-2222-2222-222222222222';

-- ─────────────────────────────────────────────────────────────────────────────
-- A few completed bookings + reviews (rating rollup trigger updates pros)
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.bookings (id, customer_id, contractor_id, service_id, status, scheduled_start, scheduled_end,
  address_id, address_line1, city, state, zip, job_notes, quoted_price, final_price, platform_fee, contractor_payout, completed_at)
select b.id::uuid, b.customer_id::uuid, cp.id, s.id, 'completed',
       b.start_ts::timestamptz, (b.start_ts::timestamptz + interval '2 hours'),
       ca.id, ca.line1, ca.city, ca.state, ca.zip, b.notes,
       b.price, b.price, round(b.price * 0.15, 2), round(b.price * 0.85, 2),
       (b.start_ts::timestamptz + interval '2 hours')
from (values
  ('44444444-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333331','tv-shelf-mounting','Mounted a 65" TV, looks great.',99,'2026-05-02 10:00'),
  ('44444444-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333332','standard-home-cleaning','Routine clean, 3 bed.',165,'2026-05-10 09:00'),
  ('44444444-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','faucet-fixture-install','New kitchen faucet.',160,'2026-05-12 13:00'),
  ('44444444-0000-0000-0000-000000000004','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333334','light-fixture-fan-install','Two ceiling fans.',300,'2026-05-18 11:00'),
  ('44444444-0000-0000-0000-000000000005','22222222-2222-2222-2222-222222222221','33333333-3333-3333-3333-333333333335','lawn-mowing','Front and back.',60,'2026-05-22 08:30'),
  ('44444444-0000-0000-0000-000000000006','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333336','furniture-delivery','Couch pickup + delivery.',135,'2026-05-25 14:00')
) as b(id, customer_id, contractor_id, service_slug, notes, price, start_ts)
join public.contractor_profiles cp on cp.user_id = b.contractor_id::uuid
join public.services s on s.slug = b.service_slug
join public.customer_addresses ca on ca.customer_id = b.customer_id::uuid and ca.is_default;

insert into public.reviews (booking_id, customer_id, contractor_id, rating, comment, customer_display_name)
select bk.id, bk.customer_id, bk.contractor_id, r.rating, r.comment, r.name
from (values
  ('44444444-0000-0000-0000-000000000001',5,'Fast, friendly, perfectly level. Highly recommend!','Jordan M.'),
  ('44444444-0000-0000-0000-000000000002',5,'Spotless and on time. Booking again.','Jordan M.'),
  ('44444444-0000-0000-0000-000000000003',4,'Solid work, fair price. Tidy too.','Riley C.'),
  ('44444444-0000-0000-0000-000000000004',5,'Knew exactly what to do. Both fans run quiet.','Riley C.'),
  ('44444444-0000-0000-0000-000000000005',5,'Yard looks sharp every visit.','Jordan M.'),
  ('44444444-0000-0000-0000-000000000006',4,'Careful with the couch and quick.','Riley C.')
) as r(booking_id, rating, comment, name)
join public.bookings bk on bk.id = r.booking_id::uuid;

-- A favorite + promos + a welcome notification
insert into public.favorites (customer_id, contractor_id)
select '22222222-2222-2222-2222-222222222221', id from public.contractor_profiles where slug = 'evergreen-clean';

insert into public.promo_codes (code, type, value, max_uses, expires_at, active) values
  ('SCOUT10', 'percent', 10, 1000, now() + interval '90 days', true),
  ('FIRST25', 'fixed', 25, 500, now() + interval '90 days', true);

insert into public.notifications (user_id, type, title, body, link)
select '22222222-2222-2222-2222-222222222221', 'welcome', 'Welcome to Base Camp 🏕️',
       'Scout your area and book your first job — tracks are waiting.', '/base-camp';
