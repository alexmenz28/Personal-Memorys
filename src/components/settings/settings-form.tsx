"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { ProfileLocaleFields } from "@/components/profile/profile-locale-fields";
import { AccountSecurityCard } from "@/components/settings/account-security-card";
import { DeleteAccountCard } from "@/components/settings/delete-account-card";
import { ExportDataCard } from "@/components/settings/export-data-card";
import { PreferenceCategoriesCard } from "@/components/settings/preference-categories-card";
import type { CustomPreferenceCategory } from "@/modules/people/lib/preference-categories";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { updateProfileSettings } from "@/modules/profile/actions/profile.actions";
import {
  REMINDER_HOUR_OPTIONS,
  type UpdateProfileInput,
} from "@/modules/profile/schemas/profile.schema";
import { FormActions } from "@/shared/components/layout/form-actions";
import { useServerSyncedState } from "@/shared/hooks/use-server-synced-state";
import { formatHourLabel } from "@/shared/lib/dates";
import type { ThemePreference } from "@/lib/theme";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type SettingsFormProps = {
  initialValues: UpdateProfileInput;
  initialTheme: ThemePreference;
  userEmail: string;
  googleEnabled: boolean;
  customPreferenceCategories: CustomPreferenceCategory[];
};

function settingsEqual(left: UpdateProfileInput, right: UpdateProfileInput) {
  return (
    left.locale === right.locale &&
    left.timezone === right.timezone &&
    left.countryCode === right.countryCode &&
    left.regionCode === right.regionCode &&
    left.reminderHour === right.reminderHour
  );
}

export function SettingsForm({
  initialValues,
  initialTheme,
  userEmail,
  googleEnabled,
  customPreferenceCategories,
}: SettingsFormProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useServerSyncedState(initialValues);
  const [savedValues, setSavedValues] = useServerSyncedState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const hasChanges = useMemo(
    () => !settingsEqual(form, savedValues),
    [form, savedValues],
  );

  const hourOptions = useMemo(
    () =>
      REMINDER_HOUR_OPTIONS.map((hour) => ({
        hour,
        label: formatHourLabel(hour, locale),
      })),
    [locale],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasChanges || isPending) {
      return;
    }

    setError(null);
    setShowSaved(false);

    startTransition(async () => {
      const result = await updateProfileSettings(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSavedValues(form);
      setShowSaved(true);

      if (result.data.localeChanged) {
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>{t("appearance")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ThemeSelector initialTheme={initialTheme} />
          <p className="text-xs text-muted-foreground">{t("appearanceAutoSave")}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>{t("preferences")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("preferencesHint")}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-3">
              <h3 className="text-sm font-medium">{t("reminders")}</h3>
              <div className="space-y-2">
                <Label htmlFor="reminder-hour">{t("reminderHour")}</Label>
                <FormSelect
                  id="reminder-hour"
                  value={String(form.reminderHour ?? 8)}
                  onValueChange={(nextValue) =>
                    setForm({
                      ...form,
                      reminderHour: Number(nextValue),
                    })
                  }
                  options={hourOptions.map(({ hour, label }) => ({
                    value: String(hour),
                    label,
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  {t("reminderHourHint")}
                </p>
              </div>
            </section>

            <section className="space-y-5 border-t border-border/60 pt-8">
              <h3 className="text-sm font-medium">{t("regionAndLanguage")}</h3>
              <ProfileLocaleFields
                form={form}
                onChange={setForm}
                labels={{
                  country: t("country"),
                  timezone: t("timezone"),
                  language: t("language"),
                  timezoneHint: t("timezoneHint"),
                }}
              />
            </section>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            {showSaved ? (
              <p className="text-sm text-muted-foreground">{t("saved")}</p>
            ) : null}

            <FormActions>
              <Button type="submit" disabled={isPending || !hasChanges}>
                {isPending ? tCommon("loading") : tCommon("save")}
              </Button>
            </FormActions>
          </CardContent>
        </Card>
      </form>

      <PreferenceCategoriesCard
        customCategories={customPreferenceCategories}
      />

      <AccountSecurityCard
        userEmail={userEmail}
        googleEnabled={googleEnabled}
      />

      <ExportDataCard />

      <DeleteAccountCard userEmail={userEmail} />
    </div>
  );
}
