"use server";

import { requireCurrentUserProfile, resolveUserProfile } from "@/modules/auth/server/session";
import {
  getCachedPersonDetail,
  revalidatePeopleListCache,
  revalidatePersonCache,
} from "@/modules/people/server/cached-queries";
import { peopleRepository } from "@/modules/people/server/repository";
import {
  createPersonNoteSchema,
  createPersonSchema,
  createPreferenceSchema,
  updatePersonSchema,
} from "@/modules/people/schemas/person.schema";
import { runAction } from "@/shared/server/action-utils";
import { revalidatePath } from "next/cache";

export async function fetchPersonDetail(personId: string) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const person = await getCachedPersonDetail(personId, profile.id);

    if (!person) {
      throw new Error("Person not found");
    }

    return person;
  });
}

function invalidatePersonData(personId: string, userProfileId: string) {
  revalidatePersonCache(personId);
  revalidatePeopleListCache(userProfileId);
}

async function requireOwnedPerson(personId: string) {
  const profile = await requireCurrentUserProfile();
  const person = await peopleRepository.findOwned(personId, profile.id);

  if (!person) {
    throw new Error("Person not found");
  }

  return { profile, person };
}

export async function createPerson(input: unknown) {
  return runAction(async () => {
    const profile = await resolveUserProfile();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const data = createPersonSchema.parse(input);
    const person = await peopleRepository.create(profile.id, data);

    invalidatePersonData(person.id, profile.id);
    revalidatePath("/people");
    return person;
  });
}

export async function updatePerson(personId: string, input: unknown) {
  return runAction(async () => {
    const { profile } = await requireOwnedPerson(personId);
    const data = updatePersonSchema.parse(input);
    const person = await peopleRepository.update(personId, profile.id, data);

    invalidatePersonData(personId, profile.id);
    revalidatePath("/people");
    revalidatePath(`/people/${personId}`);
    return person;
  });
}

export async function deletePerson(personId: string) {
  return runAction(async () => {
    const { profile } = await requireOwnedPerson(personId);
    await peopleRepository.delete(personId, profile.id);
    invalidatePersonData(personId, profile.id);
    revalidatePath("/people");
  });
}

export async function createPreference(input: unknown) {
  return runAction(async () => {
    const data = createPreferenceSchema.parse(input);
    await requireOwnedPerson(data.personId);

    const preference = await peopleRepository.createPreference(data);
    revalidatePersonCache(data.personId);
    revalidatePath(`/people/${data.personId}`);
    return preference;
  });
}

export async function deletePreference(preferenceId: string, personId: string) {
  return runAction(async () => {
    await requireOwnedPerson(personId);
    await peopleRepository.deletePreference(preferenceId, personId);
    revalidatePersonCache(personId);
    revalidatePath(`/people/${personId}`);
  });
}

export async function createPersonNote(input: unknown) {
  return runAction(async () => {
    const data = createPersonNoteSchema.parse(input);
    await requireOwnedPerson(data.personId);

    const note = await peopleRepository.createNote(data);
    revalidatePersonCache(data.personId);
    revalidatePath(`/people/${data.personId}`);
    return note;
  });
}

export async function deletePersonNote(noteId: string, personId: string) {
  return runAction(async () => {
    await requireOwnedPerson(personId);
    await peopleRepository.deleteNote(noteId, personId);
    revalidatePersonCache(personId);
    revalidatePath(`/people/${personId}`);
  });
}
