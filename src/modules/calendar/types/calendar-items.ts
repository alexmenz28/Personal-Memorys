import { toDateOnlyString } from "@/shared/lib/dates";
import {
  calendarItemIdForEvent,
  expandRecurringOccurrences,
  matchesAnnualDate,
} from "@/shared/lib/recurring-events";

export type CalendarDayItem = {
  id: string;
  title: string;
  date: string;
  kind: "holiday" | "event";
  description?: string | null;
  people?: string[];
  isRecurring?: boolean;
};

export type SerializedEventNote = {
  id: string;
  personId: string | null;
  preferenceId: string | null;
  personNoteId: string | null;
  category: string;
  customCategoryId: string | null;
  label: string;
  value: string;
  person: { id: string; name: string } | null;
};

export type SerializedEvent = {
  id: string;
  title: string;
  description: string | null;
  /** Canonical stored date (anchor for recurring events). */
  date: string | null;
  /** When set, the occurrence date to show in calendar/timeline views. */
  occurrenceDate?: string | null;
  isUndated: boolean;
  isRecurring: boolean;
  reminderDaysBefore: number[];
  eventPeople: Array<{ person: { id: string; name: string } }>;
  eventNotes: SerializedEventNote[];
};

export type SerializedHoliday = {
  id: string;
  title: string;
  date: string;
};

export function buildCalendarDayItems(
  holidays: SerializedHoliday[],
  events: SerializedEvent[],
  range?: { startDate: string; endDate: string },
): CalendarDayItem[] {
  const eventOccurrences = range
    ? expandRecurringOccurrences(events, range.startDate, range.endDate)
    : events
        .filter(
          (event): event is SerializedEvent & { date: string } =>
            Boolean(event.date) && !event.isUndated,
        )
        .map((event) => ({
          ...event,
          date: event.occurrenceDate ?? event.date,
        }));

  return [
    ...holidays.map((holiday) => ({
      id: `holiday-${holiday.id}`,
      title: holiday.title,
      date: holiday.date,
      kind: "holiday" as const,
    })),
    ...eventOccurrences.map((event) => ({
      id: event.isRecurring
        ? calendarItemIdForEvent(event.id, event.date)
        : `event-${event.id}`,
      title: event.title,
      date: event.date,
      kind: "event" as const,
      description: event.description,
      people: event.eventPeople.map(({ person }) => person.name),
      isRecurring: event.isRecurring,
    })),
  ];
}

export function groupItemsByDate(items: CalendarDayItem[]) {
  return items.reduce<Record<string, CalendarDayItem[]>>((groups, item) => {
    const current = groups[item.date] ?? [];
    current.push(item);
    groups[item.date] = current;
    return groups;
  }, {});
}

export function serializeHoliday(
  holiday: { id: string; title: string; date: Date | string },
): SerializedHoliday {
  return {
    id: holiday.id,
    title: holiday.title,
    date: toDateOnlyString(holiday.date),
  };
}

export function parseEventIdFromItemId(itemId: string) {
  if (!itemId.startsWith("event-")) {
    return null;
  }

  const body = itemId.slice("event-".length);
  const separator = body.indexOf("--");

  return separator === -1 ? body : body.slice(0, separator);
}

export function replaceCalendarEvent(
  events: SerializedEvent[],
  updated: SerializedEvent,
) {
  return events
    .map((event) => (event.id === updated.id ? updated : event))
    .sort((left, right) => {
      if (!left.date || !right.date) {
        return 0;
      }

      return left.date.localeCompare(right.date);
    });
}

export function removeCalendarEvent(events: SerializedEvent[], eventId: string) {
  return events.filter((event) => event.id !== eventId);
}

export function mergeCalendarEvent(
  events: SerializedEvent[],
  created: SerializedEvent,
) {
  if (created.isUndated || !created.date) {
    return events;
  }

  if (events.some((event) => event.id === created.id)) {
    return events;
  }

  return [...events, created].sort((left, right) => {
    if (!left.date || !right.date) {
      return 0;
    }

    return left.date.localeCompare(right.date);
  });
}

export function mergeTodayEvent(
  events: SerializedEvent[],
  created: SerializedEvent,
  today: string,
) {
  if (created.isUndated || !created.date) {
    return events;
  }

  const appearsToday = created.isRecurring
    ? matchesAnnualDate(created.date, today)
    : created.date === today;

  if (!appearsToday) {
    return events;
  }

  if (events.some((event) => event.id === created.id)) {
    return events;
  }

  return [
    ...events,
    created.isRecurring
      ? { ...created, occurrenceDate: today }
      : created,
  ];
}

export function serializeEventNote(note: {
  id: string;
  personId: string | null;
  preferenceId?: string | null;
  personNoteId?: string | null;
  category: string;
  customCategoryId?: string | null;
  label: string;
  value: string;
  person: { id: string; name: string } | null;
}): SerializedEventNote {
  return {
    id: note.id,
    personId: note.personId,
    preferenceId: note.preferenceId ?? null,
    personNoteId: note.personNoteId ?? null,
    category: note.category,
    customCategoryId: note.customCategoryId ?? null,
    label: note.label,
    value: note.value,
    person: note.person,
  };
}

function resolveReminderDaysBefore(event: {
  reminders?: Array<{ daysBefore: number }>;
  reminderDaysBefore?: number[];
}) {
  if (event.reminders?.length) {
    return event.reminders
      .map((reminder) => reminder.daysBefore)
      .sort((left, right) => left - right);
  }

  if (event.reminderDaysBefore?.length) {
    return [...event.reminderDaysBefore].sort((left, right) => left - right);
  }

  return [];
}

export function serializeEvent(event: {
  id: string;
  title: string;
  description: string | null;
  date: Date | string | null;
  occurrenceDate?: Date | string | null;
  isUndated: boolean;
  isRecurring?: boolean;
  reminders?: Array<{ daysBefore: number }>;
  reminderDaysBefore?: number[];
  eventPeople: Array<{ person: { id: string; name: string } }>;
  eventNotes?: Array<{
    id: string;
    personId: string | null;
    preferenceId?: string | null;
    personNoteId?: string | null;
    category: string;
    customCategoryId?: string | null;
    label: string;
    value: string;
    person: { id: string; name: string } | null;
  }>;
}): SerializedEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date ? toDateOnlyString(event.date) : null,
    occurrenceDate: event.occurrenceDate
      ? toDateOnlyString(event.occurrenceDate)
      : null,
    isUndated: event.isUndated,
    isRecurring: event.isRecurring ?? false,
    reminderDaysBefore: resolveReminderDaysBefore(event),
    eventPeople: event.eventPeople,
    eventNotes: event.eventNotes?.map((note) => serializeEventNote(note)) ?? [],
  };
}
