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
│   ├── reminders/               # Email reminders + delivery job
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

- **All detail/edit overlays** use `SlidePanel` on every breakpoint (people, events, calendar day).
- The list or calendar stays visible behind a dimmed backdrop; close with **X** or tap outside.
- Quick creates stay as modals on all breakpoints.
- Page header does **not** swap title when a panel opens (context stays on the current page).

### Shared primitive

`src/shared/components/layout/slide-panel.tsx` — framer-motion slide from the right, backdrop, body scroll lock. Optional `stacked` when a second panel opens over an existing one (e.g. create event from person detail).

### Action buttons (mobile / one-hand use)

Use `FormActions` or `DialogFooter` — both align to the **trailing edge** (right in LTR).

| Rule | Rationale |
|------|-----------|
| Primary action **rightmost** | iOS HIG & Material: trailing = primary; easier for right-hand thumb on common phone grip |
| Secondary / Cancel **left of primary** within the group | Standard dialog order (Cancel · Guardar) |
| Destructive **before** primary, still in the end-aligned group | Visible but not the rightmost tap |
| Minimum ~44×44px touch targets | Apple HIG / WCAG 2.5.5 (AAA 44px) |
| Prefer actions at **bottom** of sheet/modal | Thumb zone (Hoober): bottom half is easier than top corners |
| Slide panels: `FloatingFormActions` + `FormActions` | Botones flotantes al pie (sin barra), visibles al hacer scroll |
| Editar evento / perfil | Modal de confirmación con `ChangeSummary` antes de guardar |

Not a strict law: ~10% of users are left-handed; bottom placement often matters more than left vs right. We optimize for LTR + right-hand one-handed use without hiding actions at the top.

### Floating actions in panels

`src/shared/components/layout/floating-form-actions.tsx` — `sticky bottom-4`, solo los botones (sin barra de fondo).

| Surface | Layout |
|---------|--------|
| `EventForm` (`footerLayout="panel"`) | Campos + `FloatingFormActions` |
| `PersonDetail` (`variant="panel"`) | Contenido + Eliminar · Guardar flotantes |
| Modales (`DialogContent`) | `max-h` + form `flex-col`; campos scroll, `DialogFooter` al pie |

Confirmación al modificar: `diffEventFormChanges` / `diffPersonProfileChanges` → `ConfirmDialog` + `ChangeSummary`.

Use `FormActions` everywhere actions appear: settings, onboarding, secondary adds (preferencias, notas), “Ver todas”, page actions.

## Reminders

Module: `src/modules/reminders/`

| Piece | Role |
|-------|------|
| `EventReminderFields` | UI in event form (dated events only); preset chips for days-before |
| `reminders/server/repository.ts` | Sync one EMAIL reminder per event; delivery log |
| `reminders/server/delivery.service.ts` | Daily window: `today + daysBefore` in user timezone |
| `reminders/server/email-templates.ts` | HTML templates en/es |
| Inngest `send-daily-reminders` | Cron `0 8 * * *` UTC |

Requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. Without them, the job skips sends (dev-safe).
