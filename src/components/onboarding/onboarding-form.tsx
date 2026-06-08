"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileLocaleFields } from "@/components/profile/profile-locale-fields";
import { completeOnboarding } from "@/modules/profile/actions/profile.actions";
import type { UpdateProfileInput } from "@/modules/profile/schemas/profile.schema";
import { FormActions } from "@/shared/components/layout/form-actions";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type OnboardingFormProps = {
  initialValues: UpdateProfileInput;
};

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await completeOnboarding(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/today");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <ProfileLocaleFields
            form={form}
            onChange={setForm}
            autoDetectTimezoneOnMount
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
              {isPending ? "..." : t("continue")}
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
