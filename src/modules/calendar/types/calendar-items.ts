import {
  calendarItemIdForEvent,
  expandRecurringOccurrences,
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
  reminderDaysBefore: number | null;
  eventPeople: Array<{ person: { id: string; name: string } }>;
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
  const date =
    typeof holiday.date === "string"
      ? holiday.date.slice(0, 10)
      : holiday.date.toISOString().slice(0, 10);

  return { id: holiday.id, title: holiday.title, date };
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

function toDateOnlyString(value: Date | string) {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
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
  eventPeople: Array<{ person: { id: string; name: string } }>;
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
    reminderDaysBefore: event.reminders?.[0]?.daysBefore ?? null,
    eventPeople: event.eventPeople,
  };
}
