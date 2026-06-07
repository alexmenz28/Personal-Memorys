import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { coerceToDate, formatDateForDisplay } from "@/shared/lib/dates";
import { getTranslations } from "next-intl/server";

type CalendarItem = {
  id: string;
  title: string;
  date: Date;
  kind: "holiday" | "event";
  description?: string | null;
  people?: string[];
};

type UpcomingViewProps = {
  timezone: string;
  locale: string;
  holidays: Array<{ id: string; title: string; date: Date | string }>;
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    date: Date | string | null;
    eventPeople: Array<{ person: { name: string } }>;
  }>;
};

function buildTimeline(
  holidays: UpcomingViewProps["holidays"],
  events: UpcomingViewProps["events"],
): CalendarItem[] {
  const items: CalendarItem[] = [
    ...holidays.map((holiday) => ({
      id: `holiday-${holiday.id}`,
      title: holiday.title,
      date: coerceToDate(holiday.date),
      kind: "holiday" as const,
    })),
    ...events
      .filter((event): event is typeof event & { date: Date | string } =>
        Boolean(event.date),
      )
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        date: coerceToDate(event.date),
        kind: "event" as const,
        description: event.description,
        people: event.eventPeople.map(({ person }) => person.name),
      })),
  ];

  return items.sort(
    (left, right) => left.date.getTime() - right.date.getTime(),
  );
}

export async function UpcomingView({
  timezone,
  locale,
  holidays,
  events,
}: UpcomingViewProps) {
  const t = await getTranslations("upcoming");
  const timeline = buildTimeline(holidays, events);

  if (timeline.length === 0) {
    return <EmptyState message={t("empty")} />;
  }

  return (
    <div className="space-y-3">
      {timeline.map((item) => (
        <Card key={item.id} className="border-border/60 bg-card/80">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="min-w-[5.5rem] text-sm text-muted-foreground">
              {formatDateForDisplay(item.date, locale, timezone)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.title}</p>
                <Badge variant={item.kind === "holiday" ? "outline" : "secondary"}>
                  {item.kind === "holiday" ? t("holiday") : t("event")}
                </Badge>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
