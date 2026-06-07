import { ThemeSync } from "@/modules/profile/components/theme-sync";
import { resolveUserProfile } from "@/modules/auth/server/session";
import { AppShellLayout } from "@/shared/components/layout/app-shell-layout";
import type { ThemePreference } from "@/shared/lib/theme";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await resolveUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  if (!profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <>
      <ThemeSync theme={profile.theme as ThemePreference} />
      <AppShellLayout>{children}</AppShellLayout>
    </>
  );
}
