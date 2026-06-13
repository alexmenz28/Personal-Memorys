"use client";

import { CreateEventDialog } from "@/modules/events/components/create-event-dialog";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import { EventSlidePanel } from "@/modules/events/components/event-slide-panel";
import { TodayActivitiesTimeline } from "@/modules/calendar/components/today-activities-timeline";
import {
  mergeCalendarEventSummary,
  removeCalendarEventSummary,
  replaceCalendarEventSummary,
  serializeDatedEventSummary,
  type DatedEventSummary,
} from "@/modules/calendar/lib/dated-event-summary";
import {
  mergeTodayEvent,
  removeCalendarEvent,
  replaceCalendarEvent,
  serializeEvent,
  type SerializedEvent,
  type SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { useServerSyncedState } from "@/shared/hooks/use-server-synced-state";
import { matchesAnnualDate } from "@/shared/lib/recurring-events";
import { useCallback, useMemo, useState } from "react";

type TodayPageClientProps = {
  title: string;
  today: string;
  timezone: string;
  locale: string;
  holidays: SerializedHoliday[];
  events: SerializedEvent[];
  allDatedEvents: DatedEventSummary[];
  people: PersonOption[];
};

export function TodayPageClient({
  title,
  today,
  timezone,
  locale,
  holidays,
  events: initialEvents,
  allDatedEvents: initialAllDatedEvents,
  people,
}: TodayPageClientProps) {
  const [events, setEvents] = useServerSyncedState(initialEvents);
  const [allDatedEvents, setAllDatedEvents] = useServerSyncedState(initialAllDatedEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedOccurrenceDate, setSelectedOccurrenceDate] = useState<
    string | null
  >(null);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) {
      return null;
    }

    const fromToday = events.find((event) => event.id === selectedEventId);

    if (fromToday) {
      return fromToday;
    }

    const summary = allDatedEvents.find((event) => event.id === selectedEventId);

    if (!summary) {
      return null;
    }

    return serializeEvent({
      id: summary.id,
      title: summary.title,
      description: summary.description,
      date: summary.date,
      occurrenceDate: selectedOccurrenceDate ?? summary.date,
      isUndated: summary.isUndated,
      isRecurring: summary.isRecurring,
      reminderDaysBefore: summary.reminderDaysBefore,
      eventPeople: summary.eventPeople,
      eventNotes: summary.eventNotes,
    });
  }, [allDatedEvents, events, selectedEventId, selectedOccurrenceDate]);

  const openEvent = useCallback((eventId: string, occurrenceDate: string) => {
    setSelectedEventId(eventId);
    setSelectedOccurrenceDate(occurrenceDate);
  }, []);

  const closeEvent = useCallback(() => {
    setSelectedEventId(null);
    setSelectedOccurrenceDate(null);
  }, []);

  const handleEventCreated = useCallback(
    (created: Parameters<typeof serializeEvent>[0]) => {
      const serialized = serializeEvent(created);
      const summary = serializeDatedEventSummary(created);

      setEvents((current) =>
        mergeTodayEvent(current, serialized, today),
      );
      setAllDatedEvents((current) => mergeCalendarEventSummary(current, summary));
    },
    [today],
  );

  const handleEventUpdated = useCallback(
    (updated: Parameters<typeof serializeEvent>[0]) => {
      const serialized = serializeEvent(updated);
      setEvents((current) => {
        const appearsToday =
          serialized.date &&
          (serialized.isRecurring
            ? matchesAnnualDate(serialized.date, today)
            : serialized.date === today);

        if (serialized.isUndated || !appearsToday) {
          return removeCalendarEvent(current, serialized.id);
        }

        const nextEvent = serialized.isRecurring
          ? { ...serialized, occurrenceDate: today }
          : serialized;

        return replaceCalendarEvent(current, nextEvent);
      });
      setAllDatedEvents((current) =>
        replaceCalendarEventSummary(current, serializeDatedEventSummary(updated)),
      );
      closeEvent();
    },
    [closeEvent, today],
  );

  const handleEventDeleted = useCallback((eventId: string) => {
    setEvents((current) => removeCalendarEvent(current, eventId));
    setAllDatedEvents((current) => removeCalendarEventSummary(current, eventId));
    closeEvent();
  }, [closeEvent]);

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
      <TodayActivitiesTimeline
        today={today}
        timezone={timezone}
        locale={locale}
        holidays={holidays}
        events={events}
        allDatedEvents={allDatedEvents}
        people={people.map((person) => ({
          id: person.id,
          name: person.name,
        }))}
        onEventClick={openEvent}
      />

      <EventSlidePanel
        open={Boolean(selectedEvent)}
        mode="edit"
        event={selectedEvent}
        people={people}
        today={today}
        onClose={closeEvent}
        onUpdated={handleEventUpdated}
        onDeleted={handleEventDeleted}
      />
    </AppPage>
  );
}
