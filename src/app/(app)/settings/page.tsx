import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings/settings-form";
import { requireCurrentUserProfile } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const profile = await requireCurrentUserProfile();

  return (
    <AppShell title={t("title")}>
      <SettingsForm
        initialTheme={profile.theme}
        initialValues={{
          locale: profile.locale as "en" | "es",
          timezone: profile.timezone,
          countryCode: profile.countryCode,
          regionCode: profile.regionCode ?? undefined,
        }}
      />
    </AppShell>
  );
}
