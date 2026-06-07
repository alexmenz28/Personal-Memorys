import { z } from "zod";
import { locales } from "@/i18n/config";
import { themePreferences } from "@/shared/lib/theme";

export const updateProfileSchema = z.object({
  locale: z.enum(locales),
  timezone: z.string().min(1),
  countryCode: z.string().length(2),
  regionCode: z.string().optional(),
  theme: z.enum(themePreferences).optional(),
});

export const onboardingSchema = updateProfileSchema;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
