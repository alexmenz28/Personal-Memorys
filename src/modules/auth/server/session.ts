import "server-only";

import { auth } from "@/modules/auth/server/auth";
import { getCachedProfileByAuthUserId } from "@/modules/auth/server/cached-profile";
import { profileRepository } from "@/modules/profile/server/repository";
import { headers } from "next/headers";
import { cache } from "react";

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getAuthUserId() {
  const session = await getAuthSession();
  return session?.user.id ?? null;
}

export const getCurrentUserProfile = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  return getCachedProfileByAuthUserId(userId);
});

export const syncUserProfileFromAuth = cache(async () => {
  const session = await getAuthSession();

  if (!session?.user.email) {
    return null;
  }

  return profileRepository.upsertFromAuth({
    authUserId: session.user.id,
    email: session.user.email,
  });
});

export const resolveUserProfile = cache(async () => {
  return (
    (await getCurrentUserProfile()) ?? (await syncUserProfileFromAuth())
  );
});

export const requireCurrentUserProfile = cache(async () => {
  const profile = await resolveUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return profile;
});
