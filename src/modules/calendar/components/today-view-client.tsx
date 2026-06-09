"use client";

import { TodayActivitiesTimeline } from "@/modules/calendar/components/today-activities-timeline";
import type { DatedEventSummary } from "@/modules/calendar/lib/dated-event-summary";
import type {
  SerializedEvent,
  SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import { matchesAnnualDate } from "@/shared/lib/recurring-events";

type TodayViewClientProps = {
  today: string;
  timezone: string;
  locale: string;
  holidays: SerializedHoliday[];
  events: SerializedEvent[];
  allDatedEvents: DatedEventSummary[];
  people: Array<{ id: string; name: string }>;
  onEventClick?: (eventId: string, occurrenceDate: string) => void;
};

export function TodayViewClient(props: TodayViewClientProps) {
  return <TodayActivitiesTimeline {...props} />;
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
