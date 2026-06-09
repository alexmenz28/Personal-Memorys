import { toDateOnlyString } from "@/shared/lib/dates";

export type DatedEventSummary = {
  id: string;
  title: string;
  date: string | null;
  isRecurring: boolean;
  isUndated: boolean;
  eventPeople: Array<{ person: { id: string; name: string } }>;
};

export function mergeCalendarEventSummary(
  events: DatedEventSummary[],
  created: DatedEventSummary,
) {
  if (created.isUndated || !created.date) {
    return events;
  }

  const without = events.filter((event) => event.id !== created.id);

  return [...without, created].sort((left, right) => {
    if (!left.date || !right.date) {
      return 0;
    }

    return left.date.localeCompare(right.date);
  });
}

export function replaceCalendarEventSummary(
  events: DatedEventSummary[],
  updated: DatedEventSummary,
) {
  const without = events.filter((event) => event.id !== updated.id);

  if (updated.isUndated || !updated.date) {
    return without;
  }

  return mergeCalendarEventSummary(without, updated);
}

export function removeCalendarEventSummary(
  events: DatedEventSummary[],
  eventId: string,
) {
  return events.filter((event) => event.id !== eventId);
}

export function serializeDatedEventSummary(event: {
  id: string;
  title: string;
  date: Date | string | null;
  isRecurring?: boolean;
  isUndated: boolean;
  eventPeople: Array<{ person: { id: string; name: string } }>;
}): DatedEventSummary {
  const dateString = event.date === null ? null : toDateOnlyString(event.date);

  return {
    id: event.id,
    title: event.title,
    date: dateString,
    isRecurring: event.isRecurring ?? false,
    isUndated: event.isUndated,
    eventPeople: event.eventPeople,
  };
}
