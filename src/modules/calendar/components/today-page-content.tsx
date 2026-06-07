import { CreateEventDialog } from "@/modules/events/components/create-event-dialog";
import { TodayView } from "@/modules/calendar/components/today-view";
import { calendarService } from "@/modules/calendar/server/service";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { getTranslations } from "next-intl/server";

export async function TodayPageContent() {
  const t = await getTranslations("today");
  const profile = await requireCurrentUserProfile();
  const { today, holidays, events } = await calendarService.getToday(profile);

  return (
    <AppPage title={t("title")} action={<CreateEventDialog defaultDate={today} />}>
      <TodayView
        today={today}
        timezone={profile.timezone}
        locale={profile.locale}
        holidays={holidays}
        events={events}
      />
    </AppPage>
  );
}
