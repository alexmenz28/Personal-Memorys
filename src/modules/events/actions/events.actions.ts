"use server";

import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { revalidateEventsCache } from "@/modules/events/server/cached-queries";
import {
  createEventSchema,
  deleteEventSchema,
  updateEventSchema,
} from "@/modules/events/schemas/event.schema";
import { eventsRepository } from "@/modules/events/server/repository";
import { peopleRepository } from "@/modules/people/server/repository";
import { runAction } from "@/shared/server/action-utils";
import { revalidatePath } from "next/cache";

export async function createEvent(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const data = createEventSchema.parse(input);

    if (data.personIds?.length) {
      const ownedCount = await peopleRepository.countOwned(
        data.personIds,
        profile.id,
      );

      if (ownedCount !== data.personIds.length) {
        throw new Error("One or more selected people are invalid.");
      }
    }

    const event = await eventsRepository.create(profile.id, data);

    revalidateEventsCache(profile.id);
    revalidatePath("/today");
    revalidatePath("/upcoming");
    revalidatePath("/undated");

    return event;
  });
}

export async function updateEvent(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const data = updateEventSchema.parse(input);

    const existing = await eventsRepository.findByIdForProfile(
      data.id,
      profile.id,
    );

    if (!existing) {
      throw new Error("Event not found.");
    }

    if (data.personIds?.length) {
      const ownedCount = await peopleRepository.countOwned(
        data.personIds,
        profile.id,
      );

      if (ownedCount !== data.personIds.length) {
        throw new Error("One or more selected people are invalid.");
      }
    }

    const event = await eventsRepository.update(profile.id, data);

    revalidateEventsCache(profile.id);
    revalidatePath("/today");
    revalidatePath("/upcoming");
    revalidatePath("/undated");

    return event;
  });
}

export async function deleteEvent(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const { id } = deleteEventSchema.parse(input);

    const existing = await eventsRepository.findByIdForProfile(
      id,
      profile.id,
    );

    if (!existing) {
      throw new Error("Event not found.");
    }

    await eventsRepository.delete(id, profile.id);

    revalidateEventsCache(profile.id);
    revalidatePath("/today");
    revalidatePath("/upcoming");
    revalidatePath("/undated");

    return { id };
  });
}
