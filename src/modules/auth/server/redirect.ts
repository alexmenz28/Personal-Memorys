import "server-only";

import { resolveUserProfile } from "@/modules/auth/server/session";

export async function getPostAuthRedirectPath() {
  const profile = await resolveUserProfile();

  return profile?.onboardingCompleted ? "/today" : "/onboarding";
}
