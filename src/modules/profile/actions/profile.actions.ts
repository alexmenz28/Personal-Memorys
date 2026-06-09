"use server";

import { revalidateUserProfileCache } from "@/modules/auth/server/cached-profile";
import {
  requireCurrentUserProfile,
  resolveUserProfile,
} from "@/modules/auth/server/session";
import { profileService } from "@/modules/profile/server/service";
import type { UpdateProfileInput } from "@/modules/profile/schemas/profile.schema";
import type { ThemePreference } from "@/shared/lib/theme";
import { runAction } from "@/shared/server/action-utils";
import { revalidatePath, updateTag } from "next/cache";

export async function completeOnboarding(input: UpdateProfileInput) {
  return runAction(async () => {
    const profile = await resolveUserProfile();

    if (!profile) {
      throw new Error("User profile not found");
    }

    await profileService.completeOnboarding(profile.id, input);
    revalidateUserProfileCache(profile.clerkUserId);
    updateTag(`holidays-${input.countryCode}`);
    revalidatePath("/today");
  });
}

export async function updateProfileSettings(input: UpdateProfileInput) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    const previousCountryCode = profile.countryCode;
    const previousLocale = profile.locale;
    const previousTimezone = profile.timezone;

    await profileService.updateSettings(
      profile.id,
      input,
      previousCountryCode,
    );

    revalidateUserProfileCache(profile.clerkUserId);

    if (input.countryCode !== previousCountryCode) {
      updateTag(`holidays-${input.countryCode}`);
      revalidatePath("/today");
      revalidatePath("/upcoming");
    } else if (input.timezone !== previousTimezone) {
      revalidatePath("/today");
      revalidatePath("/upcoming");
    }

    return {
      localeChanged: input.locale !== previousLocale,
    };
  });
}

export async function updateProfileTheme(theme: ThemePreference) {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    await profileService.updateTheme(profile.id, theme);
    revalidateUserProfileCache(profile.clerkUserId);
  });
}

export async function deleteAccount() {
  return runAction(async () => {
    const profile = await requireCurrentUserProfile();
    await profileService.deleteAccount(profile.id, profile.clerkUserId);
    revalidateUserProfileCache(profile.clerkUserId);
  });
}
