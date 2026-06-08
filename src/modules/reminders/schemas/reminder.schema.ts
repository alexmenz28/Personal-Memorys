import { z } from "zod";

export const REMINDER_DAY_OPTIONS = [0, 1, 3, 7, 14, 30] as const;

export type ReminderDayOption = (typeof REMINDER_DAY_OPTIONS)[number];

export const reminderDaysBeforeSchema = z
  .number()
  .int()
  .min(0)
  .max(60)
  .nullable()
  .optional();
