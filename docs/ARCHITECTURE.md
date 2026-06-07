# Architecture

Personal Memories uses a **modular monolith** on Next.js App Router.

## Directory layout

```
src/
├── app/                         # Routes only (thin pages)
│   ├── (app)/                   # Authenticated app
│   │   ├── layout.tsx           # Auth guard + persistent shell
│   │   ├── loading.tsx          # Main content skeleton
│   │   ├── people/
│   │   │   ├── page.tsx         # List + `?person=` panel (desktop)
│   │   │   └── [id]/            # Redirects to `?person=` query
│   │   ├── today/
│   │   ├── upcoming/
│   │   └── settings/
│   └── onboarding/
├── modules/
│   ├── auth/server/             # Session, resolveUserProfile
│   ├── profile/                 # Settings, onboarding, theme
│   ├── people/                  # CRUD, panel UI
│   ├── events/                  # Event mutations + create dialog
│   ├── calendar/                # Today / upcoming read models
│   ├── holidays/                # Public holiday sync + queries
│   └── jobs/                    # Inngest
└── shared/
    ├── components/layout/       # Shell, nav, header, page chrome
    ├── components/ui/           # shadcn primitives
    ├── hooks/
    ├── lib/                     # Client-safe utils (theme, dates)
    └── server/                  # db, action-utils (server-only)
```

## Navigation performance

- **Persistent shell** in `(app)/layout.tsx` — sidebar and header do not remount on route change.
- **`loading.tsx`** — instant skeleton while server components fetch data.
- **Query-param panel** — `/people?person=id` opens a slide panel on desktop; the list stays visible.
- **`React.cache()`** on session helpers — deduplicates profile reads within one request.

## Layers per module

| Layer | Role |
|-------|------|
| `actions/` | `"use server"` mutations, return `ActionResult` |
| `server/` | Repositories, services, queries |
| `schemas/` | Zod validation |
| `components/` | Domain UI (client) |

## Request flow

```
Page (server) → service/repository → shared/server/db
Form → actions → service → revalidatePath
```

## Page chrome

Pages use `<AppPage title subtitle action>` to set the header without re-mounting the shell.
