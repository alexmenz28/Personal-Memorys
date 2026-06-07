import "server-only";

import { peopleRepository } from "@/modules/people/server/repository";
import { updateTag, unstable_cache } from "next/cache";

export function getCachedPeopleList(userProfileId: string) {
  return unstable_cache(
    async () => peopleRepository.findManyForProfile(userProfileId),
    ["people-list", userProfileId],
    { revalidate: 30, tags: [`people-list-${userProfileId}`] },
  )();
}

export function getCachedPersonDetail(personId: string, userProfileId: string) {
  return unstable_cache(
    async () => peopleRepository.findByIdForProfile(personId, userProfileId),
    ["person-detail", personId, userProfileId],
    { revalidate: 30, tags: [`person-${personId}`] },
  )();
}

export function revalidatePeopleListCache(userProfileId: string) {
  updateTag(`people-list-${userProfileId}`);
}

export function revalidatePersonCache(personId: string) {
  updateTag(`person-${personId}`);
}
