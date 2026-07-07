// Smoke test: RLS + trigger guards from migrations 07 (rls_hardening) and
// 09 (role_upgrade).
// Requires the local stack with seed data (pnpm db:start + db:reset).
// Run: node scripts/verify-rls.mjs
import { createClient } from "@supabase/supabase-js";

const URL = "http://127.0.0.1:54321";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

let pass = 0;
let fail = 0;
function report(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (ok) pass++;
  else fail++;
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

// ── Setup: sign in as demo customer, find one of their bookings ─────────────
const customer = createClient(URL, ANON, { auth: { persistSession: false } });
const { error: loginErr } = await customer.auth.signInWithPassword({
  email: "jordan@example.com",
  password: "password123",
});
if (loginErr) {
  console.error("Could not sign in as demo customer:", loginErr.message);
  process.exit(1);
}
const { data: bookings } = await customer
  .from("bookings")
  .select("id, final_price, tip, job_notes, status")
  .limit(1);
const booking = bookings?.[0];
if (!booking) {
  console.error("Demo customer has no bookings — seed missing?");
  process.exit(1);
}
console.log(`Using booking ${booking.id} (status=${booking.status}, final_price=${booking.final_price})\n`);

// ── NEGATIVE 1: customer rewrites final_price → must be rejected ────────────
{
  const { error } = await customer
    .from("bookings")
    .update({ final_price: 1 })
    .eq("id", booking.id)
    .select();
  report(
    "customer UPDATE bookings.final_price rejected",
    !!error,
    error ? error.message : "update went through (BAD)",
  );
}

// ── NEGATIVE 2: customer rewrites tip → must be rejected ────────────────────
{
  const { error } = await customer
    .from("bookings")
    .update({ tip: 9999 })
    .eq("id", booking.id)
    .select();
  report("customer UPDATE bookings.tip rejected", !!error, error?.message);
}

// ── POSITIVE 1: customer can still update a non-money column ────────────────
{
  const { data, error } = await customer
    .from("bookings")
    .update({ job_notes: booking.job_notes ?? null }) // no-op value, real write
    .eq("id", booking.id)
    .select("id");
  report(
    "customer UPDATE bookings.job_notes still allowed",
    !error && data?.length === 1,
    error?.message,
  );
}

// ── POSITIVE 2: service-role client can write money columns ─────────────────
{
  const { data, error } = await admin
    .from("bookings")
    .update({ final_price: booking.final_price }) // no-op value, real write
    .eq("id", booking.id)
    .select("id");
  report(
    "service-role UPDATE bookings.final_price allowed",
    !error && data?.length === 1,
    error?.message,
  );
}

// ── NEGATIVE 3: quotes — customer cannot change amount ──────────────────────
{
  // Seed has no quotes; create one server-side against this booking.
  const { data: bk } = await admin
    .from("bookings")
    .select("id, contractor_id")
    .eq("id", booking.id)
    .single();
  const { data: quote, error: qErr } = await admin
    .from("quotes")
    .insert({ booking_id: bk.id, contractor_id: bk.contractor_id, amount: 200 })
    .select("id, amount, status")
    .single();
  if (qErr) {
    report("quotes setup", false, qErr.message);
  } else {
    const { error } = await customer
      .from("quotes")
      .update({ amount: 1 })
      .eq("id", quote.id)
      .select();
    report("customer UPDATE quotes.amount rejected", !!error, error?.message);

    // POSITIVE 3: customer CAN accept the quote (status only)
    const { data: acc, error: accErr } = await customer
      .from("quotes")
      .update({ status: "accepted" })
      .eq("id", quote.id)
      .select("id, status");
    report(
      "customer UPDATE quotes.status (accept) still allowed",
      !accErr && acc?.[0]?.status === "accepted",
      accErr?.message,
    );
    await admin.from("quotes").delete().eq("id", quote.id); // cleanup
  }
}

// ── NEGATIVE 4: anon reads base reviews table → zero rows ───────────────────
const anon = createClient(URL, ANON, { auth: { persistSession: false } });
{
  const { data, error } = await anon.from("reviews").select("id");
  report(
    "anon SELECT reviews returns no rows",
    !error && (data?.length ?? 0) === 0,
    error?.message ?? `${data?.length} rows`,
  );
}

// ── POSITIVE 4: anon reads reviews_public, no reverse fields exposed ────────
{
  const { data, error } = await anon.from("reviews_public").select("*").limit(5);
  const cols = data?.[0] ? Object.keys(data[0]) : [];
  const leaky = cols.some((c) => c.startsWith("reverse_") || c === "customer_id");
  report(
    "anon SELECT reviews_public returns rows, safe columns only",
    !error && (data?.length ?? 0) > 0 && !leaky,
    error?.message ?? `${data?.length} rows, cols: [${cols.join(", ")}]`,
  );
}

// ── POSITIVE 5: contractor reads own reviews from base table ────────────────
{
  const pro = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: pErr } = await pro.auth.signInWithPassword({
    email: "sasquatch.handyman@example.com",
    password: "password123",
  });
  if (pErr) {
    report("contractor login", false, pErr.message);
  } else {
    const { data, error } = await pro.from("reviews").select("id, reverse_rating");
    report(
      "contractor SELECT own reviews (incl. reverse fields) allowed",
      !error && (data?.length ?? 0) > 0,
      error?.message ?? `${data?.length} rows`,
    );
  }
}

// ── POSITIVE 6: customer reads own reviews from base table ──────────────────
{
  const { data, error } = await customer.from("reviews").select("id").eq("customer_id", (await customer.auth.getUser()).data.user.id);
  report(
    "customer SELECT own reviews allowed",
    !error && (data?.length ?? 0) > 0,
    error?.message ?? `${data?.length} rows`,
  );
}

// ── Role guard (migration 09): self-escalation blocked, server allowed ──────
// NEGATIVE 5: a signed-in user cannot change their own role via PostgREST.
{
  const uid = (await customer.auth.getUser()).data.user.id;
  const { error } = await customer
    .from("users")
    .update({ role: "contractor" })
    .eq("id", uid)
    .select();
  report(
    "customer UPDATE own users.role rejected",
    !!error,
    error ? error.message : "self-escalation went through (BAD)",
  );
}

// POSITIVE 7: the service-role client CAN change a role (the become-a-pro
// server action path). Flip riley → contractor, then revert.
{
  const RILEY = "22222222-2222-2222-2222-222222222222";
  const { data, error } = await admin
    .from("users")
    .update({ role: "contractor" })
    .eq("id", RILEY)
    .select("id, role");
  const upgraded = !error && data?.[0]?.role === "contractor";
  const { error: revertErr } = await admin
    .from("users")
    .update({ role: "customer" })
    .eq("id", RILEY);
  report(
    "service-role UPDATE users.role allowed (and reverted)",
    upgraded && !revertErr,
    error?.message ?? revertErr?.message,
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
