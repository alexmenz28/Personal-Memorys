import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    date: z.string().date().optional(),
    isRecurring: z.boolean().default(false),
    isUndated: z.boolean().default(false),
    personIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => data.isUndated || Boolean(data.date),
    "Dated events require a date",
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    date: z.string().date().optional(),
    isRecurring: z.boolean().default(false),
    isUndated: z.boolean().default(false),
    personIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => data.isUndated || Boolean(data.date),
    "Dated events require a date",
  );

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const deleteEventSchema = z.object({
  id: z.string().min(1),
});
