import { z } from "zod";

export const createEventNoteSchema = z.object({
  eventId: z.string().min(1),
  personId: z.string().min(1),
  category: z.string().min(1),
  customCategoryId: z.string().min(1).nullable().optional(),
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(500),
});

export const createEventNoteFromPreferenceSchema = z.object({
  eventId: z.string().min(1),
  personId: z.string().min(1),
  preferenceId: z.string().min(1),
});

export type CreateEventNoteInput = z.infer<typeof createEventNoteSchema>;
export type CreateEventNoteFromPreferenceInput = z.infer<
  typeof createEventNoteFromPreferenceSchema
>;
