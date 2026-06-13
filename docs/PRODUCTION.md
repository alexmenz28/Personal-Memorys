# Production setup

## Authentication (Better Auth)

The app uses **Better Auth** with email/password and optional Google OAuth.

### Required environment variables

| Variable | Local | Vercel (Production) |
|----------|-------|---------------------|
| `DATABASE_URL` | Neon pooler URL | Same |
| `BETTER_AUTH_SECRET` | `npx auth@latest secret` | Same secret (32+ chars) |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://personal-memorys.vercel.app` |

### Google OAuth (optional)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → **OAuth 2.0 Client** (Web application).
2. **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google`
   - `https://personal-memorys.vercel.app/api/auth/callback/google`
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env` and Vercel.

Without these variables, the Google button is hidden; email/password still works.

**Account linking:** If a user signed up with email/password, they can link Google later in **Settings → Account security**. By default the Google account must use the **same email** as the app account. If the emails differ, linking fails unless you enable `allowDifferentEmails` in `auth.ts` (not recommended for personal use).

**Password reset** uses the same Resend config as email reminders (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`).

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
| `RESEND_API_KEY` | Email reminders + password reset |
| `RESEND_FROM_EMAIL` | Sender address |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in & account linking |
| `INNGEST_EVENT_KEY` | Background jobs |

## Local development

```bash
cp .env.example .env
# Fill DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL=http://localhost:3000
npm run dev
```
