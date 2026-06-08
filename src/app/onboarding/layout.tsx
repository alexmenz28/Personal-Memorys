import { AuthGate } from "@/components/auth/auth-gate";
import { PostAuthRedirect } from "@/components/auth/post-auth-redirect";
import { resolveUserProfile } from "@/modules/auth/server/session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await resolveUserProfile();

  if (profile?.onboardingCompleted) {
    return <PostAuthRedirect to="/today" />;
  }

  return <AuthGate>{children}</AuthGate>;
}
