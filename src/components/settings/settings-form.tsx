"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileLocaleFields } from "@/components/profile/profile-locale-fields";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { updateProfileSettings } from "@/modules/profile/actions/profile.actions";
import type { UpdateProfileInput } from "@/modules/profile/schemas/profile.schema";
import { FormActions } from "@/shared/components/layout/form-actions";
import type { ThemePreference } from "@/shared/lib/theme";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SettingsFormProps = {
  initialValues: UpdateProfileInput;
  initialTheme: ThemePreference;
};

export function SettingsForm({
  initialValues,
  initialTheme,
}: SettingsFormProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateProfileSettings(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>{t("appearance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSelector initialTheme={initialTheme} />
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>{t("account")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
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

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <FormActions>
              <Button type="submit" disabled={isPending}>
                {isPending ? tCommon("loading") : tCommon("save")}
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>{t("exportData")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {tCommon("comingSoon")}
        </CardContent>
      </Card>
    </div>
  );
}
