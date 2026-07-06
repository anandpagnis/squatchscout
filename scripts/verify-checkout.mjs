// Smoke test: end-to-end checkout write path — mirrors payBooking in
// src/app/checkout/actions.ts (keep in sync if that action changes).
// Requires the local stack with seed data. Run: node scripts/verify-checkout.mjs
import { createClient } from "@supabase/supabase-js";

const URL = "http://127.0.0.1:54321";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const round = (n) => Math.round(n * 100) / 100;
let pass = 0, fail = 0;
const report = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (ok) pass++;
  else fail++;
};
const die = (msg, err) => {
  console.error("SETUP FAILURE:", msg, err ?? "");
  process.exit(1);
};

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const customer = createClient(URL, ANON, { auth: { persistSession: false } });
const pro = createClient(URL, ANON, { auth: { persistSession: false } });

// ── Step 1: customer signs in and books (mirrors /book wizard insert) ────────
{
  const { error } = await customer.auth.signInWithPassword({ email: "jordan@example.com", password: "password123" });
  if (error) die("customer login", error.message);
}
const { data: { user: cust } } = await customer.auth.getUser();

const { data: svc } = await customer
  .from("contractor_services")
  .select("service_id, price, contractor_id")
  .eq("is_active", true)
  .not("price", "is", null)
  .limit(1)
  .single();
if (!svc) die("no active contractor service in seed");

const quoted = Number(svc.price);
const start = new Date(Date.now() + 48 * 3600 * 1000);
const { data: created, error: insErr } = await customer
  .from("bookings")
  .insert({
    customer_id: cust.id,
    contractor_id: svc.contractor_id,
    service_id: svc.service_id,
    status: "requested",
    scheduled_start: start.toISOString(),
    scheduled_end: new Date(start.getTime() + 2 * 3600 * 1000).toISOString(),
    address_line1: "600 Cascade Trail",
    city: "Bend", state: "OR", zip: "97701",
    job_notes: "verify-checkout e2e run",
    quoted_price: quoted,
  })
  .select("id, booking_number")
  .single();
if (insErr) die("customer booking insert", insErr.message);
report("customer creates booking (requested)", true, `${created.booking_number}, quoted=${quoted}`);

// ── Step 2: the assigned contractor accepts (mirrors den updateJobStatus) ────
{
  const { data: cp } = await admin
    .from("contractor_profiles")
    .select("user_id, user:users!contractor_profiles_user_id_fkey(email)")
    .eq("id", svc.contractor_id)
    .single();
  const email = cp?.user?.email;
  const { error } = await pro.auth.signInWithPassword({ email, password: "password123" });
  if (error) die(`contractor login (${email})`, error.message);
  const { data, error: updErr } = await pro
    .from("bookings")
    .update({ status: "accepted" })
    .eq("id", created.id)
    .select("id, status");
  report("contractor accepts booking", !updErr && data?.[0]?.status === "accepted", updErr?.message);
}

// ── Step 3: the exact payBooking admin writes (patched version, with checks) ─
const tip = 15;
const subtotal = quoted;
const serviceTotal = round(subtotal); // no promo
const platformFee = round(serviceTotal * 0.15);
const payout = round(serviceTotal - platformFee + tip);
const amount = round(serviceTotal + tip);
const chargeId = `mock_${Date.now()}`;

{
  const { error } = await admin.from("payments").insert({
    booking_id: created.id,
    customer_id: cust.id,
    contractor_id: svc.contractor_id,
    amount, tip, platform_fee: platformFee, payout_amount: payout,
    currency: "usd",
    stripe_payment_intent_id: chargeId,
    status: "paid",
    paid_at: new Date().toISOString(),
  });
  report("admin payments insert succeeds", !error, error?.message);
}
{
  const { error } = await admin
    .from("bookings")
    .update({ status: "scheduled", tip, final_price: serviceTotal, platform_fee: platformFee, contractor_payout: payout })
    .eq("id", created.id);
  report("admin booking money/status update succeeds", !error, error?.message);
}
{
  // notifyContractor path also writes via admin client
  const { data: cp } = await admin.from("contractor_profiles").select("user_id").eq("id", svc.contractor_id).single();
  const { error } = await admin.from("notifications").insert({
    user_id: cp.user_id, type: "booking_paid", title: "You're booked & paid 💸",
    body: "verify-checkout e2e run", link: `/den/jobs/${created.id}`,
  });
  report("admin notification insert succeeds", !error, error?.message);
}

// ── Step 4: independently confirm what actually landed in the DB ─────────────
{
  const { data: b } = await admin
    .from("bookings")
    .select("status, tip, final_price, platform_fee, contractor_payout")
    .eq("id", created.id)
    .single();
  const ok =
    b.status === "scheduled" &&
    Number(b.final_price) === serviceTotal &&
    Number(b.platform_fee) === platformFee &&
    Number(b.contractor_payout) === payout &&
    Number(b.tip) === tip;
  report(
    "DB: booking row persisted correctly",
    ok,
    `status=${b.status} final_price=${b.final_price} fee=${b.platform_fee} payout=${b.contractor_payout} tip=${b.tip}`,
  );
}
{
  const { data: p } = await admin
    .from("payments")
    .select("amount, payout_amount, status, stripe_payment_intent_id")
    .eq("booking_id", created.id)
    .single();
  const ok = p && Number(p.amount) === amount && Number(p.payout_amount) === payout && p.status === "paid" && p.stripe_payment_intent_id === chargeId;
  report("DB: payment row persisted correctly", !!ok, p ? `amount=${p.amount} payout=${p.payout_amount} status=${p.status}` : "row missing");
}
{
  // Customer can see their own payment via RLS (booking detail page reads this)
  const { data, error } = await customer.from("payments").select("amount, status").eq("booking_id", created.id);
  report("customer can read own payment (RLS)", !error && data?.length === 1, error?.message ?? `${data?.length} rows`);
}

// ── Cleanup: remove the test booking + payment + notification ────────────────
await admin.from("payments").delete().eq("booking_id", created.id);
await admin.from("notifications").delete().eq("link", `/den/jobs/${created.id}`);
await admin.from("bookings").delete().eq("id", created.id);
console.log(`\ncleaned up test rows for ${created.booking_number}`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
