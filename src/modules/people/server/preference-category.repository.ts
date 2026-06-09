import "server-only";

import { MAX_CUSTOM_PREFERENCE_CATEGORIES } from "@/modules/people/schemas/preference-category.schema";
import { db } from "@/shared/server/db";

export const preferenceCategoryRepository = {
  findManyForProfile(userProfileId: string) {
    return db.userPreferenceCategory.findMany({
      where: { userProfileId },
      orderBy: { label: "asc" },
      select: { id: true, label: true },
    });
  },

  findByIdForProfile(id: string, userProfileId: string) {
    return db.userPreferenceCategory.findFirst({
      where: { id, userProfileId },
      select: { id: true, label: true },
    });
  },

  countForProfile(userProfileId: string) {
    return db.userPreferenceCategory.count({
      where: { userProfileId },
    });
  },

  async create(userProfileId: string, label: string) {
    const count = await this.countForProfile(userProfileId);

    if (count >= MAX_CUSTOM_PREFERENCE_CATEGORIES) {
      throw new Error("Maximum number of custom categories reached.");
    }

    return db.userPreferenceCategory.create({
      data: { userProfileId, label },
      select: { id: true, label: true },
    });
  },

  async delete(id: string, userProfileId: string) {
    const category = await this.findByIdForProfile(id, userProfileId);

    if (!category) {
      throw new Error("Category not found.");
    }

    const [preferenceCount, eventNoteCount] = await Promise.all([
      db.preference.count({
        where: {
          customCategoryId: id,
          person: { userProfileId },
        },
      }),
      db.eventNote.count({
        where: {
          customCategoryId: id,
          event: { userProfileId },
        },
      }),
    ]);

    if (preferenceCount + eventNoteCount > 0) {
      throw new Error("Category is in use and cannot be deleted.");
    }

    return db.userPreferenceCategory.delete({
      where: { id },
      select: { id: true },
    });
  },
};
