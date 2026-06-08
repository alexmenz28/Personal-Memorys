import { UpcomingPageClient } from "@/modules/calendar/components/upcoming-page-client";
import {
  serializeEvent,
  serializeHoliday,
} from "@/modules/calendar/types/calendar-items";
import { calendarService } from "@/modules/calendar/server/service";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { getCachedPeopleList } from "@/modules/people/server/cached-queries";
import { toIsoString } from "@/shared/lib/dates";
import { getTranslations } from "next-intl/server";

export async function UpcomingPageContent() {
  const t = await getTranslations("upcoming");
  const profile = await requireCurrentUserProfile();
  const [{ today, holidays, events }, people] = await Promise.all([
    calendarService.getCalendar(profile),
    getCachedPeopleList(profile.id),
  ]);
  const currentYear = Number(today.slice(0, 4));

  return (
    <UpcomingPageClient
      title={t("title")}
      subtitle={t("subtitle")}
      locale={profile.locale}
      timezone={profile.timezone}
      calendarRange={{
        startDate: `${currentYear - 2}-01-01`,
        endDate: `${currentYear + 5}-12-31`,
      }}
      holidays={holidays.map(serializeHoliday)}
      events={events.map(serializeEvent)}
      people={people.map((person) => ({
        id: person.id,
        name: person.name,
        createdAt: toIsoString(person.createdAt),
      }))}
    />
  );
}
