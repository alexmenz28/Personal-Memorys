import "server-only";

import { profileRepository } from "@/modules/profile/server/repository";
import { updateTag, unstable_cache } from "next/cache";

export function getCachedProfileByAuthUserId(authUserId: string) {
  return unstable_cache(
    async () => profileRepository.findByAuthUserId(authUserId),
    ["user-profile", authUserId],
    {
      revalidate: 60,
      tags: [`user-profile-${authUserId}`],
    },
  )();
}

export function revalidateUserProfileCache(authUserId: string) {
  updateTag(`user-profile-${authUserId}`);
}
