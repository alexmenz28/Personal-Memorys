"use server";

import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import {
  createPreferenceCategorySchema,
  deletePreferenceCategorySchema,
} from "@/modules/people/schemas/preference-category.schema";
import { preferenceCategoryRepository } from "@/modules/people/server/preference-category.repository";
import { runAction } from "@/shared/server/action-utils";
import { revalidatePath } from "next/cache";

export async function fetchCustomPreferenceCategories() {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    return preferenceCategoryRepository.findManyForProfile(profile.id);
  });
}

export async function createCustomPreferenceCategory(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const data = createPreferenceCategorySchema.parse(input);
    let category;

    try {
      category = await preferenceCategoryRepository.create(
        profile.id,
        data.label,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw new Error("A category with this name already exists.");
      }

      throw error;
    }

    revalidatePath("/settings");
    revalidatePath("/people");

    return category;
  });
}

export async function deleteCustomPreferenceCategory(input: unknown) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const data = deletePreferenceCategorySchema.parse(input);
    await preferenceCategoryRepository.delete(data.id, profile.id);

    revalidatePath("/settings");
    revalidatePath("/people");

    return { id: data.id };
  });
}
