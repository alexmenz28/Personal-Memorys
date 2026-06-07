"use client";

import { CalendarTimeline } from "@/modules/calendar/components/calendar-timeline";
import type { CalendarDayItem } from "@/modules/calendar/types/calendar-items";
import { coerceToDate } from "@/shared/lib/dates";

type UpcomingListProps = {
  items: CalendarDayItem[];
  locale: string;
  timezone: string;
  emptyMessage: string;
};

export function UpcomingList({
  items,
  locale,
  timezone,
  emptyMessage,
}: UpcomingListProps) {
  const timeline = [...items]
    .sort(
      (left, right) =>
        coerceToDate(`${left.date}T12:00:00.000Z`).getTime() -
        coerceToDate(`${right.date}T12:00:00.000Z`).getTime(),
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: coerceToDate(`${item.date}T12:00:00.000Z`),
      kind: item.kind,
      description: item.description,
      people: item.people,
    }));

  return (
    <CalendarTimeline
      items={timeline}
      emptyMessage={emptyMessage}
      locale={locale}
      timezone={timezone}
    />
  );
}
