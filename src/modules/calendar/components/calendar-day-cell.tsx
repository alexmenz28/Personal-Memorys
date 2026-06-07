"use client";

import type { CalendarDayItem } from "@/modules/calendar/types/calendar-items";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

const PREVIEW_COUNT = 2;

type CalendarDayCellProps = {
  date: string;
  items: CalendarDayItem[];
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

export function CalendarDayCell({
  date,
  items,
  isToday,
  isSelected,
  onSelect,
}: CalendarDayCellProps) {
  const t = useTranslations("upcoming");
  const dayNumber = Number(date.slice(8, 10));
  const previewItems = items.slice(0, PREVIEW_COUNT);
  const hiddenCount = Math.max(items.length - PREVIEW_COUNT, 0);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        "flex h-full min-h-24 w-full flex-col rounded-lg border border-border/60 bg-card/40 p-1.5 text-left transition-colors hover:bg-muted/30",
        isSelected && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
        isToday && !isSelected && "border-primary/25 bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium",
            isToday && "bg-primary text-primary-foreground",
          )}
        >
          {dayNumber}
        </span>
        {hiddenCount > 0 ? (
          <span className="text-[10px] text-muted-foreground">+{hiddenCount}</span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <span className="mt-2 text-[10px] text-muted-foreground/60">
          {t("dayEmptyShort")}
        </span>
      ) : (
        <div className="mt-1.5 min-w-0 space-y-0.5 overflow-hidden">
          {previewItems.map((item) => (
            <div
              key={item.id}
              className="flex min-w-0 items-center gap-1 rounded-md bg-background/70 px-1 py-0.5"
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  item.kind === "holiday" ? "bg-muted-foreground" : "bg-primary",
                )}
              />
              <span className="truncate text-[10px] leading-tight">{item.title}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
