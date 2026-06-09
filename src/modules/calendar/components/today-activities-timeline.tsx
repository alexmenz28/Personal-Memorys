"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  buildTodayActivitiesByDay,
  daysBetweenDates,
  type TodayActivityItem,
} from "@/modules/calendar/lib/today-activities-timeline";
import type { DatedEventSummary } from "@/modules/calendar/lib/dated-event-summary";
import type {
  SerializedEvent,
  SerializedHoliday,
} from "@/modules/calendar/types/calendar-items";
import { formatDateForDisplay } from "@/shared/lib/dates";
import { cn } from "@/lib/utils";
import { ArrowDown, Repeat2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

type TodayActivitiesTimelineProps = {
  today: string;
  locale: string;
  timezone: string;
  holidays: SerializedHoliday[];
  events: SerializedEvent[];
  allDatedEvents: DatedEventSummary[];
  people: Array<{ id: string; name: string }>;
  onEventClick?: (eventId: string, occurrenceDate: string) => void;
};

function ActivityRow({
  item,
  onEventClick,
}: {
  item: TodayActivityItem;
  onEventClick?: (eventId: string, occurrenceDate: string) => void;
}) {
  const t = useTranslations("upcoming");
  const eventId = item.kind === "event" ? item.eventId : null;
  const isClickable = Boolean(eventId && onEventClick);

  const content = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{item.title}</p>
          {item.kind === "holiday" ? (
            <Badge variant="outline">{t("holiday")}</Badge>
          ) : null}
        </div>
        {item.people.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {item.people.join(" · ")}
          </p>
        ) : null}
      </div>
      {item.isRecurring ? (
        <Repeat2
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-label={t("recurring")}
        />
      ) : null}
    </div>
  );

  if (!isClickable || !eventId) {
    return (
      <Card className="border-border/60 bg-card/80">
        <div className="p-3">{content}</div>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/80 transition-colors hover:bg-card">
      <button
        type="button"
        className="w-full p-3 text-left"
        onClick={() => onEventClick?.(eventId, item.occurrenceDate)}
      >
        {content}
      </button>
    </Card>
  );
}

function formatDayLabel(
  date: string,
  today: string,
  locale: string,
  timezone: string,
  labels: {
    dayToday: string;
    dayYesterday: string;
    dayTomorrow: string;
    daysAgo: (count: number) => string;
    inDays: (count: number) => string;
  },
) {
  const diff = daysBetweenDates(today, date);
  const formatted = formatDateForDisplay(
    new Date(`${date}T12:00:00.000Z`),
    locale,
    timezone,
  );

  if (diff === 0) {
    return `${labels.dayToday} · ${formatted}`;
  }

  if (diff === -1) {
    return labels.dayYesterday;
  }

  if (diff === 1) {
    return labels.dayTomorrow;
  }

  if (diff < -1 && diff >= -7) {
    return labels.daysAgo(-diff);
  }

  if (diff > 1 && diff <= 7) {
    return labels.inDays(diff);
  }

  return formatted;
}

export function TodayActivitiesTimeline({
  today,
  locale,
  timezone,
  holidays,
  events,
  allDatedEvents,
  people,
  onEventClick,
}: TodayActivitiesTimelineProps) {
  const t = useTranslations("today");
  const [personFilter, setPersonFilter] = useState<string>("all");
  const [showBackToToday, setShowBackToToday] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);

  const dayLabels = useMemo(
    () => ({
      dayToday: t("dayToday"),
      dayYesterday: t("dayYesterday"),
      dayTomorrow: t("dayTomorrow"),
      daysAgo: (count: number) => t("daysAgo", { count }),
      inDays: (count: number) => t("inDays", { count }),
    }),
    [t],
  );

  const dayGroups = useMemo(
    () =>
      buildTodayActivitiesByDay({
        today,
        allDatedEvents,
        todayEvents: events,
        holidays,
        personId: personFilter,
      }),
    [allDatedEvents, events, holidays, personFilter, today],
  );

  const hasAnyActivity = dayGroups.some((group) => group.items.length > 0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      todayRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [personFilter, today]);

  useEffect(() => {
    const target = todayRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBackToToday(!entry.isIntersecting);
      },
      { root: null, rootMargin: "-72px 0px 0px", threshold: 0 },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [dayGroups]);

  function scrollToToday() {
    todayRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  if (!hasAnyActivity && personFilter !== "all") {
    return (
      <div className="space-y-5">
        <PersonFilterChips
          value={personFilter}
          onChange={setPersonFilter}
          people={people}
          allLabel={t("filterAllPeople")}
        />
        <EmptyState message={t("noActivitiesForPerson")} />
      </div>
    );
  }

  return (
    <div className="relative space-y-5 pb-16">
      <PersonFilterChips
        value={personFilter}
        onChange={setPersonFilter}
        people={people}
        allLabel={t("filterAllPeople")}
      />

      <div className="space-y-6">
        {dayGroups.map((group) => {
          const isToday = group.date === today;

          return (
            <section key={group.date} className="space-y-2">
              <div
                ref={isToday ? todayRef : undefined}
                className={cn(
                  isToday &&
                    "sticky top-0 z-10 -mx-1 border-y border-primary/20 bg-background/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80",
                )}
              >
                <h2
                  className={cn(
                    "text-sm font-semibold",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {formatDayLabel(
                    group.date,
                    today,
                    locale,
                    timezone,
                    dayLabels,
                  )}
                </h2>
              </div>

              {group.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("noEventsTodayInTimeline")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <ActivityRow item={item} onEventClick={onEventClick} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {showBackToToday ? (
        <Button
          type="button"
          size="sm"
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 shadow-lg"
          onClick={scrollToToday}
        >
          <ArrowDown className="size-4" aria-hidden />
          {t("backToToday")}
        </Button>
      ) : null}
    </div>
  );
}

function PersonFilterChips({
  value,
  onChange,
  people,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  people: Array<{ id: string; name: string }>;
  allLabel: string;
}) {
  const t = useTranslations("today");

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t("filterByPerson")}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip
          active={value === "all"}
          onClick={() => onChange("all")}
          label={allLabel}
        />
        {people.map((person) => (
          <FilterChip
            key={person.id}
            active={value === person.id}
            onClick={() => onChange(person.id)}
            label={person.name}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/60 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
