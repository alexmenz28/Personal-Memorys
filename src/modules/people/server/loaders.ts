import "server-only";

import { getCachedPersonDetail } from "@/modules/people/server/cached-queries";

export async function loadPersonDetail(personId: string, userProfileId: string) {
  return getCachedPersonDetail(personId, userProfileId);
}
