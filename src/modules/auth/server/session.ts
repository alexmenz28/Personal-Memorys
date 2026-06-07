import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getCachedProfileByClerkId } from "@/modules/auth/server/cached-profile";
import { profileRepository } from "@/modules/profile/server/repository";
import { revalidateTag } from "next/cache";
import { cache } from "react";

export async function getClerkUserId() {
  const { userId } = await auth();
  return userId;
}

export const getCurrentUserProfile = cache(async () => {
  const userId = await getClerkUserId();

  if (!userId) {
    return null;
  }

  return getCachedProfileByClerkId(userId);
});

export const syncUserProfileFromClerk = cache(async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  const profile = await profileRepository.upsertFromClerk({
    clerkUserId: user.id,
    email,
  });

  revalidateTag(`user-profile-${user.id}`, "max");

  return profile;
});

export const resolveUserProfile = cache(async () => {
  return (
    (await getCurrentUserProfile()) ?? (await syncUserProfileFromClerk())
  );
});

export const requireCurrentUserProfile = cache(async () => {
  const profile = await resolveUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return profile;
});
