# 🐾 SquatchScout

> **Book local help without the hunt.**

A two-sided local-services marketplace (think Urban Company / Thumbtack / TaskRabbit) with a
Pacific-Northwest **Bigfoot / "scout"** theme. Customers scout & book vetted local pros;
contractors ("Scout Pros") list services and get paid; admins run the back office.

This repo is **Phase 1 — the foundation**: project scaffold, brand design system, full
database schema, seed data, and authentication with role-based access control. It runs
**locally with no cloud accounts and no API keys**.

---

## Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 · custom brand tokens · Framer Motion · Lucide icons |
| Backend | Supabase (Postgres + Auth + Storage + Realtime + RLS), run locally via Docker |
| Auth | Supabase Auth — email/password, Google OAuth (optional), email verification, RBAC |
| UI library | Hand-rolled, brand-themed components (`src/components/ui`) |

The brand palette (orange `#F47C20`, cream `#FCE5C4`, sage `#879068`, ink `#1A1A1A`),
fonts (Poppins + Inter) and tokens live in `src/app/globals.css`.

---

## Prerequisites

- **Node 20+** and **pnpm**
- **Docker Desktop** (for the local Supabase stack) — must be **running**
- **Supabase CLI** (`brew install supabase/tap/supabase` or see the [docs](https://supabase.com/docs/guides/cli))

---

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy the env template (already filled with safe LOCAL defaults)
cp .env.example .env.local

# 3. Start Docker Desktop, then bring up the local Supabase stack.
#    First run pulls Docker images and may take a few minutes.
#    This applies all migrations AND runs the seed automatically.
pnpm db:start

# 4. Run the app
pnpm dev
```

Open **http://localhost:3000**. Supabase Studio is at **http://localhost:54323**, and any
emails the app "sends" land in the Inbucket inbox at **http://localhost:54324**.

> The `.env.local` Supabase keys are the well-known **local** dev keys — not secrets. They
> only work against your local Docker stack. Swap them for hosted-project values in prod.

### Demo logins (password: `password123`)

| Role | Email |
|------|-------|
| Customer | `jordan@example.com` · `riley@example.com` |
| Scout Pro (contractor) | `sasquatch.handyman@example.com` (+ 5 more) |
| Admin | `admin@squatchscout.local` |

The login screen also has a **"Demo logins"** expander with these.

---

## Useful scripts

| Command | What it does |
|--------|--------------|
| `pnpm dev` | Run the Next.js dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:start` / `pnpm db:stop` | Start / stop local Supabase |
| `pnpm db:reset` | Re-apply all migrations + re-seed (wipes local DB) |
| `pnpm db:status` | Show local Supabase URLs & keys |
| `pnpm gen:types` | Generate `src/lib/database.types.ts` from the local DB |
| `pnpm smoke:rls` | RLS + trigger-guard checks (needs local stack) |
| `pnpm smoke:checkout` | End-to-end checkout write path (needs local stack) |
| `pnpm smoke:pages` | Authenticated click-through of all roles' pages (needs local stack + `pnpm dev`) |

---

## CI

`.github/workflows/ci.yml` runs on every push and pull request: it boots the same
local Supabase stack in the runner's Docker, applies **all migrations + seed from
scratch**, then runs `typecheck`, `lint`, and all three `smoke:*` suites (including
the authenticated page click-through against a real dev server).

**PRs into `main` must pass this workflow.** The hosted Supabase project auto-deploys
migrations from `main` (GitHub integration, no staging tier), so this workflow is the
only gate between a bad migration and production. Branch protection — requiring the
`checks` job before merge — is enforced in GitHub repo settings
(Settings → Branches → protection rule for `main`), not in this repo.

---

## Google OAuth

"Continue with Google" is wired end to end (Phase 7.7). First-time Google
signups are routed to `/onboarding/role` to answer the same customer-vs-pro
question as email signup; returning users go straight to their dashboard.
The provider needs a Google Cloud OAuth client to actually work:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   create an **OAuth client ID** (type *Web application*).
2. Add the **authorized redirect URI** for each environment:
   - Local stack: `http://127.0.0.1:54321/auth/v1/callback`
   - Hosted: `https://<project-ref>.supabase.co/auth/v1/callback`
3. **Local:** put the client ID/secret in
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`
   (shell env or `.env`), then `supabase stop && supabase start`. The provider
   is already `enabled = true` in `supabase/config.toml`; with the vars unset
   the CLI just warns and Google sign-in fails gracefully at Google's screen.
4. **Hosted:** in the Supabase dashboard enable **Auth → Providers → Google**
   and paste the same client ID/secret. Also confirm **Auth → URL
   Configuration**: *Site URL* = your production URL, and add
   `https://<your-domain>/auth/callback` to the redirect allow-list.

Note: OAuth users get no `role` from Google. The `handle_new_user` trigger
defaults them to `customer`; the `/onboarding/role` step then either confirms
that or upgrades them to contractor through the same path as
`/base-camp/become-a-pro` (any customer can upgrade there later).

---

## Project structure

```
src/
  app/
    (auth)/            login, signup, forgot/reset password + server actions
    (marketing)/       public site: home, /services, /for-contractors (+ header/footer)
    auth/              OAuth callback + email-confirm route handlers
    base-camp/         Customer dashboard  (role: customer)
    den/               Contractor dashboard (role: contractor)
    admin/             Ranger Station       (role: admin)
    layout.tsx         root layout (fonts, metadata)
    not-found.tsx      branded 404
  components/
    ui/                Button, Input, Card, Badge, Alert, Avatar, Skeleton…
    brand/             Logo, SiteHeader, SiteFooter, CategoryIcon
    auth/              auth forms (client) + submit/google buttons
    dashboard/         DashboardShell, nav, StatCard, EmptyState
  lib/
    supabase/          browser + server + proxy + admin clients
    auth.ts            getUser / getProfile / requireRole (server)
    roles.ts           pure role helper (used by Edge proxy)
    brand.ts           brand constants & microcopy
    catalog.ts         canonical service categories (static UI)
    validations.ts     zod schemas
  proxy.ts             Edge middleware: session refresh + RBAC route guards
supabase/
  config.toml          local stack config (auth URLs, storage buckets, Google OAuth)
  migrations/          full schema (enums, ~25 tables, indexes, triggers, RLS)
  seed.sql             service catalog + demo users / pros / bookings / reviews
```

---

## Security model (foundation)

- **Auth**: Supabase Auth owns passwords (bcrypt) + email confirmation; `public.users`
  mirrors the auth user with a `role`.
- **RBAC**: enforced in three layers — Edge `proxy.ts` route guards, `requireRole()` in
  server layouts, and **Row-Level Security** on every table.
- **Role integrity**: role lives in `public.users` (source of truth) and is mirrored to JWT
  `app_metadata` (not user-editable). Triggers block users from changing their own
  role/status, and contractors from self-approving verification.
- **PII**: `users`, `customer_profiles`, addresses, payments and messages are owner/admin
  only. Public discovery reads come from `contractor_profiles` (approved + live), the
  catalog, and reviews — never from `users`.
- **Storage**: `avatars` & `portfolios` buckets are public; `verification` (ID + insurance)
  is private (signed URLs only).

---

## Build roadmap

| Phase | Scope | Status |
|------|-------|--------|
| **1** | Auth + schema + roles + design system | ✅ |
| **2** | Customer browse/book + contractor profiles | ✅ |
| **3** | Contractor dashboard + scheduling | ✅ |
| **4** | Checkout + payments (mock provider) | ✅ |
| **5** | Reviews / messaging / notifications | ✅ |
| **6** | SEO pages + local landing + admin tooling | ✅ |

What's built per phase:

- **Phase 2** — `/services/[category]` listings with filters + auto-match, `/pros/[slug]`
  profiles, a 4-step booking wizard (`/book`), and Base Camp pages (bookings list/detail,
  favorites, addresses).
- **Phase 3** — The Den: job pipeline (accept/decline/start/complete), services & pricing
  manager, weekly availability + time-off, earnings, profile/verification settings.
- **Phase 4** — escrow-style checkout (`/checkout/[id]`) with tips + promo codes via a
  `PaymentProvider` abstraction (mock adapter; Stripe Connect slots in behind the same
  interface).
- **Phase 5** — leave/reply reviews, realtime in-app chat (customer ↔ pro), and a
  notifications bell (unread count + realtime) driven by lifecycle events.
- **Phase 6** — programmatic `/local/[service]-in-[city]` SEO pages, `sitemap.xml` +
  `robots.txt` + JSON-LD, marketing/legal pages, and the admin Ranger Station (verify
  contractors, manage users/bookings/categories/disputes/promos, moderate reviews).

### Wiring real integrations later
Payments use a **mock provider** so checkout works end-to-end locally (no card charged).
Stripe Connect, Google Maps and email (Resend) slot in via env vars (see `.env.example`) —
swap `getPaymentProvider()` in `src/lib/payments/provider.ts` for a Stripe implementation.
To enable Google sign-in, set the two `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` vars, flip
`enabled = true` under `[auth.external.google]` in `supabase/config.toml`, and restart Supabase.
