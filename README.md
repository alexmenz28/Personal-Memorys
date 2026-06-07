# Personal Memories

Web app to track important dates, people, and the context you need when the moment arrives — favorite places, gift ideas, holidays, and personal notes.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** (Neon recommended) + Prisma
- **Clerk** (authentication)
- **next-intl** (English default, Spanish in settings)
- **TanStack Query** + Zod
- **Inngest** (holiday sync, email reminders)
- **Resend** (email, v2)
- **Tailwind CSS** + shadcn/ui

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required for local development:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Optional (recommended for production):

- `CLERK_WEBHOOK_SECRET` — user sync on sign-up/delete
- `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` — background jobs
- `RESEND_API_KEY` — email reminders

### 3. Set up Clerk

1. Create an application at [clerk.com](https://clerk.com)
2. Copy API keys into `.env`
3. Enable email sign-in
4. (Optional) Add webhook endpoint: `https://your-domain/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`

### 4. Set up the database

```bash
npm run db:migrate
```

Or push schema without migrations:

```bash
npm run db:push
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    (app)/          # Authenticated app (today, upcoming, people, undated, settings)
    onboarding/     # First-time setup (country, timezone, language)
    sign-in/        # Clerk auth
    api/            # Inngest + Clerk webhooks
  components/       # UI and layout
  i18n/             # Locale config
  lib/
    actions/        # Server actions
    holidays/       # Public holiday sync
    inngest/        # Background jobs
    validations/    # Zod schemas
messages/           # en.json, es.json
prisma/             # Database schema
```

## MVP routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/sign-in`, `/sign-up` | Authentication |
| `/onboarding` | Country, timezone, language setup |
| `/today` | Today's holidays and events |
| `/upcoming` | Next 30 days |
| `/people` | People and their preferences |
| `/undated` | Events without a date |
| `/settings` | Language, timezone, country |

## Next implementation steps

1. CRUD for people, events, preferences, and notes
2. Today/Upcoming queries with timezone-aware dates
3. Email reminders via Resend + Inngest
4. Data export and account deletion
5. Calendar view (v2)
6. Stripe subscriptions (v2)
7. Push notifications via Capacitor (v2)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
