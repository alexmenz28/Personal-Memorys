import {
  BUILTIN_PREFERENCE_CATEGORIES,
  CUSTOM_CATEGORY_PREFIX,
  isBuiltinPreferenceCategory,
} from "@/modules/people/lib/preference-categories";
import { z } from "zod";

export const relationshipTypes = [
  "PARTNER",
  "FAMILY",
  "FRIEND",
  "COLLEAGUE",
  "OTHER",
] as const;

export const preferenceCategories = BUILTIN_PREFERENCE_CATEGORIES;

const preferenceCategoryRefSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      isBuiltinPreferenceCategory(value) ||
      value.startsWith(CUSTOM_CATEGORY_PREFIX),
    { message: "Invalid preference category" },
  );

export const createPersonSchema = z.object({
  name: z.string().min(1).max(120),
  relationship: z.enum(relationshipTypes).default("OTHER"),
  notes: z.string().max(2000).optional(),
});

export const updatePersonSchema = createPersonSchema;

export const createPreferenceSchema = z.object({
  personId: z.string().min(1),
  categoryRef: preferenceCategoryRefSchema,
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(500),
});

export const createPersonNoteSchema = z.object({
  personId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
export type CreatePreferenceInput = z.infer<typeof createPreferenceSchema>;
export type CreatePersonNoteInput = z.infer<typeof createPersonNoteSchema>;
