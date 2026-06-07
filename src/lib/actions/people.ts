"use server";

import {
  getCurrentUserProfile,
  requireCurrentUserProfile,
  syncUserProfileFromClerk,
} from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createPersonNoteSchema,
  createPersonSchema,
  createPreferenceSchema,
  updatePersonSchema,
} from "@/lib/validations/person";
import { revalidatePath } from "next/cache";

async function requireOwnedPerson(personId: string) {
  const profile = await requireCurrentUserProfile();
  const person = await db.person.findFirst({
    where: { id: personId, userProfileId: profile.id },
  });

  if (!person) {
    throw new Error("Person not found");
  }

  return { profile, person };
}

export async function createPerson(input: unknown) {
  const profile =
    (await getCurrentUserProfile()) ?? (await syncUserProfileFromClerk());

  if (!profile) {
    throw new Error("User profile not found");
  }

  const data = createPersonSchema.parse(input);

  const person = await db.person.create({
    data: {
      userProfileId: profile.id,
      name: data.name,
      relationship: data.relationship,
      notes: data.notes,
    },
  });

  revalidatePath("/people");
  return person;
}

export async function updatePerson(personId: string, input: unknown) {
  const { profile } = await requireOwnedPerson(personId);
  const data = updatePersonSchema.parse(input);

  const person = await db.person.update({
    where: { id: personId, userProfileId: profile.id },
    data: {
      name: data.name,
      relationship: data.relationship,
      notes: data.notes,
    },
  });

  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
  return person;
}

export async function deletePerson(personId: string) {
  const { profile } = await requireOwnedPerson(personId);

  await db.person.delete({
    where: { id: personId, userProfileId: profile.id },
  });

  revalidatePath("/people");
}

export async function createPreference(input: unknown) {
  const data = createPreferenceSchema.parse(input);
  await requireOwnedPerson(data.personId);

  const preference = await db.preference.create({
    data: {
      personId: data.personId,
      category: data.category,
      label: data.label,
      value: data.value,
    },
  });

  revalidatePath(`/people/${data.personId}`);
  return preference;
}

export async function deletePreference(preferenceId: string, personId: string) {
  await requireOwnedPerson(personId);

  await db.preference.delete({
    where: { id: preferenceId, personId },
  });

  revalidatePath(`/people/${personId}`);
}

export async function createPersonNote(input: unknown) {
  const data = createPersonNoteSchema.parse(input);
  await requireOwnedPerson(data.personId);

  const note = await db.personNote.create({
    data: {
      personId: data.personId,
      content: data.content,
    },
  });

  revalidatePath(`/people/${data.personId}`);
  return note;
}

export async function deletePersonNote(noteId: string, personId: string) {
  await requireOwnedPerson(personId);

  await db.personNote.delete({
    where: { id: noteId, personId },
  });

  revalidatePath(`/people/${personId}`);
}
