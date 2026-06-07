import "server-only";

import { eventsRepository } from "@/modules/events/server/repository";
import { updateTag, unstable_cache } from "next/cache";

export function getCachedEventsForDateRange(
  userProfileId: string,
  startDate: string,
  endDate: string,
) {
  return unstable_cache(
    async () =>
      eventsRepository.findForDateRange(userProfileId, startDate, endDate),
    ["events-range", userProfileId, startDate, endDate],
    { revalidate: 30, tags: [`events-${userProfileId}`] },
  )();
}

export function getCachedUndatedEvents(userProfileId: string) {
  return unstable_cache(
    async () => eventsRepository.findUndated(userProfileId),
    ["events-undated", userProfileId],
    { revalidate: 30, tags: [`events-${userProfileId}`] },
  )();
}

export function revalidateEventsCache(userProfileId: string) {
  updateTag(`events-${userProfileId}`);
}
