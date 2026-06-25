# Deploying SquatchScout to Vercel

The app runs on **Vercel** (Next.js host) + a **hosted Supabase project** (Postgres +
Auth + Storage). The local Supabase stack is for development only — Vercel can't reach
`127.0.0.1`, so production needs a cloud Supabase project.

## 0. Push to GitHub
The repo is already committed locally. Authenticate the GitHub CLI once, then create
the remote and push:
```bash
gh auth login          # GitHub.com → HTTPS → Login with a web browser
gh repo create squatchscout --private --source=. --remote=origin --push
```
(Or create an empty repo on github.com and `git remote add origin <url> && git push -u origin main`.)

## 1. Create a hosted Supabase project
1. At [supabase.com](https://supabase.com) → **New project**. Note the **project ref**
   (the `xxxx` in `xxxx.supabase.co`) and the **database password** you set.
2. From **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

## 2. Push the schema (and optionally the seed)
```bash
supabase link --project-ref <your-project-ref>     # prompts for DB password
supabase db push                                   # applies all 7 migrations

# Optional: load demo data (categories, services, demo users/pros/reviews).
# Skip for a clean production DB.
psql "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
  -f supabase/seed.sql
```

## 3. Configure Supabase Auth (Dashboard → Authentication → URL Configuration)
- **Site URL**: `https://<your-app>.vercel.app`
- **Redirect URLs**: add `https://<your-app>.vercel.app/**`
- Turn **email confirmations** on for production (Auth → Providers → Email).
- (Optional) **Google**: add Client ID/Secret under Auth → Providers → Google.

## 4. Deploy to Vercel
**Option A — CLI**
```bash
npm i -g vercel        # or use: npx vercel
vercel login
vercel link            # create/link a project
# add env vars (repeat per variable, choose Production + Preview):
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL          # https://<your-app>.vercel.app
vercel env add NEXT_PUBLIC_PLATFORM_FEE_RATE # 0.15
vercel --prod
```

**Option B — GitHub + Dashboard**
1. Push this repo to GitHub, then **Import** it at [vercel.com/new](https://vercel.com/new).
2. Add the env vars below in **Project → Settings → Environment Variables**.
3. Deploy.

## 5. Required environment variables on Vercel
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (secret) |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-app>.vercel.app` |
| `NEXT_PUBLIC_PLATFORM_FEE_RATE` | `0.15` |

Optional (features stay in mock/disabled mode until set): `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`.

## Notes
- Framework preset: **Next.js** (auto-detected). Build: `next build`. No `vercel.json` needed.
- After the first deploy, update `NEXT_PUBLIC_SITE_URL` + Supabase redirect URLs to the
  final domain, then redeploy.
- The local dev keys in `.env.example` only work against your local Docker stack — never
  use them in production.
