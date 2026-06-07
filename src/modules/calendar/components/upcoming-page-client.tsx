"use client";

import { CreateEventDialog } from "@/modules/events/components/create-event-dialog";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import { UpcomingViewSwitcher } from "@/modules/calendar/components/upcoming-view-switcher";
import {
  mergeCalendarEvent,
  removeCalendarEvent,
  replaceCalendarEvent,
  serializeEvent,
  type SerializedEvent,
  type SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { useCallback, useEffect, useState } from "react";

type UpcomingPageClientProps = {
  title: string;
  subtitle: string;
  locale: string;
  timezone: string;
  holidays: SerializedHoliday[];
  events: SerializedEvent[];
  people: PersonOption[];
};

export function UpcomingPageClient({
  title,
  subtitle,
  locale,
  timezone,
  holidays: initialHolidays,
  events: initialEvents,
  people,
}: UpcomingPageClientProps) {
  const [holidays, setHolidays] = useState(initialHolidays);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    setHolidays(initialHolidays);
    setEvents(initialEvents);
  }, [initialEvents, initialHolidays]);

  const handleEventCreated = useCallback(
    (created: Parameters<typeof serializeEvent>[0]) => {
      setEvents((current) =>
        mergeCalendarEvent(current, serializeEvent(created)),
      );
    },
    [],
  );

  const handleEventUpdated = useCallback(
    (updated: Parameters<typeof serializeEvent>[0]) => {
      const serialized = serializeEvent(updated);
      setEvents((current) => {
        if (serialized.isUndated || !serialized.date) {
          return removeCalendarEvent(current, serialized.id);
        }

        return replaceCalendarEvent(current, serialized);
      });
    },
    [],
  );

  const handleEventDeleted = useCallback((eventId: string) => {
    setEvents((current) => removeCalendarEvent(current, eventId));
  }, []);

  return (
    <AppPage
      title={title}
      subtitle={subtitle}
      action={
        <CreateEventDialog people={people} onCreated={handleEventCreated} />
      }
    >
      <UpcomingViewSwitcher
        holidays={holidays}
        events={events}
        people={people}
        locale={locale}
        timezone={timezone}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
      />
    </AppPage>
  );
}
