import "server-only";

import type { PreferenceCategory } from "@/generated/prisma/client";
import type {
  CreateEventNoteFromPreferenceInput,
  CreateEventNoteFromPersonNoteInput,
  CreateEventNoteInput,
} from "@/modules/events/schemas/event-note.schema";
import { db } from "@/shared/server/db";

async function assertPersonLinkedToEvent(
  eventId: string,
  personId: string,
  userProfileId: string,
) {
  const event = await db.event.findFirst({
    where: { id: eventId, userProfileId },
    select: {
      id: true,
      eventPeople: {
        where: { personId },
        select: { personId: true },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  if (event.eventPeople.length === 0) {
    throw new Error("Selected person is not linked to this event.");
  }
}

export const eventNotesRepository = {
  findForEvent(eventId: string) {
    return db.eventNote.findMany({
      where: { eventId },
      include: {
        person: { select: { id: true, name: true } },
        customCategory: { select: { id: true, label: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async createForEvent(userProfileId: string, data: CreateEventNoteInput) {
    await assertPersonLinkedToEvent(data.eventId, data.personId, userProfileId);

    return db.eventNote.create({
      data: {
        eventId: data.eventId,
        personId: data.personId,
        category: data.category as PreferenceCategory,
        customCategoryId: data.customCategoryId,
        label: data.label,
        value: data.value,
      },
      include: {
        person: { select: { id: true, name: true } },
        customCategory: { select: { id: true, label: true } },
      },
    });
  },

  async createFromPreference(
    userProfileId: string,
    data: CreateEventNoteFromPreferenceInput,
  ) {
    await assertPersonLinkedToEvent(data.eventId, data.personId, userProfileId);

    const existing = await db.eventNote.findFirst({
      where: {
        eventId: data.eventId,
        preferenceId: data.preferenceId,
      },
      select: { id: true },
    });

    if (existing) {
      throw new Error("This preference is already logged for this event.");
    }

    const preference = await db.preference.findFirst({
      where: {
        id: data.preferenceId,
        personId: data.personId,
        person: { userProfileId },
      },
    });

    if (!preference) {
      throw new Error("Preference not found.");
    }

    return db.eventNote.create({
      data: {
        eventId: data.eventId,
        personId: data.personId,
        preferenceId: preference.id,
        category: preference.category,
        customCategoryId: preference.customCategoryId,
        label: preference.label,
        value: preference.value,
      },
      include: {
        person: { select: { id: true, name: true } },
        customCategory: { select: { id: true, label: true } },
      },
    });
  },

  async createFromPersonNote(
    userProfileId: string,
    data: CreateEventNoteFromPersonNoteInput,
  ) {
    await assertPersonLinkedToEvent(data.eventId, data.personId, userProfileId);

    const existing = await db.eventNote.findFirst({
      where: {
        eventId: data.eventId,
        personNoteId: data.personNoteId,
      },
      select: { id: true },
    });

    if (existing) {
      throw new Error("This note is already linked to this event.");
    }

    const personNote = await db.personNote.findFirst({
      where: {
        id: data.personNoteId,
        personId: data.personId,
        person: { userProfileId },
      },
    });

    if (!personNote) {
      throw new Error("Note not found.");
    }

    const content = personNote.content.trim();
    const label =
      content.length > 80 ? `${content.slice(0, 77).trimEnd()}…` : content;

    return db.eventNote.create({
      data: {
        eventId: data.eventId,
        personId: data.personId,
        personNoteId: personNote.id,
        category: "OTHER",
        label,
        value: content,
      },
      include: {
        person: { select: { id: true, name: true } },
        customCategory: { select: { id: true, label: true } },
      },
    });
  },

  async deleteForEvent(
    noteId: string,
    eventId: string,
    userProfileId: string,
  ) {
    const note = await db.eventNote.findFirst({
      where: {
        id: noteId,
        eventId,
        event: { userProfileId },
      },
      select: { id: true },
    });

    if (!note) {
      throw new Error("Event note not found.");
    }

    return db.eventNote.delete({ where: { id: noteId } });
  },
};
