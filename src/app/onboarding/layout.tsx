import { AuthGate } from "@/components/auth/auth-gate";
import { resolveUserProfile } from "@/modules/auth/server/session";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await resolveUserProfile();

  if (profile?.onboardingCompleted) {
    redirect("/today");
  }

  return <AuthGate>{children}</AuthGate>;
}
