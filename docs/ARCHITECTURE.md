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

## Overlay patterns (panel / modal / inline)

Three patterns, chosen by intent — not one-size-fits-all.

| Pattern | Component | When to use | Examples |
|---------|-----------|-------------|----------|
| **Slide panel** | `SlidePanel` | Explore or edit with **context visible** behind (list, calendar). Longer content, vertical scroll. | Person detail (desktop), calendar day detail, edit event |
| **Modal** | `Dialog` | Short **transactional** flows and destructive confirmations. Interrupt, complete, dismiss. | Create person, create event (global button), confirm delete |
| **Inline** | Form inside an open panel | Add items **within** a detail view already open. | Preferences, notes in person detail |

### Rules

1. **Panel** → inspect / detail / edit with context (keep the page behind).
2. **Modal** → quick create or confirm (few fields, no prior selection).
3. **Inline** → nested adds inside an open detail.

### Event flows

| Entry point | UI |
|-------------|-----|
| Header “Add event” (Today / Upcoming / Undated) | **Modal** (`CreateEventDialog`) |
| Calendar day → click user event | **Panel** (`EventSlidePanel` edit) |
| Undated list → click event | **Panel** (edit) |
| Person detail → “Add event” | **Panel** (create, person pre-selected; may stack over person panel on desktop) |
| Delete event / delete person | **Modal** (`ConfirmDialog`) |

### Mobile

- Person detail: full-screen view (not slide panel); `PersonSlidePanel` uses `desktopOnly`.
- Calendar day detail and event edit: `SlidePanel` full width (no `desktopOnly`).
- Quick creates stay as modals on all breakpoints.

### Shared primitive

`src/shared/components/layout/slide-panel.tsx` — framer-motion slide from the right, backdrop, body scroll lock. Optional `desktopOnly` for people; optional `stacked` when a second panel opens over an existing one.
