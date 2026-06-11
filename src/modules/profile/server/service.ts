import "server-only";

import { auth } from "@/modules/auth/server/auth";
import { persistLocaleCookie } from "@/modules/profile/server/locale-cookie";
import { cookies, headers } from "next/headers";
import { syncHolidaysForCountry } from "@/modules/holidays/server/sync";
import { inngest } from "@/modules/jobs/inngest/client";
import { profileRepository } from "@/modules/profile/server/repository";
import {
  onboardingSchema,
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/modules/profile/schemas/profile.schema";
import type { ThemePreference } from "@/shared/lib/theme";
import { db } from "@/shared/server/db";

async function syncHolidaysIfNeeded(
  countryCode: string,
  regionCode: string | undefined,
  previousCountryCode?: string,
) {
  if (previousCountryCode && countryCode === previousCountryCode) {
    return;
  }

  const currentYear = new Date().getFullYear();
  await syncHolidaysForCountry({
    countryCode,
    regionCode,
    years: [currentYear, currentYear + 1],
  });

  if (process.env.INNGEST_EVENT_KEY) {
    await inngest.send({
      name: "holidays/sync.requested",
      data: { countryCode, regionCode },
    });
  }
}

export const profileService = {
  async completeOnboarding(profileId: string, input: UpdateProfileInput) {
    const data = onboardingSchema.parse(input);

    await profileRepository.update(profileId, {
      ...data,
      onboardingCompleted: true,
    });

    await persistLocaleCookie(data.locale);
    await syncHolidaysIfNeeded(data.countryCode, data.regionCode);
  },

  async updateSettings(
    profileId: string,
    input: UpdateProfileInput,
    previousCountryCode: string,
  ) {
    const data = updateProfileSchema.parse(input);

    await profileRepository.update(profileId, data);
    await persistLocaleCookie(data.locale);
    await syncHolidaysIfNeeded(
      data.countryCode,
      data.regionCode,
      previousCountryCode,
    );
  },

  async updateTheme(profileId: string, theme: ThemePreference) {
    await profileRepository.update(profileId, { theme });
  },

  async deleteAccount(profileId: string, authUserId: string) {
    await profileRepository.deleteById(profileId);

    const cookieStore = await cookies();
    cookieStore.delete("locale");

    await db.user.delete({
      where: { id: authUserId },
    });

    await auth.api.signOut({
      headers: await headers(),
    });
  },
};
