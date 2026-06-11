# Production setup

## Authentication (Better Auth)

The app uses **Better Auth** with email/password — no third-party auth provider, no “Development mode” banner.

### Required environment variables

| Variable | Local | Vercel (Production) |
|----------|-------|---------------------|
| `DATABASE_URL` | Neon pooler URL | Same |
| `BETTER_AUTH_SECRET` | `npx auth@latest secret` | Same secret (32+ chars) |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://personal-memorys.vercel.app` |

Generate a secret:

```bash
npx auth@latest secret
```

### Vercel setup

1. **Project → Settings → Environment Variables**
2. Remove old Clerk variables (`NEXT_PUBLIC_CLERK_*`, `CLERK_*`).
3. Add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (your public HTTPS URL).
4. **Deployments → Redeploy** the latest deployment.

### Verify

```bash
npm run check-env:production
```

After deploy, open `/sign-in` — you should see the app’s own sign-in form with no Clerk branding.

## Users after migration from Clerk

Existing Clerk accounts **do not transfer**. Users must **sign up again** with email/password.  
The old `auth_user_id` column was renamed from `clerk_user_id`; existing profile rows need a matching Better Auth user or a fresh sign-up.

## Optional services

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Email reminders |
| `RESEND_FROM_EMAIL` | Sender address |
| `INNGEST_EVENT_KEY` | Background jobs |

## Local development

```bash
cp .env.example .env
# Fill DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL=http://localhost:3000
npm run dev
```
