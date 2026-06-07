"use client";

import { CreateEventDialog } from "@/modules/events/components/create-event-dialog";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import { EventSlidePanel } from "@/modules/events/components/event-slide-panel";
import {
  mergeUndatedEvent,
  removeUndatedEvent,
  replaceUndatedEvent,
  UndatedEventsList,
} from "@/modules/events/components/undated-events-list";
import {
  serializeEvent,
  type SerializedEvent,
} from "@/modules/calendar/types/calendar-items";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { useCallback, useEffect, useState } from "react";

type UndatedPageClientProps = {
  title: string;
  subtitle: string;
  events: SerializedEvent[];
  people: PersonOption[];
};

export function UndatedPageClient({
  title,
  subtitle,
  events: initialEvents,
  people,
}: UndatedPageClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<SerializedEvent | null>(
    null,
  );

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const handleEventCreated = useCallback(
    (created: Parameters<typeof serializeEvent>[0]) => {
      setEvents((current) =>
        mergeUndatedEvent(current, serializeEvent(created)),
      );
    },
    [],
  );

  const handleEventUpdated = useCallback(
    (updated: Parameters<typeof serializeEvent>[0]) => {
      const serialized = serializeEvent(updated);
      setEvents((current) => {
        if (!serialized.isUndated) {
          return removeUndatedEvent(current, serialized.id);
        }

        return replaceUndatedEvent(current, serialized);
      });
      setSelectedEvent(null);
    },
    [],
  );

  const handleEventDeleted = useCallback((eventId: string) => {
    setEvents((current) => removeUndatedEvent(current, eventId));
    setSelectedEvent(null);
  }, []);

  return (
    <AppPage
      title={title}
      subtitle={subtitle}
      action={
        <CreateEventDialog
          defaultUndated
          people={people}
          onCreated={handleEventCreated}
        />
      }
    >
      <UndatedEventsList
        events={events}
        onSelectEvent={setSelectedEvent}
      />

      <EventSlidePanel
        open={Boolean(selectedEvent)}
        mode="edit"
        event={selectedEvent}
        people={people}
        onClose={() => setSelectedEvent(null)}
        onUpdated={handleEventUpdated}
        onDeleted={handleEventDeleted}
      />
    </AppPage>
  );
}
