import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateForDisplay } from "@/shared/lib/dates";
import { getTranslations } from "next-intl/server";

type TodayViewProps = {
  today: string;
  timezone: string;
  locale: string;
  holidays: Array<{ id: string; title: string; date: Date }>;
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    date: Date | null;
    eventPeople: Array<{
      person: { id: string; name: string };
    }>;
  }>;
};

export async function TodayView({
  today,
  timezone,
  locale,
  holidays,
  events,
}: TodayViewProps) {
  const t = await getTranslations("today");
  const formattedToday = formatDateForDisplay(
    new Date(`${today}T12:00:00.000Z`),
    locale,
    timezone,
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{formattedToday}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t("holidays")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {holidays.length === 0 ? (
              <EmptyState message={t("noHolidays")} />
            ) : (
              holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <p className="font-medium">{holiday.title}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t("events")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 ? (
              <EmptyState message={t("noEvents")} />
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-border/60 bg-card/80 px-4 py-3"
                >
                  <p className="font-medium">{event.title}</p>
                  {event.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  ) : null}
                  {event.eventPeople.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {event.eventPeople.map(({ person }) => (
                        <Badge key={person.id} variant="secondary">
                          {person.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
