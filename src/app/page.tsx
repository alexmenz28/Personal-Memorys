import { buttonVariants } from "@/components/ui/button";
import {
  getCurrentUserProfile,
  syncUserProfileFromClerk,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  const t = await getTranslations("landing");

  if (userId) {
    const profile =
      (await getCurrentUserProfile()) ?? (await syncUserProfileFromClerk());

    redirect(profile?.onboardingCompleted ? "/today" : "/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Personal Memories
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: "lg" }), "px-6")}
          >
            {t("getStarted")}
          </Link>
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "px-6",
            )}
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
