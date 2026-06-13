"use server";

import { requireCurrentUserProfile, resolveUserProfile } from "@/modules/auth/server/session";
import {
  getCachedPersonDetail,
  revalidatePeopleListCache,
  revalidatePersonCache,
} from "@/modules/people/server/cached-queries";
import {
  isBuiltinPreferenceCategory,
  parseCategoryRef,
} from "@/modules/people/lib/preference-categories";
import { peopleRepository } from "@/modules/people/server/repository";
import { preferenceCategoryRepository } from "@/modules/people/server/preference-category.repository";
import {
  createPersonNoteSchema,
  createPersonSchema,
  createPreferenceSchema,
  updatePersonSchema,
} from "@/modules/people/schemas/person.schema";
import { runAction } from "@/shared/server/action-utils";
import { revalidatePath } from "next/cache";

function serializePersonDetail(
  person: NonNullable<
    Awaited<ReturnType<typeof getCachedPersonDetail>>
  >,
) {
  return {
    id: person.id,
    name: person.name,
    relationship: person.relationship,
    notes: person.notes,
    preferences: person.preferences.map((preference) => ({
      id: preference.id,
      category: preference.category,
      customCategoryId: preference.customCategoryId ?? null,
      label: preference.label,
      value: preference.value,
    })),
    personNotes: person.personNotes.map((note) => ({
      id: note.id,
      content: note.content,
    })),
  };
}

export async function fetchPersonDetail(personId: string) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const person = await getCachedPersonDetail(personId, profile.id);

    if (!person) {
      throw new Error("Person not found");
    }

    return serializePersonDetail(person);
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

async function resolvePreferenceCategory(
  categoryRef: string,
  userProfileId: string,
) {
  const { category, customCategoryId } = parseCategoryRef(categoryRef);

  if (customCategoryId) {
    const customCategory = await preferenceCategoryRepository.findByIdForProfile(
      customCategoryId,
      userProfileId,
    );

    if (!customCategory) {
      throw new Error("Invalid preference category.");
    }

    return { category, customCategoryId };
  }

  if (!isBuiltinPreferenceCategory(category)) {
    throw new Error("Invalid preference category.");
  }

  return { category, customCategoryId: null };
}

export async function createPreference(input: unknown) {
  return runAction(async () => {
    const data = createPreferenceSchema.parse(input);
    const { profile } = await requireOwnedPerson(data.personId);
    const categoryData = await resolvePreferenceCategory(
      data.categoryRef,
      profile.id,
    );
    const preference = await peopleRepository.createPreference({
      personId: data.personId,
      ...categoryData,
      label: data.label,
      value: data.value,
    });
    invalidatePersonData(data.personId, profile.id);
    revalidatePath("/people");
    revalidatePath(`/people/${data.personId}`);
    return {
      id: preference.id,
      category: preference.category,
      customCategoryId: preference.customCategoryId ?? null,
      label: preference.label,
      value: preference.value,
    };
  });
}

export async function deletePreference(preferenceId: string, personId: string) {
  return runAction(async () => {
    const { profile } = await requireOwnedPerson(personId);
    await peopleRepository.deletePreference(preferenceId, personId);
    invalidatePersonData(personId, profile.id);
    revalidatePath("/people");
    revalidatePath(`/people/${personId}`);
  });
}

export async function createPersonNote(input: unknown) {
  return runAction(async () => {
    const data = createPersonNoteSchema.parse(input);
    const { profile } = await requireOwnedPerson(data.personId);
    const note = await peopleRepository.createNote(data);
    invalidatePersonData(data.personId, profile.id);
    revalidatePath("/people");
    revalidatePath(`/people/${data.personId}`);
    return note;
  });
}

export async function deletePersonNote(noteId: string, personId: string) {
  return runAction(async () => {
    const { profile } = await requireOwnedPerson(personId);
    await peopleRepository.deleteNote(noteId, personId);
    invalidatePersonData(personId, profile.id);
    revalidatePath("/people");
    revalidatePath(`/people/${personId}`);
  });
}
