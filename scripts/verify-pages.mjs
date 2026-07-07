// Smoke test: authenticated click-through of every role's pages.
// Requires the local stack with seed data AND the dev server (pnpm dev).
// Run: node scripts/verify-pages.mjs
// Logs in via Supabase auth REST, forges the @supabase/ssr cookie, and
// fetches gated routes checking status + visible-content defects.
const SUPA = "http://127.0.0.1:54321";
const APP = "http://localhost:3000";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

let pass = 0, fail = 0;
const report = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (ok) pass++; else fail++;
};

async function login(email) {
  const r = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  if (!r.ok) throw new Error(`login ${email}: ${r.status} ${await r.text()}`);
  const session = await r.json();
  const raw = "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url");
  // @supabase/ssr chunks cookies over ~3180 chars into name.0, name.1, …
  const name = "sb-127-auth-token";
  const MAX = 3180;
  const cookies = [];
  if (raw.length <= MAX) cookies.push(`${name}=${raw}`);
  else for (let i = 0; i * MAX < raw.length; i++) cookies.push(`${name}.${i}=${raw.slice(i * MAX, (i + 1) * MAX)}`);
  return cookies.join("; ");
}

const BAD = /(?:^|[^a-z])undefined(?:[^a-z]|$)|\bNaN\b|lorem ipsum|\[object |Application error|Unhandled Runtime/i;

async function check(cookie, path, mustInclude = []) {
  const r = await fetch(`${APP}${path}`, { headers: cookie ? { cookie } : {}, redirect: "manual" });
  const status = r.status;
  if (status >= 300 && status < 400) {
    report(`GET ${path}`, false, `redirected to ${r.headers.get("location")}`);
    return;
  }
  const html = await r.text();
  const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, " ");
  const badHit = text.match(BAD)?.[0];
  const missing = mustInclude.filter((s) => !text.includes(s));
  const ok = status === 200 && !badHit && missing.length === 0;
  report(`GET ${path}`, ok, [status !== 200 && `status ${status}`, badHit && `bad text: "${badHit}"`, missing.length && `missing: ${missing.join(", ")}`].filter(Boolean).join("; "));
}

// ── Customer (jordan) ────────────────────────────────────────────────────────
const jordan = await login("jordan@example.com");
await check(jordan, "/base-camp", ["Base Camp"]);
await check(jordan, "/base-camp/bookings");
await check(jordan, "/base-camp/bookings/44444444-0000-0000-0000-000000000001");
await check(jordan, "/base-camp/favorites");
await check(jordan, "/base-camp/addresses");
await check(jordan, "/base-camp/reviews");
await check(jordan, "/base-camp/messages");
await check(jordan, "/book");
await check(jordan, "/book?service=deep-cleaning");
await check(jordan, "/base-camp/become-a-pro", ["Become a Scout Pro"]);

// ── Contractor (sasquatch.handyman) ─────────────────────────────────────────
const pro = await login("sasquatch.handyman@example.com");
await check(pro, "/den", ["Den"]);
await check(pro, "/den/jobs");
await check(pro, "/den/jobs/44444444-0000-0000-0000-000000000001");
await check(pro, "/den/schedule");
await check(pro, "/den/services");
await check(pro, "/den/earnings");
await check(pro, "/den/reviews");
await check(pro, "/den/settings");

// ── Admin ────────────────────────────────────────────────────────────────────
const adminC = await login("admin@squatchscout.local");
await check(adminC, "/admin");
await check(adminC, "/admin/contractors");
await check(adminC, "/admin/bookings");

// ── Role guards: customer must NOT see den/admin ─────────────────────────────
{
  const r = await fetch(`${APP}/den`, { headers: { cookie: jordan }, redirect: "manual" });
  report("customer blocked from /den", r.status >= 300 && r.status < 400, `status ${r.status}`);
  const r2 = await fetch(`${APP}/admin`, { headers: { cookie: jordan }, redirect: "manual" });
  report("customer blocked from /admin", r2.status >= 300 && r2.status < 400, `status ${r2.status}`);
  const r3 = await fetch(`${APP}/base-camp`, { redirect: "manual" });
  report("anon blocked from /base-camp", r3.status >= 300 && r3.status < 400, `status ${r3.status}`);
}

// ── Onboarding role step (Phase 7.7) ─────────────────────────────────────────
// Seed users all carry a role in user_metadata, so they must be bounced home;
// only first-time OAuth users (no metadata role) ever see the page.
{
  const r = await fetch(`${APP}/onboarding/role`, { headers: { cookie: jordan }, redirect: "manual" });
  report("customer with role bounced from /onboarding/role", r.status >= 300 && r.status < 400, `status ${r.status}`);
  const r2 = await fetch(`${APP}/onboarding/role`, { redirect: "manual" });
  report("anon blocked from /onboarding/role", r2.status >= 300 && r2.status < 400, `status ${r2.status}`);
  const r3 = await fetch(`${APP}/base-camp/become-a-pro`, { headers: { cookie: pro }, redirect: "manual" });
  report("contractor blocked from /base-camp/become-a-pro", r3.status >= 300 && r3.status < 400, `status ${r3.status}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
