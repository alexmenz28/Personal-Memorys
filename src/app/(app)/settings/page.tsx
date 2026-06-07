import { SettingsForm } from "@/components/settings/settings-form";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { AppPage } from "@/shared/components/layout/page-chrome";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const profile = await requireCurrentUserProfile();

  return (
    <AppPage title={t("title")}>
      <SettingsForm
        initialTheme={profile.theme}
        initialValues={{
          locale: profile.locale as "en" | "es",
          timezone: profile.timezone,
          countryCode: profile.countryCode,
          regionCode: profile.regionCode ?? undefined,
        }}
      />
    </AppPage>
  );
}
