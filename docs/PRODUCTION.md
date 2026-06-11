# Production setup

## Why sign-in shows “Development mode”

Clerk displays that banner when the app uses **development API keys** (`pk_test_` / `sk_test_`).  
It is not controlled in app code — switch to **production keys** in Vercel.

## Custom domain required

Clerk **does not accept** `personal-memorys.vercel.app` (nor any `*.vercel.app`) when creating a production instance. You need a **domain you own**, for example:

- `memorias.tudominio.com`
- `tudominio.com`

Typical cost: ~$10–15 USD/year (Namecheap, Cloudflare Registrar, Google Domains, etc.).

Until you have one, the app can stay on Vercel with **development keys** — it works. The Clerk “Development mode” banner is hidden via `unsafe_disableDevelopmentModeWarnings` in `ClerkProvider` (cosmetic only; keys remain `pk_test_`).

## 1. Clerk → Production instance

1. Open [dashboard.clerk.com](https://dashboard.clerk.com).
2. Use the **Development / Production** toggle (top of the sidebar).
3. Select **Create production instance**.
4. **Application domain:** enter only your owned domain, e.g. `memorias.tudominio.com` (no `https://`, no trailing `/`).
5. **Configure → Domains** → complete the DNS records Clerk provides.
6. In **Vercel → Settings → Domains**, add the same custom domain.
7. **API Keys** (production) → copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_...`
   - `CLERK_SECRET_KEY` → `sk_live_...`

## 2. Clerk webhook (production)

1. Still in **Production**, go to **Webhooks → Add endpoint**.
2. URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy **Signing secret** → `CLERK_WEBHOOK_SECRET`

> Development and production webhooks are separate — create one per instance.

## 3. Vercel environment variables

In **Project → Settings → Environment Variables**, update for **Production**:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` (production webhook) |

Optional:

| Variable | Value |
|----------|--------|
| `APP_URL` | `https://your-app.vercel.app` (email links) |

Then **Deployments → Redeploy** (latest deployment → ⋮ → Redeploy).

## 4. Verify

```bash
npm run check-env:production
```

Run locally only after copying production keys into `.env` for a quick check.  
On Vercel, confirm the banner is gone on `/sign-in` after redeploy.

## 5. Users after switching to production

Clerk **development** and **production** are separate user databases.  
You will need to **sign up again** on production (or migrate users via Clerk dashboard).

## Local development

Keep `pk_test_` / `sk_test_` in your local `.env`.  
Production keys should only live in Vercel (and optionally a secure password manager).
