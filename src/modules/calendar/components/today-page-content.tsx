import { TodayPageClient } from "@/modules/calendar/components/today-page-client";
import {
  serializeEvent,
  serializeHoliday,
} from "@/modules/calendar/types/calendar-items";
import { calendarService } from "@/modules/calendar/server/service";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { getCachedPeopleList } from "@/modules/people/server/cached-queries";
import { toIsoString } from "@/shared/lib/dates";
import { getTranslations } from "next-intl/server";

export async function TodayPageContent() {
  const t = await getTranslations("today");
  const profile = await requireCurrentUserProfile();
  const [{ today, holidays, events }, people] = await Promise.all([
    calendarService.getToday(profile),
    getCachedPeopleList(profile.id),
  ]);

  return (
    <TodayPageClient
      title={t("title")}
      today={today}
      timezone={profile.timezone}
      locale={profile.locale}
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
