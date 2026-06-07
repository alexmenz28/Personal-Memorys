import "server-only";

import { profileRepository } from "@/modules/profile/server/repository";
import { updateTag, unstable_cache } from "next/cache";

export function getCachedProfileByClerkId(clerkUserId: string) {
  return unstable_cache(
    async () => profileRepository.findByClerkUserId(clerkUserId),
    ["user-profile", clerkUserId],
    {
      revalidate: 60,
      tags: [`user-profile-${clerkUserId}`],
    },
  )();
}

export function revalidateUserProfileCache(clerkUserId: string) {
  updateTag(`user-profile-${clerkUserId}`);
}
