# Roadmap — Personal Memories

Plan por fases para completar el MVP y preparar v2. Orden sugerido según impacto y dependencias.

---

## Fase 1 — Estabilidad y UX ✅ Cerrada

Objetivo: que todo lo que creas o editas se refleje al instante, sin recargar.

| # | Tarea | Estado |
|---|--------|--------|
| 1.1 | Panel de persona: estado local + callbacks tras mutaciones (prefs, notas) | ✅ Hecho |
| 1.2 | Preferencias/notas: preview + expandir con buscador y filtros | ✅ Hecho |
| 1.2b | Confirmación al eliminar persona (diálogo, no `confirm()` nativo) | ✅ Hecho |
| 1.3 | Auto-refresh optimista en Today/Upcoming al crear evento | ✅ Hecho |
| 1.4 | Auto-refresh optimista en `/undated` + botón crear evento | ✅ Hecho |
| 1.5 | Patrón unificado optimistic UI en eventos (crear/editar/eliminar) | ✅ Hecho |
| 1.6 | Checklist de pruebas manuales ampliado | ✅ Hecho |

**Criterio de éxito:** añadir preferencia, nota o evento → visible en < 1 s sin F5.

---

## Fase 2 — Próximos con calendario ✅ Cerrada

Objetivo: reemplazar la lista de Próximos por una **vista de calendario** (mes actual + navegación).

| # | Tarea | Notas |
|---|--------|-------|
| 2.1 | Diseño mes grid (Lun–Dom), responsive | ✅ Hecho |
| 2.2 | Componente `UpcomingCalendar` en `modules/calendar/` | ✅ Hecho |
| 2.3 | Reutilizar datos de `calendarService.getCalendar` | ✅ Hecho |
| 2.4 | Toggle calendario ↔ lista | ✅ Hecho |
| 2.5 | Clic en día → detalle del día en panel lateral | ✅ Hecho |
| 2.6 | i18n días/meses según locale (`Intl`) | ✅ Hecho |

---

## Fase 3 — Eventos completos

| # | Tarea | Estado |
|---|--------|--------|
| 3.1 | Eventos recurrentes anuales (`isRecurring`) | ✅ Hecho |
| 3.2 | Página `/undated`: crear eventos sin fecha + mostrar personas vinculadas | ✅ Hecho |
| 3.3 | Editar y eliminar eventos en **panel lateral** | ✅ Hecho |
| 3.4 | Crear evento desde ficha de persona (**panel**, persona preseleccionada) | ✅ Hecho |
| 3.5 | Timeline unificada en Today + clic en evento abre panel de edición | ✅ Hecho |

Patrón UX documentado en `docs/ARCHITECTURE.md` (panel vs modal vs inline).

---

## Fase 4 — Recordatorios ✅ Cerrada

| # | Tarea | Estado |
|---|--------|--------|
| 4.1 | Modelo `Reminder` + `ReminderDelivery` (idempotencia) | ✅ Hecho |
| 4.2 | UI recordatorio en crear/editar evento (solo con fecha) | ✅ Hecho |
| 4.3 | Job Inngest diario → ventana por timezone → Resend | ✅ Hecho |
| 4.4 | Plantillas de email (en/es) | ✅ Hecho |

---

## Fase 5 — Cuenta y datos

| # | Tarea |
|---|--------|
| 5.1 | Exportar datos (JSON/CSV) | ✅ Hecho |
| 5.2 | Eliminar cuenta + borrado en cascada | ✅ Hecho |
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

## Checklist de pruebas manuales

Repetir en **desktop** y **móvil** tras cada cambio relevante.

### People
- [ ] Abrir persona → añadir preferencia → aparece en preview sin recargar
- [ ] Con 4+ preferencias → solo 3 visibles + botón "Ver todas"
- [ ] Diálogo "Ver todas" → lista completa + eliminar funciona
- [ ] Igual para notas
- [ ] Contador en tarjeta de lista se actualiza
- [ ] Eliminar persona → diálogo de confirmación → desaparece de la lista
- [ ] "Agregar evento" en ficha → panel con persona preseleccionada

### Today
- [ ] Crear evento (modal) → aparece en timeline sin recargar
- [ ] Evento con persona vinculada → nombre visible
- [ ] Clic en evento → panel de edición
- [ ] Editar / eliminar evento → timeline se actualiza sin F5
- [ ] Evento **anual** con fecha de hoy → badge "Anual" + visible cada año

### Upcoming
- [ ] Vista calendario: clic en día → panel lateral con actividades
- [ ] Clic en evento en panel del día → editar con botón Volver
- [ ] Crear evento (modal) → aparece en calendario/lista sin recargar
- [ ] Evento anual → aparece en el mismo día/mes en otros años del grid
- [ ] Toggle calendario ↔ lista coherente

### Undated
- [ ] Crear evento sin fecha → aparece en `/undated`
- [ ] Clic en tarjeta → panel editar
- [ ] Asignar fecha en edición → desaparece de undated

### Eventos (modal vs panel)
- [ ] Botón global "Agregar evento" → **modal** con footer unificado
- [ ] Checkbox "Anual" deshabilitado si "Sin fecha"
- [ ] Buscador de personas: 3 recientes + búsqueda por nombre
- [ ] Recordatorio por email: solo con fecha; chips de anticipación; resumen al editar

### Recordatorios
- [ ] Crear evento con recordatorio → persiste al reabrir edición
- [ ] Evento sin fecha → sección recordatorio oculta
- [ ] Job Inngest (o llamada manual) con Resend configurado → email en/es

---

## UX pendiente de unificar (antes / durante Fase 4)

| # | Tarea | Estado |
|---|--------|--------|
| U.1 | Personas en móvil: slide panel (igual que eventos) | ✅ Hecho |
| U.2 | Header estable al abrir panel (no cambiar título) | ✅ Hecho |
| U.3 | `timeZone` global en next-intl (warning `ENVIRONMENT_FALLBACK`) | ✅ Hecho |
| U.4 | Extraer `CalendarSlidePanel` / reutilizar `EventSlidePanel` en calendario | Opcional |
| U.5 | Botón “Volver” vs X en paneles anidados (día → evento) — revisar copy i18n | Opcional |
| U.6 | Conjuntos de acciones alineados a la derecha (`FormActions`, `DialogFooter`) | ✅ Hecho |
| U.7 | Acciones flotantes en paneles (`FloatingFormActions`) + confirmación al guardar ediciones | ✅ Hecho |

---

## Fase 5.5 — Eventos + personas ✅ Cerrada

| # | Tarea | Estado |
|---|--------|--------|
| A | Enlaces desde evento al perfil de persona (`/people?person=`) | ✅ Hecho |
| B | Registro “¿Qué hicieron?” en evento (`EventNote` con categoría, label, value) | ✅ Hecho |
| C | Categorías de preferencias personalizables en Ajustes | ✅ Hecho |

---

## Orden recomendado para las próximas sesiones

1. **Fase 5.3** — edge cases webhook Clerk
2. **Lint** — reglas `react-hooks/*` y avisos pendientes
3. **Fase 6** — monetización y v2
