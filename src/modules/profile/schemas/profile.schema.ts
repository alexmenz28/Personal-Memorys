import { z } from "zod";
import { locales } from "@/i18n/config";
import { themePreferences } from "@/shared/lib/theme";

export const REMINDER_HOUR_OPTIONS = [
  5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
] as const;

export const updateProfileSchema = z.object({
  locale: z.enum(locales),
  timezone: z.string().min(1),
  countryCode: z.string().length(2),
  regionCode: z.string().optional(),
  theme: z.enum(themePreferences).optional(),
  reminderHour: z
    .number()
    .int()
    .refine(
      (value) =>
        REMINDER_HOUR_OPTIONS.includes(
          value as (typeof REMINDER_HOUR_OPTIONS)[number],
        ),
      "Invalid reminder hour",
    )
    .optional(),
});

export const onboardingSchema = updateProfileSchema;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
