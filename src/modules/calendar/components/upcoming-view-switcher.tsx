"use client";

import { UpcomingCalendar } from "@/modules/calendar/components/upcoming-calendar";
import { UpcomingList } from "@/modules/calendar/components/upcoming-list";
import type { EventMutationResult } from "@/modules/events/components/event-panel-content";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import {
  buildCalendarDayItems,
  type SerializedEvent,
  type SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import { cn } from "@/shared/lib/utils";
import { CalendarDays, List } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type UpcomingViewSwitcherProps = {
  holidays: SerializedHoliday[];
  events: SerializedEvent[];
  people: PersonOption[];
  calendarRange: { startDate: string; endDate: string };
  locale: string;
  timezone: string;
  onEventUpdated?: (event: EventMutationResult) => void;
  onEventDeleted?: (eventId: string) => void;
};

type ViewMode = "calendar" | "list";

export function UpcomingViewSwitcher({
  holidays,
  events,
  people,
  calendarRange,
  locale,
  timezone,
  onEventUpdated,
  onEventDeleted,
}: UpcomingViewSwitcherProps) {
  const t = useTranslations("upcoming");
  const [view, setView] = useState<ViewMode>("calendar");

  const items = useMemo(
    () => buildCalendarDayItems(holidays, events, calendarRange),
    [calendarRange, events, holidays],
  );

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-xl border border-border/60 bg-muted/20 p-1">
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            view === "calendar"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CalendarDays className="size-4" />
          {t("viewCalendar")}
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            view === "list"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <List className="size-4" />
          {t("viewList")}
        </button>
      </div>

      {view === "calendar" ? (
        <UpcomingCalendar
          items={items}
          events={events}
          people={people}
          locale={locale}
          timezone={timezone}
          onEventUpdated={onEventUpdated}
          onEventDeleted={onEventDeleted}
        />
      ) : (
        <UpcomingList
          items={items}
          locale={locale}
          timezone={timezone}
          emptyMessage={t("empty")}
        />
      )}
    </div>
  );
}
