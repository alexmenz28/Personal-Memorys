import { z } from "zod";

export const MAX_CUSTOM_PREFERENCE_CATEGORIES = 20;

export const createPreferenceCategorySchema = z.object({
  label: z.string().trim().min(1).max(60),
});

export const deletePreferenceCategorySchema = z.object({
  id: z.string().min(1),
});

export type CreatePreferenceCategoryInput = z.infer<
  typeof createPreferenceCategorySchema
>;
