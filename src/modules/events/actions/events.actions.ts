"use server";

import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { revalidateEventsCache } from "@/modules/events/server/cached-queries";
import {
  createEventSchema,
  deleteEventSchema,
  updateEventSchema,
} from "@/modules/events/schemas/event.schema";
import { eventNotesRepository } from "@/modules/events/server/event-notes.repository";
import { eventsRepository } from "@/modules/events/server/repository";
import { peopleRepository } from "@/modules/people/server/repository";
import {
  createEventNoteFromPreferenceSchema,
  createEventNoteSchema,
} from "@/modules/events/schemas/event-note.schema";
import {
  serializeEvent,
  serializeEventNote,
} from "@/modules/calendar/types/calendar-items";
import { runAction } from "@/shared/server/action-utils";

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

    return serializeEvent(event);
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

    return serializeEvent(event);
  });
}

export async function createEventNoteFromPreference(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const data = createEventNoteFromPreferenceSchema.parse(input);

    const note = await eventNotesRepository.createFromPreference(
      profile.id,
      data,
    );

    revalidateEventsCache(profile.id);

    return serializeEventNote(note);
  });
}

export async function createEventNote(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const data = createEventNoteSchema.parse(input);

    const note = await eventNotesRepository.createForEvent(profile.id, data);

    revalidateEventsCache(profile.id);

    return serializeEventNote(note);
  });
}

export async function deleteEventNote(noteId: string, eventId: string) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();

    await eventNotesRepository.deleteForEvent(noteId, eventId, profile.id);

    revalidateEventsCache(profile.id);
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

    return { id };
  });
}
