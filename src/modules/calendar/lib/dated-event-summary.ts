import type { SerializedEventNote } from "@/modules/calendar/types/calendar-items";
import { serializeEventNote } from "@/modules/calendar/types/calendar-items";
import { toDateOnlyString } from "@/shared/lib/dates";

export type DatedEventSummary = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  isRecurring: boolean;
  isUndated: boolean;
  reminderDaysBefore: number[];
  eventPeople: Array<{ person: { id: string; name: string } }>;
  eventNotes: SerializedEventNote[];
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
  description?: string | null;
  date: Date | string | null;
  isRecurring?: boolean;
  isUndated: boolean;
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
}): DatedEventSummary {
  const dateString = event.date === null ? null : toDateOnlyString(event.date);
  const reminderDaysBefore = event.reminders?.length
    ? event.reminders
        .map((reminder) => reminder.daysBefore)
        .sort((left, right) => left - right)
    : (event.reminderDaysBefore ?? []);

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    date: dateString,
    isRecurring: event.isRecurring ?? false,
    isUndated: event.isUndated,
    reminderDaysBefore,
    eventPeople: event.eventPeople,
    eventNotes: event.eventNotes?.map((note) => serializeEventNote(note)) ?? [],
  };
}
