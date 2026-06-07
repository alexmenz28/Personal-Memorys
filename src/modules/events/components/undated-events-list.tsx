"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { SerializedEvent } from "@/modules/calendar/types/calendar-items";
import { useTranslations } from "next-intl";
type UndatedEventsListProps = {
  events: SerializedEvent[];
  onSelectEvent?: (event: SerializedEvent) => void;
};

export function UndatedEventsList({
  events,
  onSelectEvent,
}: UndatedEventsListProps) {
  const t = useTranslations("undated");

  if (events.length === 0) {
    return <EmptyState message={t("empty")} />;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card
          key={event.id}
          className="border-border/60 bg-card/80 transition-colors hover:bg-card"
        >
          <CardContent className="space-y-2 p-4">
            <button
              type="button"
              className="w-full space-y-2 text-left"
              onClick={() => onSelectEvent?.(event)}
            >
            <p className="font-medium">{event.title}</p>
            {event.description ? (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            ) : null}
            {event.eventPeople.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {event.eventPeople.map(({ person }) => (
                  <Badge key={person.id} variant="secondary">
                    {person.name}
                  </Badge>
                ))}
              </div>
            ) : null}
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function replaceUndatedEvent(
  events: SerializedEvent[],
  updated: SerializedEvent,
) {
  return events.map((event) => (event.id === updated.id ? updated : event));
}

export function removeUndatedEvent(events: SerializedEvent[], eventId: string) {
  return events.filter((event) => event.id !== eventId);
}

export function mergeUndatedEvent(
  events: SerializedEvent[],
  created: SerializedEvent,
) {
  if (!created.isUndated) {
    return events;
  }

  if (events.some((event) => event.id === created.id)) {
    return events;
  }

  return [created, ...events];
}
