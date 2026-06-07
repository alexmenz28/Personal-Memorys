import { AuthGate } from "@/components/auth/auth-gate";
import { getCurrentUserProfile, syncUserProfileFromClerk } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile =
    (await getCurrentUserProfile()) ?? (await syncUserProfileFromClerk());

  if (profile?.onboardingCompleted) {
    redirect("/today");
  }

  return <AuthGate>{children}</AuthGate>;
}
