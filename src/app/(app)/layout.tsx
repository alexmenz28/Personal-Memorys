import { ThemeSync } from "@/components/settings/theme-sync";
import { getCurrentUserProfile, syncUserProfileFromClerk } from "@/lib/auth";
import type { ThemePreference } from "@/lib/theme";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = await getCurrentUserProfile();

  if (!profile) {
    profile = await syncUserProfileFromClerk();
  }

  if (!profile) {
    redirect("/sign-in");
  }

  if (!profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <>
      <ThemeSync theme={profile.theme as ThemePreference} />
      {children}
    </>
  );
}
