"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { parseEventIdFromItemId } from "@/modules/calendar/types/calendar-items";
import { formatDateForDisplay } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

export type CalendarTimelineItem = {
  id: string;
  title: string;
  date?: Date;
  kind: "holiday" | "event";
  description?: string | null;
  people?: string[];
  isRecurring?: boolean;
};

type CalendarTimelineProps = {
  items: CalendarTimelineItem[];
  emptyMessage: string;
  locale: string;
  timezone: string;
  showDate?: boolean;
  onEventClick?: (eventId: string) => void;
};

export function CalendarTimeline({
  items,
  emptyMessage,
  locale,
  timezone,
  showDate = true,
  onEventClick,
}: CalendarTimelineProps) {
  const t = useTranslations("upcoming");

  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const eventId =
          item.kind === "event" ? parseEventIdFromItemId(item.id) : null;
        const isClickable = Boolean(eventId && onEventClick);

        const inner = (
          <>
            {showDate && item.date ? (
              <div className="min-w-[5.5rem] text-sm text-muted-foreground">
                {formatDateForDisplay(item.date, locale, timezone)}
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.title}</p>
                <Badge
                  variant={item.kind === "holiday" ? "outline" : "secondary"}
                >
                  {item.kind === "holiday" ? t("holiday") : t("event")}
                </Badge>
                {item.isRecurring ? (
                  <Badge variant="outline">{t("recurring")}</Badge>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
              {item.people && item.people.length > 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.people.join(" · ")}
                </p>
              ) : null}
            </div>
          </>
        );

        return (
          <Card
            key={item.id}
            className={cn(
              "border-border/60 bg-card/80",
              isClickable && "transition-colors hover:bg-card",
            )}
          >
            {isClickable && eventId ? (
              <button
                type="button"
                className="flex w-full items-start gap-4 p-4 text-left"
                onClick={() => onEventClick?.(eventId)}
              >
                {inner}
              </button>
            ) : (
              <CardContent className="flex items-start gap-4 p-4">
                {inner}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
