import "server-only";

import type {
  PreferenceCategory,
  RelationshipType,
} from "@/generated/prisma/client";
import type {
  CreatePersonInput,
  UpdatePersonInput,
} from "@/modules/people/schemas/person.schema";

export type CreatePreferenceData = {
  personId: string;
  category: string;
  customCategoryId: string | null;
  label: string;
  value: string;
};
import { db } from "@/shared/server/db";

export const peopleRepository = {
  findManyForProfile(userProfileId: string) {
    return db.person.findMany({
      where: { userProfileId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            preferences: true,
            personNotes: true,
          },
        },
      },
    });
  },

  findByIdForProfile(personId: string, userProfileId: string) {
    return db.person.findFirst({
      where: { id: personId, userProfileId },
      include: {
        preferences: {
          orderBy: { createdAt: "desc" },
          include: {
            customCategory: { select: { id: true, label: true } },
          },
        },
        personNotes: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  findOwned(personId: string, userProfileId: string) {
    return db.person.findFirst({
      where: { id: personId, userProfileId },
    });
  },

  countOwned(personIds: string[], userProfileId: string) {
    return db.person.count({
      where: { id: { in: personIds }, userProfileId },
    });
  },

  create(userProfileId: string, data: CreatePersonInput) {
    return db.person.create({
      data: {
        userProfileId,
        name: data.name,
        relationship: data.relationship as RelationshipType,
        notes: data.notes,
      },
    });
  },

  update(personId: string, userProfileId: string, data: UpdatePersonInput) {
    return db.person.update({
      where: { id: personId, userProfileId },
      data: {
        name: data.name,
        relationship: data.relationship as RelationshipType,
        notes: data.notes,
      },
    });
  },

  delete(personId: string, userProfileId: string) {
    return db.person.delete({
      where: { id: personId, userProfileId },
    });
  },

  createPreference(data: CreatePreferenceData) {
    return db.preference.create({
      data: {
        personId: data.personId,
        category: data.category as PreferenceCategory,
        customCategoryId: data.customCategoryId,
        label: data.label,
        value: data.value,
      },
      include: {
        customCategory: { select: { id: true, label: true } },
      },
    });
  },

  deletePreference(preferenceId: string, personId: string) {
    return db.preference.delete({
      where: { id: preferenceId, personId },
    });
  },

  createNote(data: { personId: string; content: string }) {
    return db.personNote.create({ data });
  },

  deleteNote(noteId: string, personId: string) {
    return db.personNote.delete({
      where: { id: noteId, personId },
    });
  },
};
