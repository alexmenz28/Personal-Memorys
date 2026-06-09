"use client";

import { CalendarDayCell } from "@/modules/calendar/components/calendar-day-cell";
import { CalendarDayDetail } from "@/modules/calendar/components/calendar-day-detail";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { EventPanelContent } from "@/modules/events/components/event-panel-content";
import type { EventMutationResult } from "@/modules/events/components/event-panel-content";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import type { CalendarDayItem } from "@/modules/calendar/types/calendar-items";
import type { SerializedEvent } from "@/modules/calendar/types/calendar-items";
import { SlidePanel } from "@/shared/components/layout/slide-panel";
import {
  buildMonthGrid,
  getMonthOptions,
  getWeekdayLabels,
  getYearBoundsFromDates,
  getYearOptions,
  parseMonthRef,
  shiftMonth,
  type MonthRef,
} from "@/shared/lib/calendar-month";
import { getDateStringInTimezone } from "@/shared/lib/dates";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type PanelView = "day" | "event";

type UpcomingCalendarProps = {
  items: CalendarDayItem[];
  events: SerializedEvent[];
  people: PersonOption[];
  locale: string;
  timezone: string;
  onEventUpdated?: (event: EventMutationResult) => void;
  onEventDeleted?: (eventId: string) => void;
};

export function UpcomingCalendar({
  items,
  events,
  people,
  locale,
  timezone,
  onEventUpdated,
  onEventDeleted,
}: UpcomingCalendarProps) {
  const t = useTranslations("upcoming");
  const today = getDateStringInTimezone(timezone);
  const [month, setMonth] = useState<MonthRef>(() => parseMonthRef(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<PanelView>("day");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const itemsByDate = useMemo(() => {
    return items.reduce<Record<string, CalendarDayItem[]>>((groups, item) => {
      const current = groups[item.date] ?? [];
      current.push(item);
      groups[item.date] = current;
      return groups;
    }, {});
  }, [items]);

  const { minYear, maxYear } = useMemo(
    () => getYearBoundsFromDates(items.map((item) => item.date), today, 5),
    [items, today],
  );

  const monthCells = useMemo(() => buildMonthGrid(month), [month]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);
  const yearOptions = useMemo(
    () => getYearOptions(minYear, maxYear),
    [maxYear, minYear],
  );

  const selectedItems = selectedDate ? (itemsByDate[selectedDate] ?? []) : [];
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  function openDay(date: string) {
    setSelectedDate(date);
    setPanelView("day");
    setSelectedEventId(null);
  }

  function openEvent(eventId: string) {
    setSelectedEventId(eventId);
    setPanelView("event");
  }

  function backToDay() {
    setPanelView("day");
    setSelectedEventId(null);
  }

  function closePanel() {
    setSelectedDate(null);
    setPanelView("day");
    setSelectedEventId(null);
  }

  function goToToday() {
    setMonth(parseMonthRef(today));
    openDay(today);
  }

  const panelOpen = Boolean(selectedDate);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth((current) => shiftMonth(current, -1))}
              aria-label={t("previousMonth")}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth((current) => shiftMonth(current, 1))}
              aria-label={t("nextMonth")}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FormSelect
              aria-label={t("selectMonth")}
              value={String(month.month)}
              onValueChange={(nextValue) =>
                setMonth((current) => ({
                  ...current,
                  month: Number(nextValue),
                }))
              }
              options={monthOptions.map((option) => ({
                value: String(option.value),
                label: option.label,
              }))}
              size="sm"
              triggerClassName="capitalize"
            />
            <FormSelect
              aria-label={t("selectYear")}
              value={String(month.year)}
              onValueChange={(nextValue) =>
                setMonth((current) => ({
                  ...current,
                  year: Number(nextValue),
                }))
              }
              options={yearOptions.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
              size="sm"
              triggerClassName="w-auto min-w-20"
            />
          </div>

          <Button type="button" variant="outline" size="sm" onClick={goToToday}>
            {t("goToToday")}
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="grid auto-rows-fr grid-cols-7 gap-1">
          {monthCells.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="min-h-24" />;
            }

            const dayItems = itemsByDate[date] ?? [];

            return (
              <CalendarDayCell
                key={date}
                date={date}
                items={dayItems}
                isToday={date === today}
                isSelected={selectedDate === date}
                onSelect={() => openDay(date)}
              />
            );
          })}
        </div>
      </div>

      <SlidePanel open={panelOpen} onClose={closePanel}>
        {panelView === "day" && selectedDate ? (
          <CalendarDayDetail
            date={selectedDate}
            items={selectedItems}
            locale={locale}
            timezone={timezone}
            onEventClick={openEvent}
          />
        ) : null}
        {panelView === "event" && selectedEvent ? (
          <EventPanelContent
            mode="edit"
            event={selectedEvent}
            people={people}
            today={today}
            showBack
            onBack={backToDay}
            onSuccess={backToDay}
            onUpdated={onEventUpdated}
            onDeleted={(eventId) => {
              onEventDeleted?.(eventId);
              backToDay();
            }}
          />
        ) : null}
      </SlidePanel>
    </>
  );
}
