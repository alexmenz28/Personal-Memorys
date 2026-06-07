import {
  getCurrentUserProfile,
  syncUserProfileFromClerk,
} from "@/lib/auth";

export async function getPostAuthRedirectPath() {
  const profile =
    (await getCurrentUserProfile()) ?? (await syncUserProfileFromClerk());

  return profile?.onboardingCompleted ? "/today" : "/onboarding";
}
