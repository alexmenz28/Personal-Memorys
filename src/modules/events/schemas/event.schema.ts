import { REMINDER_DAY_OPTIONS } from "@/modules/reminders/schemas/reminder.schema";
import { z } from "zod";

const reminderDayOptionSchema = z
  .number()
  .int()
  .refine(
    (value) =>
      REMINDER_DAY_OPTIONS.includes(
        value as (typeof REMINDER_DAY_OPTIONS)[number],
      ),
    "Invalid reminder offset",
  );

const reminderDaysBeforeSchema = z
  .array(reminderDayOptionSchema)
  .max(REMINDER_DAY_OPTIONS.length)
  .nullable()
  .optional();

const datedEventRules = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  date: z.string().date().optional(),
  isRecurring: z.boolean().default(false),
  isUndated: z.boolean().default(false),
  personIds: z.array(z.string()).optional(),
  reminderDaysBefore: reminderDaysBeforeSchema,
});

export const createEventSchema = datedEventRules
  .refine(
    (data) => data.isUndated || Boolean(data.date),
    "Dated events require a date",
  )
  .refine(
    (data) => !data.isRecurring || Boolean(data.date),
    "Recurring events require a date",
  )
  .refine(
    (data) => !data.isRecurring || !data.isUndated,
    "Recurring events cannot be undated",
  )
  .refine(
    (data) =>
      data.isUndated ? !(data.reminderDaysBefore?.length ?? 0) : true,
    "Undated events cannot have reminders",
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = datedEventRules
  .extend({
    id: z.string().min(1),
  })
  .refine(
    (data) => data.isUndated || Boolean(data.date),
    "Dated events require a date",
  )
  .refine(
    (data) => !data.isRecurring || Boolean(data.date),
    "Recurring events require a date",
  )
  .refine(
    (data) => !data.isRecurring || !data.isUndated,
    "Recurring events cannot be undated",
  )
  .refine(
    (data) =>
      data.isUndated ? !(data.reminderDaysBefore?.length ?? 0) : true,
    "Undated events cannot have reminders",
  );

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const deleteEventSchema = z.object({
  id: z.string().min(1),
});
