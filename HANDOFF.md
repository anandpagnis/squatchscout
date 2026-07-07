# SquatchScout — Phase 7 Handoff

> **Read this file top to bottom before touching anything.** It is written so a
> fresh agent with zero prior context can continue and finish the work. It
> covers what the project is, everything done so far, everything remaining, and
> — most importantly — the traps that already cost time so you don't re-hit them.

_Last updated: 2026-07-07, after the **shadcn dashboard integration** (user-requested interlude between 7.4 and 7.5) landed on branch **`feat/shadcn-dashboard-layout`** (commits `5c2a80f` + `fbf9beb`, local only — not yet pushed/PR'd). PR #5 (Phase 7.4) has been **merged** (`1fcaad5`). Next up: push/PR the shadcn branch, then Phase 7.5._

> **ENVIRONMENT CHANGED (2026-07-06):** development moved from the Windows
> machine described in §2 to **macOS** (`/Users/anandp/Desktop/squatchscout`,
> zsh). The Windows-specific gotchas in §2 (PowerShell, no gh CLI, Docker
> named-pipe flake, CRLF noise) no longer apply. On this machine: **`gh` CLI IS
> installed** (use it instead of the gh-api.sh curl helper), as are docker,
> supabase CLI, pnpm 11.9, and Node 26 (CI still pins Node 22 — if a local
> pass differs from CI, check the Node version first). Repo root is the working
> directory itself — no doubled folder. Everything else (Supabase hosted vs
> local, CI, branch protection, working rules) still applies as written.

---

## 1. What this project is

**SquatchScout** — a two-sided local-services marketplace (think Thumbtack /
Urban Company / ServiceTitan) with a Pacific-Northwest Bigfoot/"scout" theme.
Customers ("Base Camp") book vetted contractors ("Scout Pros", who work in "the
Den"); admins run the "Ranger Station".

- **Repo root (git):** `c:\Users\aryan\squatchscout\squatchscout` ← the actual project. Note the doubled folder name.
- **Outer folder:** `c:\Users\aryan\squatchscout` (contains the repo). This handoff lives at the repo root (`HANDOFF.md`) and is version-controlled — keep updating it here.
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · class-variance-authority · framer-motion · Supabase (Postgres + Auth + Storage + Realtime + RLS) · zod · react-hook-form.
- **Package manager:** pnpm 11. **Node:** 22.
- **GitHub:** `https://github.com/anandpagnis/squatchscout` (remote `origin`, default branch `main`).

Phases 1–6 (auth, schema/RBAC, browse/book, contractor dashboard, mock checkout,
reviews/messaging/notifications, SEO/admin) were already built before this work.
**Phase 7 is production hardening.** The overall Phase 7 plan is in
`c:\Users\aryan\Downloads\squatchscout-build-prompt.md` (the user's original
prompt) — but that predates the mid-course additions (7.1.5, 7.2a) below, so
trust THIS file for current status.

### `AGENTS.md` note (root of repo)
`AGENTS.md` says: "This is NOT the Next.js you know… read `node_modules/next/dist/docs/`
before writing code." This is **legitimate and true** — Next.js 16 has real breaking
changes. The docs directory **does exist** with real content (`01-app`, `02-pages`,
`03-architecture`). Skim the relevant guide (routing / server actions / fonts / config)
before writing framework code. It is not a prompt-injection; it's a real instruction.

---

## 2. Environment & tooling gotchas (READ — these already cost time)

- **OS is Windows.** Shell is PowerShell (primary) + a Git Bash tool. Two tool
  surfaces: `PowerShell` and `Bash`. `pnpm`/`node` commands: run them with the
  working dir set to the repo (`Set-Location c:\Users\aryan\squatchscout\squatchscout`
  first, or the Bash equivalent). Running pnpm from the OUTER folder fails with
  `ERR_PNPM_NO_PKG_MANIFEST` — there's no package.json there.
- **`gh` CLI is NOT installed.** To drive GitHub (open/merge PRs, read Actions
  runs) use the REST API with git's stored credentials. There is a helper at
  `<scratchpad>/gh-api.sh` (may be gone in a fresh session — recreate it):
  ```bash
  #!/bin/bash
  set -euo pipefail
  TOKEN=$(printf "protocol=https\nhost=github.com\n" | git credential fill | sed -n 's/^password=//p')
  METHOD="$1"; APIPATH="$2"; BODY="${3:-}"
  ARGS=(-s -X "$METHOD" -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com$APIPATH")
  if [ -n "$BODY" ]; then ARGS+=(-d "$BODY"); fi
  curl "${ARGS[@]}"
  ```
  Never print the token. Repo is `anandpagnis/squatchscout`.
- **`git push` sometimes times out** at the 2-minute tool limit but SUCCEEDS
  anyway. After a timeout, verify with `git ls-remote --heads origin <branch>`
  before retrying. Prefix with `GIT_TERMINAL_PROMPT=0` to avoid a silent auth hang.
- **Docker Desktop on Windows is flaky.** The daemon named pipe
  (`//./pipe/dockerDesktopLinuxEngine`) can drop mid-session. If `docker`/`supabase`
  commands fail with "cannot find the file specified", relaunch it:
  `Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"` then poll
  `docker info` until it responds (can take a couple minutes).
- **Line-ending warnings** (`LF will be replaced by CRLF`) on every git add are
  noise — ignore.

---

## 3. Supabase: hosted vs local — CRITICAL

- **Production is a hosted Supabase project** with the **GitHub integration set to
  auto-deploy any new migration to production on every push to `main`.** There is
  **no staging/preview tier** (Free plan). **This means: a migration merged to
  `main` ships to prod automatically. There is no undo.**
- **CI (see §5) is the only gate** between a bad migration and production. Do not
  weaken it. Do not push schema changes straight to `main` — always via a PR that
  passes CI.
- **Local dev uses the Supabase CLI local stack in Docker** (`supabase start`).
  `config.toml` `project_id = "squatchproj"` is just the local stack name.
- **This machine is NOT `supabase link`ed to the hosted project** and the CLI is
  **not logged in** (`supabase projects list` → "Access token not provided"). So
  from here you can only touch the LOCAL stack. That's fine — validate everything
  locally; the GitHub integration handles the prod deploy on merge.
- `.env.local` (gitignored) points at the local stack (`127.0.0.1:54321`) with the
  well-known public local dev keys. `.env.example` mirrors it (keys are non-secret).

### Local stack commands
```
pnpm db:start   # supabase start (first run pulls images, minutes; run backgrounded)
pnpm db:reset   # recreate DB, apply ALL migrations in order, run seed.sql
pnpm db:status  # print local URLs + keys
pnpm gen:types  # regenerate src/lib/database.types.ts from local DB
pnpm dev        # Next dev server on :3000
```
- **`pnpm db:reset` exits 1 with a `502 upstream` at the very end** ("Restarting
  containers") on Windows — this is a **known-harmless CLI flake AFTER migrate+seed
  already succeeded.** The DB is fine; verify by querying it. Don't chase it.
- The citext/regexp `WARNING (01007): no privileges were granted` spam during
  reset comes from migration 06's blanket `grant execute on all functions` hitting
  extension internals. Pre-existing, harmless.

---

## 4. Smoke-test suite (your primary verification tool)

Three Node scripts in `scripts/`, wired as pnpm aliases. They need the local stack
up (`pnpm db:start` + `pnpm db:reset`); `smoke:pages` also needs `pnpm dev` running.

```
pnpm smoke:rls       # 10 checks: money-column triggers + reviews_public view + RLS
pnpm smoke:checkout  # 8 checks: end-to-end checkout write path, asserts DB rows
pnpm smoke:pages     # 22 checks: authed click-through of every role's pages + route guards
```
`smoke:pages` logs in via the Supabase auth REST endpoint, forges the
`@supabase/ssr` cookie (base64 chunked over ~3180 chars), and fetches gated routes
checking status + visible-content defects (undefined/NaN/lorem/error boundaries).
Keep these green. When you add pages/flows, extend the relevant script.

CI runs all three on every push/PR. **Run them locally before every PR too.**

---

## 5. CI & branch protection (Phase 7.2a — DONE)

- **`.github/workflows/ci.yml`** runs on every push + PR: checkout → pnpm 11 /
  Node 22 → `pnpm install --frozen-lockfile` → `supabase/setup-cli` →
  `supabase start` (runner's own Docker) → `pnpm db:reset` → `cp .env.example
  .env.local` → `pnpm typecheck` → `pnpm lint` → `smoke:rls` → `smoke:checkout` →
  background `pnpm dev` + curl-poll until ready → `smoke:pages` → stop stack.
- **Branch protection is ON** for `main`: requires the `checks` job to pass AND
  **at least 1 approving review**. **The PR author cannot approve their own PR** —
  so the agent CANNOT self-merge. **After CI is green, you must tell the USER to
  approve + merge the PR.** This is expected, not a bug.
- **Gotcha that already bit us:** pnpm 11 fails install with
  `ERR_PNPM_IGNORED_BUILDS` unless build scripts are approved. `pnpm-workspace.yaml`
  now has an `allowBuilds:` block (`esbuild: true`). Don't delete it — CI needs it.
  (pnpm auto-generates/edits `pnpm-workspace.yaml`; if it shows as modified, that's
  usually pnpm, check the diff but it's normally fine.)

### How to open/watch/merge a PR (no gh CLI)
1. Create branch, commit, `git push -u origin <branch>` (verify with ls-remote if it times out).
2. `bash gh-api.sh POST /repos/anandpagnis/squatchscout/pulls '{"title":...,"head":"<branch>","base":"main","body":...}'`
3. Poll runs: `bash gh-api.sh GET "/repos/anandpagnis/squatchscout/actions/runs?branch=<branch>&per_page=1"` → check `.workflow_runs[0].status/conclusion`. (A `Monitor` loop works well for this.)
4. Inspect failed steps: `GET /repos/.../actions/runs/<id>/jobs` → each `.steps[].conclusion`. Logs: `GET /actions/runs/<id>/logs` returns a zip.
5. **Merge is the USER's action** (approval required). Do not attempt to squash-merge as the agent — it returns `At least 1 approving review is required`.

---

## 6. Work completed so far (chronological, with the WHY)

### Phase 7.1 — Audit (DONE)
Grepped `src/` for placeholders/secrets/debug — clean except: legal pages
(`/legal/terms`, `/legal/privacy`) and `/blog` are self-declared placeholder
content (handled in 7.2, see demo mode below). Read all migrations; produced a
schema summary. Flagged issues → two became Phase 7.1.5.

### Phase 7.1.5 — RLS hardening (DONE, merged, verified live)
**Migration `supabase/migrations/20260101000007_rls_hardening.sql`.** Three fixes:
1. **Booking money-column guard** — `BEFORE UPDATE` trigger
   `guard_booking_money_fields()` blocks non-admin changes to `quoted_price,
   final_price, tip, platform_fee, contractor_payout, currency`. Customers could
   previously rewrite their own booking's price via a direct PostgREST call (RLS
   can't restrict columns). Trigger allows `auth.uid() IS NULL` (service role /
   seeds / psql) or `is_admin()`.
2. **Quote guard** — `guard_quote_fields()`: only the owning contractor (or
   admin/service-role) may change `amount/message/expires_at/booking_id/
   contractor_id`; customers may only flip `status` (accept/decline).
3. **`reviews_public` view** — the base `reviews` table's public-read policy
   leaked `reverse_rating`/`reverse_comment` (the pro's private rating of the
   customer). Now: base table is party/admin-read only; a column-safe
   `reviews_public` view (SECURITY DEFINER, `security_invoker = false`) exposes
   only public columns to anon. **App change:** `getContractorReviews` in
   `src/lib/data/contractors.ts` now reads `reviews_public`. Party's-own-view
   pages (base-camp/den/admin) still read the base `reviews` table.

**BUG this uncovered (also fixed in the same migration):** migration 06 granted
DML to `anon`/`authenticated` but **never to `service_role`**. `service_role` has
BYPASSRLS but had **no base-table privileges**, so every service-role write in the
app (checkout's payment insert + booking price update via `lib/supabase/admin.ts`)
was **silently failing** — the code never checked `error`. Migration 07 adds
`grant … to service_role` + `alter default privileges`. This bug had been latent
since migration 06 was written; no successful checkout had ever persisted pricing
(seed data made it LOOK fine because seed writes as the postgres superuser).

**Also fixed:** `src/app/checkout/actions.ts` `payBooking()` now checks the error
on all three admin-client writes and surfaces failures ("payment went through but
we hit a snag… don't pay again") instead of redirecting to `?paid=1` regardless.
The promo `used_count` bump logs-but-doesn't-fail (payment already consistent).

**Verified live:** `smoke:rls` 10/10, `smoke:checkout` 8/8 against the local stack.
`gen:types` regenerated (adds `reviews_public` to `Views`). Merged to `main` as
commit `29286ff`.

### Demo-mode gating (DONE, merged)
`NEXT_PUBLIC_DEMO_MODE` env flag (in `.env.example`=false, `.env.local`=true).
When `true`, hides footer + signup-fine-print links to placeholder pages (blog,
legal terms/privacy). Pages stay routable by URL. `src/components/brand/site-footer.tsx`
and `src/components/auth/signup-form.tsx` gate on it. `sitemap.ts` intentionally
left listing all routes. Committed `27d5124` + `6f17da5`.

### Phase 7.2a — CI safety net (DONE, merged)
`.github/workflows/ci.yml` + README "CI" section. See §5. Merged via PR #1
(`a55c959`). User confirmed branch protection turned on in GitHub settings.

### Phase 7.2b — Design system (DONE, MERGED as PR #2 → `2eb73dd`)
Token direction was reviewed and **approved by the user** via a visual specimen
artifact before propagation.

Direction = **"trail lodge"**: warm paper ground (`#faf7f0`, not white), deep
forest green (`#234534`) as structure/secondary, bark browns replacing grays,
amber (`#e88317`, deepened logo orange) as the single accent (ink text on amber
for WCAG-AA — white-on-amber fails). Display font **Fraunces** (variable serif,
opsz axis), body **Figtree** — both via `next/font`, replacing Poppins/Inter.
(**Fonts were reworked again right after — see the "Type system" section below.**
Figtree is gone; color/spacing/component tokens from 7.2b remain locked.)

Changed (15 files, +563/−162):
- **`src/app/globals.css`** — full token system: forest/bark/amber/status color
  scales, 7-step type scale (`text-display`…`text-caption`), easing tokens
  (`--ease-spring/swift`), two card shadow treatments, `.bg-lodge` dark section,
  `.texture-grain`. **Legacy token names (orange/sage/cream/ink) are remapped to
  new values** so all existing pages inherited the shift with zero page edits.
- **`src/app/layout.tsx`** — Figtree + Fraunces via next/font.
- **`src/components/ui/`** — Button (retuned variants, hover-lift + press),
  Card (NEW variants: flat/elevated/forest/outline via cva — default `flat`),
  Badge (semantic set + optional `dot`; legacy aliases kept), Alert (semantic soft
  tokens), Avatar (forest ring). Skeleton/Rating already token-driven.
- **`src/components/booking/status-badge.tsx`** — one consistent booking-state →
  color mapping (neutral/info/forest/warning/success/danger).
- **`src/components/motion/reveal.tsx`** (NEW) — `Reveal`, `Stagger`,
  `StaggerItem` framer-motion primitives, reduced-motion aware.
- **`src/components/brand/header-nav.tsx`** (NEW client component) — `MainNav`
  (active-route amber underline, `layoutId` animation) + `MobileMenu`
  (AnimatePresence slide-down, auth-aware CTAs).
- **`src/components/brand/site-header.tsx`** — uses the new nav components.
- **`src/components/brand/site-footer.tsx`** — deep-forest `bg-lodge` ground,
  structured columns (demo gating preserved).
- **`src/components/brand/logo.tsx`** — `onDark` variant, Fraunces wordmark.
- **`src/components/brand/category-icon.tsx`** — crafted 1.75 stroke + NEW
  `CategoryTile` duotone treatment (built, not yet used on pages — that's 7.3).
- **`src/components/notifications/notifications-bell.tsx`** — spring badge pop +
  panel entrance.

Verified: typecheck ✓ lint ✓ smoke:pages 22/22 ✓ locally; full CI ✓ on PR #2.

**Two lint traps hit during 7.2b (for reference):** (1) `react-hooks/set-state-in-effect`
forbids `useEffect(() => setState(...))` — close the mobile menu via `onClick` on
the links, not a pathname effect. (2) A dropped `>` on a `motion.div` opening tag
gives a cascade of confusing JSX parse errors — check tag closing first.

### Type system rework — Lato-anchored three-role pairing (DONE, MERGED via PR #3 → `be6481c`)
**Branch `feat/type-system-and-landing`, PR #3** (bundled with Phase 7.3 below).
### Type system rework — Lato-anchored three-role pairing (DONE, MERGED via PR #3/#4)
Bundled with Phase 7.3 below on branch `feat/type-system-and-landing`.
Replaced Figtree-everywhere with a deliberate three-role split, user-specified:

- **Body / UI — Lato** (400 + 700; NOT a variable font, weights must be explicit
  in `next/font`). `--font-sans` in `globals.css`.
- **Display — Fraunces kept**, but restricted to the **H1/H2/hero tier only** plus
  the logo wordmark (decision: wordmark stays serif — it's the brand voice).
  Base CSS rule changed: `h1, h2` get Fraunces; **`h3, h4, h5` are now bold Lato.**
- **Numerals/codes — JetBrains Mono** (400 + 600), new `--font-mono` token.
  Applied to: StatCard values, all price/payout figures (checkout summary,
  booking-wizard review step, PriceRow strong values on both booking detail
  pages, contractor-card & pros/[slug] prices, earnings payouts, admin bookings)
  and every `SS-00xxxx` booking number (wrapped in `<span className="font-mono">`).
  The optional mono role was kept — it reads well; flag to the user it can be
  reverted per-spot if they find it too techy.

**Key mechanic:** ~30 small UI headings/labels had an explicit `font-display`
class that would have overridden the new base rules — those were swept off
(p/span/legend/dd elements and h3s). `font-display` classes left on actual
h1/h2 elements are redundant-but-harmless. `font-bold` (700) is fine for Lato;
for mono use `font-semibold` (600) — JetBrains Mono 700 isn't loaded.

### Phase 7.3 — Landing page rebuild (DONE, MERGED via PR #3 → `be6481c`)
### Phase 7.3 — Landing page rebuild (DONE, MERGED via PR #3/#4)
Full rewrite of `src/app/(marketing)/page.tsx` (still a server component; motion
via the client `Reveal`/`Stagger` primitives):
- **Split dual-persona hero** — customer side left (display headline, CTAs to
  `/services` + `/pros`, mono stat strip), contractor side as its own deep-forest
  `bg-lodge` panel with value bullets + "Become a Scout Pro" CTA (not a footnote
  link — breaks the centered-hero AI-scaffold tell).
- **Trust signals, varied treatments** — wide escrow card with a mock booking
  receipt (mono figures), vetting checklist card, forest-soft review-integrity
  card. Deliberately NOT three identical icon cards.
- **How-it-works** — 4 steps (Scout/Compare/Book/Done) on a dashed "trail" with
  mono `01–04` markers.
- **Category grid** — first real use of `CategoryTile` (duotone squircle, amber
  hover-rotate), all 12 categories from `src/lib/catalog.ts` → `/services/[slug]`.
- **Testimonials** — the six reviews in `supabase/seed.sql` are real copy; four
  are used verbatim (featured forest card + three cards), attributed to the
  correct seeded pro + service (booking→contractor mapping is in seed.sql
  lines ~260–282). Don't invent quotes.
- **For-contractors teaser** — lodge band, mono stats (85% payout derives from
  `brand.platformFeeRate`, so the 7.6 fee-rate reconciliation auto-updates it).

**Verified:** typecheck ✓ lint ✓ smoke:rls 10/10 ✓ smoke:checkout 8/8 ✓
smoke:pages 22/22 ✓. Visual check via headless Edge screenshots
(`msedge --headless --screenshot=... --virtual-time-budget=8000` works on this
machine; scroll-entrance animations appear half-played in screenshots — that's a
headless artifact, not a bug). Commits: `3803301` (type system), `cc2ad12` (7.3).

### Phase 7.4 — Customer vs contractor component separation (DONE, on PR #5)
Audit finding first: `components/dashboard/*` primitives (StatCard, EmptyState,
DashboardShell/Nav) do NOT branch on role — nav items are injected per persona.
The real cross-role tangle was **duplicated inline helpers in the four booking
pages** (BookingGroup/JobGroup list rows, Detail/Row meta rows, and four
near-identical price-row helpers across both detail pages + checkout-form +
booking-wizard). Fix = extract persona components; **zero data-fetching or
auth changes** (`requireRole()`/RLS untouched; verified by smoke suite).

New structure:
- **`src/components/base-camp/`** (NEW, customer persona — mirrors `components/den/`):
  `booking-list.tsx` (`CustomerBookingGroup`), `booking-price-card.tsx`
  (`CustomerPriceCard` — what the customer pays), `booking-actions.tsx`
  (`CustomerBookingActions` — message pro / cancel). `add-address-form.tsx`
  moved here from `components/dashboard/` (it was customer-only).
- **`src/components/den/`** (contractor persona, extended): `job-list.tsx`
  (`JobRequestCard` accept/decline + `JobGroup`), `job-payout-card.tsx`
  (`JobPayoutCard` — what the pro earns), `job-status-actions.tsx`
  (`JobStatusActions` — status-keyed accept/decline/start/complete forms).
- **`src/components/booking/detail-rows.tsx`** (NEW, shared): `BookingMetaRow`
  (icon/label meta row) + `PriceRow` (one implementation replacing all four
  copies; superset props `strong`/`muted`, `text-right` dd). checkout-form and
  booking-wizard import it as `Row`.
- The four pages (`base-camp/bookings`, `base-camp/bookings/[id]`, `den/jobs`,
  `den/jobs/[id]`) are now thin compositions (~330 lines of inline JSX removed).
- `scripts/verify-pages.mjs` extended with `/den/jobs/[id]` (smoke:pages now 23).

**Flagged, deliberately NOT changed (data layer, out of scope for a
presentation phase):** `lib/data/bookings.ts` uses one `BASE` column list for
both personas, so customers also fetch `contractor_payout` and pros fetch the
customer's tip/total. RLS row-scopes access and nothing renders cross-role
figures, but a column-split select would be a cheap hardening if wanted later.

Verified: typecheck ✓ lint ✓ smoke:rls 10/10 ✓ smoke:checkout 8/8 ✓
smoke:pages 23/23 ✓ (first run of the suite on the new macOS machine — local
stack + db:reset worked with no Windows-era flakes).

### shadcn integration + dashboard sidebar rebuild (DONE locally, branch `feat/shadcn-dashboard-layout`, NOT yet PR'd)
User-requested interlude (2026-07-07), not a numbered phase: "integrate shadcn
dashboards… fix layout… different for pros and customers" via
`pnpm dlx shadcn@latest apply --preset b3kJV0tZQ`. Commits `5c2a80f` + `fbf9beb`.

**What happened / how it's structured:**
- `shadcn init --preset b3kJV0tZQ` then `apply` (apply refuses to run without
  init). Wrote `components.json`; new deps: `@base-ui/react`, `shadcn`,
  `tw-animate-css`. **This registry generates @base-ui/react primitives, NOT
  Radix** — composition uses a `render={<Link …/>}` prop, not `asChild`.
- Preset overwrote the 9 existing `components/ui/*` primitives and appended its
  own oklch token block to `globals.css`. Added on top: `sidebar`, `sheet`,
  `tooltip`, `separator`, `dropdown-menu`, `table`, `tabs`, `breadcrumb`
  (+ `src/hooks/use-mobile.ts`).
- **DashboardShell rebuilt on the shadcn Sidebar** (`components/dashboard/
  dashboard-shell.tsx`, still exports the same `DashboardHeader`): full-width
  `SidebarInset` layout (the old centered `max-w-7xl` gutter is gone),
  collapsible icon rail on desktop (⌘B), Sheet drawer on mobile, sticky topbar
  (trigger + area label + NotificationsBell + UserMenu). All three dashboard
  layouts (base-camp / den / admin) now pass `profile` + `areaKey` and **no
  longer render SiteHeader**. `DashboardNav` rewritten as SidebarMenu.
  `UserMenu` extracted from site-header to `components/brand/user-menu.tsx`
  (site-header imports it).
- **Per-persona theming:** customers (base-camp) light sidebar, pros (den) dark
  forest, admin dark bark. Implemented as `:root:has([data-dashboard="…"])`
  blocks at the end of `globals.css` — must be `:root:has()`, NOT a class on the
  wrapper, because the mobile sidebar renders in a portal (Sheet) outside the
  provider subtree. The shell stamps `data-dashboard` on `SidebarProvider`.

**Preset collateral damage that was repaired (traps if you re-run shadcn):**
1. The preset **deleted `formatPrice`/`titleFromSlug` from `src/lib/utils.ts`**
   (restored) and **added an Inter font** whose `--font-sans` variable clobbered
   Lato (removed from `app/layout.tsx`; the type system §"Type system rework"
   still stands).
2. It **dropped all custom cva variants** (~60 type errors). Compatibility
   variants were re-added inside the new components: Button `primary`/`sage`/
   `soft` + `md` size + `loading` prop + `ButtonProps`; Badge status set
   (success/warning/danger/info/neutral) + legacy aliases (amber/forest/sage/
   verified) + `dot` prop + `BadgeProps`; Alert `info`/`error`/`success`/
   `warning`/`neutral`; Avatar legacy `name`/`src` initials shorthand. Don't
   let a future `shadcn add --overwrite` wipe these — decline overwrite prompts
   (pipe `n`s; `--yes` does NOT cover them).
3. `use-mobile.ts` as generated fails `react-hooks/set-state-in-effect` (the
   same lint trap from 7.2b) — rewritten with `useSyncExternalStore` (`fbf9beb`).
4. **Design-system impact — flag to the user:** the preset's `:root` oklch block
   overrides the 7.2b semantic tokens, so `--primary` is now the preset's
   **green** (buttons/CTAs) and `--background` white-ish, while the named brand
   tokens (amber/forest/paper/…) and marketing utilities (`bg-camp`/`bg-lodge`)
   survive. The 7.2b "locked tokens" decision is therefore partially superseded
   by the user's own preset choice; reverting CTAs to amber is a small edit to
   the `:root { --primary: … }` block in `globals.css`.

**Verified:** typecheck ✓ lint ✓ build ✓ smoke:rls 10/10 ✓ smoke:checkout 8/8 ✓
smoke:pages 23/23 ✓, plus real-browser screenshots of both dashboards at
1440×900 and 390×844 (desktop sidebar, mobile sheet, per-persona colors).
No chromium-cli on this machine — used a scratchpad `playwright-core` script
with `chromium.launch({ channel: "chrome" })` against the dev server, logging in
with the demo creds. Two dev-loop gotchas: (a) the user often has their own
`pnpm dev` on :3000 (a second one errors "Another next dev server is already
running" after falling to :3001 — just drive the existing one, it hot-reloads);
(b) after editing `globals.css` a long-running dev server can serve a stale HMR
CSS chunk — if a new rule doesn't apply, `touch` the file / hard-refresh before
debugging the CSS itself.

---

## 7. What remains (the rest of Phase 7)


The user is sending phase prompts **one at a time** and reviewing between each.
Don't run ahead. Order (from the original build prompt, as amended):

### Phase 7.4 — Customer vs contractor component separation (DONE, merged as PR #5 — see §6)

### Interlude — shadcn dashboards (DONE locally — see §6; needs push + PR + user merge)

### Phase 7.5 — Booking slot picker + double-booking guard (NEXT)
Build `components/booking/slot-picker.tsx`: reads a contractor's weekly
availability + time-off (`availability`, `availability_blocks` tables), computes
bookable slots for a service duration, date-picker + time-grid, disables
taken/unavailable slots, loading/empty states. **Prevent double-booking at the DB
layer** — add a migration with a btree_gist exclusion constraint OR a server-side
overlap check (the audit flagged there is currently NO such guard, and
`bookings_schedule_idx` is only on `scheduled_start`; a `(contractor_id,
scheduled_start)` index would help). Integrate into the 4-step `/book` wizard;
usable from both `/pros/[slug]` and `/book`. **This is a schema change → migration
→ CI → careful (auto-deploys to prod).**

### Phase 7.6 — Stripe integration
Replace mock `src/lib/payments/provider.ts` with real Stripe, keeping the
`PaymentProvider` interface. Stripe Connect (Express) onboarding from
`den/settings` (store `stripe_account_id`, check `charges_enabled`/
`payouts_enabled` — columns already exist on `contractor_profiles`). PaymentIntents
with manual capture / separate-charges-and-transfers for the escrow behavior.
Payout-on-completion minus 18% platform fee (note: `NEXT_PUBLIC_PLATFORM_FEE_RATE`
is currently 0.15 in env — reconcile the number). Webhook route
`src/app/api/webhooks/stripe/route.ts` (verify signatures). Add env vars to
`.env.example`. **Keep a clean fallback to the mock provider when Stripe keys
aren't set** so `pnpm dev` works without keys. `payments` table already has
`stripe_payment_intent_id` (unique partial index). Privileged writes go through
`lib/supabase/admin.ts` (service-role) — and remember service_role now has grants
(fixed in mig 07).

### Phase 7.7 — Google OAuth completion
`supabase/config.toml` references Google OAuth (currently `enabled=false`). Wire
`components/auth/google-button.tsx` → Supabase Auth → `src/app/auth/callback/route.ts`.
**Key gap:** `handle_new_user()` trigger (migration 06) reads `role` from
`raw_user_meta_data`, which Google sign-ins won't have → every OAuth user silently
becomes `customer`. Add a post-OAuth "customer or pro?" step for first-time OAuth
users. Document redirect URLs + env vars in `.env.example` and README.

### Phase 7.8 — Final pass
Re-run the 7.1 placeholder audit; full click-through of both flows; `pnpm
typecheck && pnpm lint && pnpm build` clean; update `README.md` + `DEPLOY.md` with
any new env vars / setup steps.

---

## 8. Working rules (the user has been explicit about these)

- **Never push schema/migration changes straight to `main`.** Always a PR that
  passes CI. CI is the only thing between a migration and prod.
- **Stop between phases.** The user reviews each phase before sending the next.
  After finishing a phase: verify locally, open a PR, get it green, and hand back
  to the user to approve/merge. Don't self-merge (you can't anyway).
- **Don't touch RLS/RBAC casually** — call it out explicitly and get scrutiny.
  RLS + `requireRole()` + Edge `proxy.ts` are the three-layer security model.
- **Match existing conventions:** server actions in `lib/actions/` and
  `app/*/actions.ts`; zod schemas in `src/lib/validations.ts`; Supabase clients in
  `lib/supabase/` (`server.ts` for user-scoped, `admin.ts` for service-role,
  `client.ts` for browser, `middleware.ts` for the proxy).
- **Run `pnpm typecheck && pnpm lint` after each meaningful chunk**, not just at
  the end. Then the relevant `smoke:*`.
- Presentation-only phases (7.3, 7.4): don't change data-fetching/auth; flag if a
  component's structure genuinely blocks good design rather than quietly changing
  data flow.
- The design-system tokens (§6, Phase 7.2b) are approved and locked — build on
  them, reference tokens not raw hex, don't reopen that decision.

---

## 9. Quick-start for a fresh agent

```bash
# 1. Confirm where things are (macOS now — see the environment note at the top)
cd /Users/anandp/Desktop/squatchscout && git branch --show-current && git log --oneline -5

# 2. Make sure main is current
git checkout main && git pull origin main

# 3. Bring the local stack up (Docker Desktop must be running)
pnpm db:start      # backgrounded; first run pulls images
pnpm db:reset      # ignore the trailing 502; migrate+seed succeed before it
pnpm dev           # :3000

# 4. Sanity-check everything is green
pnpm typecheck && pnpm lint
pnpm smoke:rls && pnpm smoke:checkout && pnpm smoke:pages

# 5. Demo logins (password: password123)
#    customer:  jordan@example.com / riley@example.com
#    contractor: sasquatch.handyman@example.com (+5 more)
#    admin:     admin@squatchscout.local

# 6. Start the next phase (7.4 unless the user says otherwise) on a fresh branch,
#    PR it through CI, hand back for review.
```

**Latest on `main`:** `1fcaad5` (PR #5 merge — Phase 7.4). **Current work:** the shadcn
dashboard integration on branch **`feat/shadcn-dashboard-layout`** (commits `5c2a80f` +
`fbf9beb`, all checks green locally) — needs `git push -u origin`, a PR, and the user's
merge; then **Phase 7.5** is next.
**NOTE:** the user has **deleted the branch-protection ruleset** on `main` — pushes to
`main` no longer require CI or review. CI still runs but does not gate. Recommend
re-enabling protection before any schema phase (7.5+), since a migration on `main`
auto-deploys to prod.
