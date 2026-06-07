"use client";

import { CreateEventDialog } from "@/modules/events/components/create-event-dialog";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import { EventSlidePanel } from "@/modules/events/components/event-slide-panel";
import {
  TodayViewClient,
  mergeTodayEvent,
} from "@/modules/calendar/components/today-view-client";
import {
  removeCalendarEvent,
  replaceCalendarEvent,
  serializeEvent,
  type SerializedEvent,
  type SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { useCallback, useMemo, useState } from "react";

type TodayPageClientProps = {
  title: string;
  today: string;
  timezone: string;
  locale: string;
  holidays: SerializedHoliday[];
  events: SerializedEvent[];
  people: PersonOption[];
};

export function TodayPageClient({
  title,
  today,
  timezone,
  locale,
  holidays,
  events: initialEvents,
  people,
}: TodayPageClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const handleEventCreated = useCallback(
    (created: Parameters<typeof serializeEvent>[0]) => {
      setEvents((current) =>
        mergeTodayEvent(current, serializeEvent(created), today),
      );
    },
    [today],
  );

  const handleEventUpdated = useCallback(
    (updated: Parameters<typeof serializeEvent>[0]) => {
      const serialized = serializeEvent(updated);
      setEvents((current) => {
        if (serialized.isUndated || serialized.date !== today) {
          return removeCalendarEvent(current, serialized.id);
        }

        return replaceCalendarEvent(current, serialized);
      });
      setSelectedEventId(null);
    },
    [today],
  );

  const handleEventDeleted = useCallback((eventId: string) => {
    setEvents((current) => removeCalendarEvent(current, eventId));
    setSelectedEventId(null);
  }, []);

  return (
    <AppPage
      title={title}
      action={
        <CreateEventDialog
          defaultDate={today}
          people={people}
          onCreated={handleEventCreated}
        />
      }
    >
      <TodayViewClient
        today={today}
        timezone={timezone}
        locale={locale}
        holidays={holidays}
        events={events}
        onEventClick={setSelectedEventId}
      />

      <EventSlidePanel
        open={Boolean(selectedEvent)}
        mode="edit"
        event={selectedEvent}
        people={people}
        onClose={() => setSelectedEventId(null)}
        onUpdated={handleEventUpdated}
        onDeleted={handleEventDeleted}
      />
    </AppPage>
  );
}
