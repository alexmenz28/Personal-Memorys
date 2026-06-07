import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { resolveUserProfile } from "@/modules/auth/server/session";
import { getTranslations } from "next-intl/server";

export default async function OnboardingPage() {
  const t = await getTranslations("onboarding");
  const profile = await resolveUserProfile();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <OnboardingForm
        initialValues={{
          locale: (profile?.locale as "en" | "es") ?? "en",
          timezone: profile?.timezone ?? "UTC",
          countryCode: profile?.countryCode ?? "US",
          regionCode: profile?.regionCode ?? undefined,
        }}
      />
    </div>
  );
}
