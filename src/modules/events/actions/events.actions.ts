"use server";

import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { revalidateEventsCache } from "@/modules/events/server/cached-queries";
import { createEventSchema } from "@/modules/events/schemas/event.schema";
import { eventsRepository } from "@/modules/events/server/repository";
import { runAction } from "@/shared/server/action-utils";
import { revalidatePath } from "next/cache";

export async function createEvent(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const data = createEventSchema.parse(input);
    const event = await eventsRepository.create(profile.id, data);

    revalidateEventsCache(profile.id);
    revalidatePath("/today");
    revalidatePath("/upcoming");
    revalidatePath("/undated");

    return event;
  });
}
