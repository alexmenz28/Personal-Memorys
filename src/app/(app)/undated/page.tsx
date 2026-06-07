import { EmptyState } from "@/components/ui/empty-state";
import { getCachedUndatedEvents } from "@/modules/events/server/cached-queries";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function UndatedPage() {
  const t = await getTranslations("undated");
  const profile = await requireCurrentUserProfile();
  const events = await getCachedUndatedEvents(profile.id);

  return (
    <AppPage title={t("title")} subtitle={t("subtitle")}>
      {events.length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="border-border/60 bg-card/80">
              <CardContent className="p-4">
                <p className="font-medium">{event.title}</p>
                {event.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppPage>
  );
}
