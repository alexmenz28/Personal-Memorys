"use client";

import { Badge } from "@/components/ui/badge";
import {
  parseEventIdFromItemId,
  type CalendarDayItem,
} from "@/modules/calendar/types/calendar-items";
import { cn } from "@/lib/utils";
import { formatDateForDisplay } from "@/shared/lib/dates";
import { useTranslations } from "next-intl";

type CalendarDayDetailProps = {
  date: string;
  items: CalendarDayItem[];
  locale: string;
  timezone: string;
  onEventClick?: (eventId: string) => void;
};

export function CalendarDayDetail({
  date,
  items,
  locale,
  timezone,
  onEventClick,
}: CalendarDayDetailProps) {
  const t = useTranslations("upcoming");
  const formattedDate = formatDateForDisplay(
    `${date}T12:00:00.000Z`,
    locale,
    timezone,
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{formattedDate}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dayDetailCount", { count: items.length })}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("dayEmpty")}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const eventId =
              item.kind === "event" ? parseEventIdFromItemId(item.id) : null;
            const isClickable = Boolean(eventId && onEventClick);

            const content = (
              <>
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
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.people.join(" · ")}
                  </p>
                ) : null}
              </>
            );

            if (!isClickable || !eventId) {
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-card/80 px-4 py-3"
                >
                  {content}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onEventClick?.(eventId)}
                className={cn(
                  "w-full rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-left transition-colors hover:bg-card",
                )}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
