import { UndatedPageClient } from "@/modules/events/components/undated-page-client";
import { serializeEvent } from "@/modules/calendar/types/calendar-items";
import { getCachedUndatedEvents } from "@/modules/events/server/cached-queries";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { getCachedPeopleList } from "@/modules/people/server/cached-queries";
import { toIsoString } from "@/shared/lib/dates";
import { getTranslations } from "next-intl/server";

export default async function UndatedPage() {
  const t = await getTranslations("undated");
  const profile = await requireCurrentUserProfile();
  const [events, people] = await Promise.all([
    getCachedUndatedEvents(profile.id),
    getCachedPeopleList(profile.id),
  ]);

  return (
    <UndatedPageClient
      title={t("title")}
      subtitle={t("subtitle")}
      events={events.map(serializeEvent)}
      people={people.map((person) => ({
        id: person.id,
        name: person.name,
        createdAt: toIsoString(person.createdAt),
      }))}
    />
  );
}
