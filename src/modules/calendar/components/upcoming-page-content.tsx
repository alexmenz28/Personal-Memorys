import { CreateEventDialog } from "@/modules/events/components/create-event-dialog";
import { UpcomingView } from "@/modules/calendar/components/upcoming-view";
import { calendarService } from "@/modules/calendar/server/service";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { getTranslations } from "next-intl/server";

export async function UpcomingPageContent() {
  const t = await getTranslations("upcoming");
  const profile = await requireCurrentUserProfile();
  const { holidays, events } = await calendarService.getUpcoming(profile);

  return (
    <AppPage
      title={t("title")}
      subtitle={t("subtitle")}
      action={<CreateEventDialog />}
    >
      <UpcomingView
        timezone={profile.timezone}
        locale={profile.locale}
        holidays={holidays}
        events={events}
      />
    </AppPage>
  );
}
