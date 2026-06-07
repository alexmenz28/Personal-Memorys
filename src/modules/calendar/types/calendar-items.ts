export type CalendarDayItem = {
  id: string;
  title: string;
  date: string;
  kind: "holiday" | "event";
  description?: string | null;
  people?: string[];
};

export type SerializedEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  isUndated: boolean;
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
): CalendarDayItem[] {
  return [
    ...holidays.map((holiday) => ({
      id: `holiday-${holiday.id}`,
      title: holiday.title,
      date: holiday.date,
      kind: "holiday" as const,
    })),
    ...events
      .filter((event): event is SerializedEvent & { date: string } =>
        Boolean(event.date),
      )
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        date: event.date,
        kind: "event" as const,
        description: event.description,
        people: event.eventPeople.map(({ person }) => person.name),
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
  return itemId.startsWith("event-") ? itemId.slice("event-".length) : null;
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

export function serializeEvent(event: {
  id: string;
  title: string;
  description: string | null;
  date: Date | string | null;
  isUndated: boolean;
  eventPeople: Array<{ person: { id: string; name: string } }>;
}): SerializedEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date
      ? typeof event.date === "string"
        ? event.date.slice(0, 10)
        : event.date.toISOString().slice(0, 10)
      : null,
    isUndated: event.isUndated,
    eventPeople: event.eventPeople,
  };
}
