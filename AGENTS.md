<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project architecture

Modular monolith — see `docs/ARCHITECTURE.md`.

- `src/app/` — thin routes only
- `src/modules/{auth,profile,people,events,reminders,holidays,jobs}/` — domain logic
- `src/shared/` — DB, UI primitives, client-safe utils
- Server code uses `import "server-only"`
- Actions return `ActionResult` via `runAction()` in `shared/server/action-utils.ts`
