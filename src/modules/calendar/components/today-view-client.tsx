"use client";

import { CalendarTimeline } from "@/modules/calendar/components/calendar-timeline";
import {
  buildCalendarDayItems,
  serializeEvent,
  serializeHoliday,
  type SerializedEvent,
  type SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import { formatDateForDisplay } from "@/shared/lib/dates";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type TodayViewClientProps = {
  today: string;
  timezone: string;
  locale: string;
  holidays: SerializedHoliday[];
  events: SerializedEvent[];
  onEventClick?: (eventId: string) => void;
};

export function TodayViewClient({
  today,
  timezone,
  locale,
  holidays: initialHolidays,
  events: initialEvents,
  onEventClick,
}: TodayViewClientProps) {
  const t = useTranslations("today");
  const [holidays, setHolidays] = useState(initialHolidays);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    setHolidays(initialHolidays);
    setEvents(initialEvents);
  }, [initialEvents, initialHolidays]);

  const items = useMemo(
    () => buildCalendarDayItems(holidays, events),
    [events, holidays],
  );

  const formattedToday = formatDateForDisplay(
    new Date(`${today}T12:00:00.000Z`),
    locale,
    timezone,
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{formattedToday}</p>
      <CalendarTimeline
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          kind: item.kind,
          description: item.description,
          people: item.people,
        }))}
        emptyMessage={t("empty")}
        locale={locale}
        timezone={timezone}
        showDate={false}
        onEventClick={onEventClick}
      />
    </div>
  );
}

export function mergeTodayEvent(
  events: SerializedEvent[],
  created: SerializedEvent,
  today: string,
) {
  if (created.isUndated || created.date !== today) {
    return events;
  }

  if (events.some((event) => event.id === created.id)) {
    return events;
  }

  return [...events, created];
}
