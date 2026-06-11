import type { DatedEventSummary } from "@/modules/calendar/lib/dated-event-summary";
import type {
  SerializedEvent,
  SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import {
  addDaysToDateString,
  parseDateOnly,
} from "@/shared/lib/dates";
import { expandRecurringOccurrences } from "@/shared/lib/recurring-events";

export type TodayActivityItem = {
  id: string;
  eventId: string;
  title: string;
  occurrenceDate: string;
  isRecurring: boolean;
  people: string[];
  personIds: string[];
  kind: "event" | "holiday";
};

export type TodayActivityDayGroup = {
  date: string;
  items: TodayActivityItem[];
};

export function daysBetweenDates(from: string, to: string) {
  const fromMs = parseDateOnly(from).getTime();
  const toMs = parseDateOnly(to).getTime();

  return Math.round((toMs - fromMs) / (1000 * 60 * 60 * 24));
}

function sortItems(items: TodayActivityItem[]) {
  return [...items].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === "holiday" ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });
}

function collectActivityItems({
  today,
  allDatedEvents,
  todayEvents,
  holidays,
  personId,
  rangeDays,
}: {
  today: string;
  allDatedEvents: DatedEventSummary[];
  todayEvents: SerializedEvent[];
  holidays: SerializedHoliday[];
  personId: string | "all";
  rangeDays: number;
}): TodayActivityItem[] {
  const catalog = new Map<string, DatedEventSummary>();

  for (const event of allDatedEvents) {
    catalog.set(event.id, event);
  }

  for (const event of todayEvents) {
    catalog.set(event.id, {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      isRecurring: event.isRecurring,
      isUndated: event.isUndated,
      reminderDaysBefore: event.reminderDaysBefore,
      eventPeople: event.eventPeople,
      eventNotes: event.eventNotes,
    });
  }

  const rangeStart = addDaysToDateString(today, -rangeDays);
  const rangeEnd = addDaysToDateString(today, rangeDays);

  const expandable = [...catalog.values()]
    .filter((event) => !event.isUndated && event.date)
    .map((event) => ({
      id: event.id,
      date: event.date,
      isRecurring: event.isRecurring,
      isUndated: event.isUndated,
    }));

  const occurrences = expandRecurringOccurrences(
    expandable,
    rangeStart,
    rangeEnd,
  );

  const items: TodayActivityItem[] = [];

  for (const occurrence of occurrences) {
    const source = catalog.get(occurrence.id);

    if (!source) {
      continue;
    }

    const personIds = source.eventPeople.map((link) => link.person.id);
    const people = source.eventPeople.map((link) => link.person.name);

    if (personId !== "all" && !personIds.includes(personId)) {
      continue;
    }

    items.push({
      id: `event-${source.id}--${occurrence.date}`,
      eventId: source.id,
      title: source.title,
      occurrenceDate: occurrence.date,
      isRecurring: source.isRecurring,
      people,
      personIds,
      kind: "event",
    });
  }

  if (personId === "all") {
    for (const holiday of holidays) {
      items.push({
        id: `holiday-${holiday.id}`,
        eventId: holiday.id,
        title: holiday.title,
        occurrenceDate: holiday.date,
        isRecurring: false,
        people: [],
        personIds: [],
        kind: "holiday",
      });
    }
  }

  return items;
}

export function buildTodayActivitiesByDay({
  today,
  allDatedEvents,
  todayEvents,
  holidays,
  personId,
  rangeDays = 180,
}: {
  today: string;
  allDatedEvents: DatedEventSummary[];
  todayEvents: SerializedEvent[];
  holidays: SerializedHoliday[];
  personId: string | "all";
  rangeDays?: number;
}): TodayActivityDayGroup[] {
  const items = collectActivityItems({
    today,
    allDatedEvents,
    todayEvents,
    holidays,
    personId,
    rangeDays,
  });

  const byDate = new Map<string, TodayActivityItem[]>();

  for (const item of items) {
    const dayItems = byDate.get(item.occurrenceDate) ?? [];
    dayItems.push(item);
    byDate.set(item.occurrenceDate, dayItems);
  }

  if (!byDate.has(today)) {
    byDate.set(today, []);
  }

  return [...byDate.keys()]
    .sort((left, right) => left.localeCompare(right))
    .map((date) => ({
      date,
      items: sortItems(byDate.get(date) ?? []),
    }));
}
