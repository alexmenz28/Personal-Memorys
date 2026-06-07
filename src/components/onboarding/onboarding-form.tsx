"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileLocaleFields } from "@/components/profile/profile-locale-fields";
import { completeOnboarding } from "@/lib/actions/profile";
import type { UpdateProfileInput } from "@/lib/validations/profile";
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      await completeOnboarding(form);
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

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "..." : t("continue")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
