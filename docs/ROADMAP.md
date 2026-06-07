# Roadmap — Personal Memories

Plan por fases para completar el MVP y preparar v2. Orden sugerido según impacto y dependencias.

---

## Fase 1 — Estabilidad y UX (en curso)

Objetivo: que todo lo que creas o editas se refleje al instante, sin recargar.

| # | Tarea | Estado |
|---|--------|--------|
| 1.1 | Panel de persona: estado local + callbacks tras mutaciones (prefs, notas) | ✅ Hecho |
| 1.2 | Preferencias/notas: preview + expandir con buscador y filtros | ✅ Hecho |
| 1.2b | Confirmación al eliminar persona (diálogo, no `confirm()` nativo) | ✅ Hecho |
| 1.3 | Auto-refresh optimista en Today/Upcoming al crear evento | ✅ Hecho |
| 1.4 | Auto-refresh optimista en `/undated` + botón crear evento | ✅ Hecho |
| 1.5 | Patrón unificado `onMutated` / optimistic UI en todos los formularios | Pendiente |
| 1.6 | Tests manuales documentados (checklist por sección) | Pendiente |

**Criterio de éxito:** añadir preferencia, nota o evento → visible en < 1 s sin F5.

---

## Fase 2 — Próximos con calendario

Objetivo: reemplazar la lista de Próximos por una **vista de calendario** (mes actual + navegación).

| # | Tarea | Notas |
|---|--------|-------|
| 2.1 | Diseño mes grid (Lun–Dom), responsive | ✅ Hecho |
| 2.2 | Componente `UpcomingCalendar` en `modules/calendar/` | ✅ Hecho |
| 2.3 | Reutilizar datos de `calendarService.getUpcoming` | ✅ Hecho |
| 2.4 | Toggle calendario ↔ lista | ✅ Hecho |
| 2.5 | Clic en día → detalle del día en panel lateral | ✅ Hecho |
| 2.6 | i18n días/meses según locale (`Intl`) | ✅ Hecho |

**Dependencias:** Fase 1 estable (eventos se ven al crearlos).

---

## Fase 3 — Eventos completos

| # | Tarea | Estado |
|---|--------|--------|
| 3.1 | Eventos recurrentes (cumpleaños, aniversarios) — `isRecurring` + regla simple (anual) | Pendiente |
| 3.2 | Página `/undated`: crear eventos sin fecha + mostrar personas vinculadas | ✅ Hecho |
| 3.3 | Editar y eliminar eventos en **panel lateral** | ✅ Hecho |
| 3.4 | Crear evento desde ficha de persona (**panel**, persona preseleccionada) | ✅ Hecho |
| 3.5 | Timeline unificada en Today + clic en evento abre panel de edición | ✅ Hecho |

Patrón UX documentado en `docs/ARCHITECTURE.md` (panel vs modal vs inline).

---

## Fase 4 — Recordatorios

| # | Tarea |
|---|--------|
| 4.1 | Modelo `Reminder` — días antes, canal email |
| 4.2 | UI para configurar recordatorio al crear/editar evento |
| 4.3 | Job Inngest diario: eventos en ventana → Resend |
| 4.4 | Plantillas de email (en/es) |

---

## Fase 5 — Cuenta y datos

| # | Tarea |
|---|--------|
| 5.1 | Exportar datos (JSON/CSV) |
| 5.2 | Eliminar cuenta + borrado en cascada |
| 5.3 | Webhook Clerk ya sincroniza usuarios — revisar edge cases |

---

## Fase 6 — v2 (comercial)

| # | Tarea |
|---|--------|
| 6.1 | Stripe + planes Free/Pro |
| 6.2 | Límites por plan (personas, eventos, recordatorios) |
| 6.3 | Vista calendario anual |
| 6.4 | Push notifications (Capacitor) |
| 6.5 | Compartir calendario familiar (workspace) |

---

## Checklist de pruebas manuales (Fase 1)

Repetir en **desktop** y **móvil** tras cada cambio relevante.

### People
- [ ] Abrir persona → añadir preferencia → aparece en preview sin recargar
- [ ] Con 4+ preferencias → solo 3 visibles + botón "Ver todas"
- [ ] Diálogo "Ver todas" → lista completa + eliminar funciona
- [ ] Igual para notas
- [ ] Contador en tarjeta de lista se actualiza (ej. "3 preferencias")

### Today / Upcoming
- [ ] Crear evento → aparece en timeline sin recargar
- [ ] Evento con persona vinculada → nombre visible

### Undated
- [ ] Crear evento sin fecha → aparece en `/undated`

---

## Orden recomendado para las próximas sesiones

1. **Fase 1.3–1.5** — cerrar bugs de refresh en eventos y undated  
2. **Fase 2** — calendario en Próximos (tu prioridad visual)  
3. **Fase 3.1–3.3** — recurrentes + CRUD eventos  
4. **Fase 4** — recordatorios por email  
