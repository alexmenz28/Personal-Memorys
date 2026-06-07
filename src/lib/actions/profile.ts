"use server";

import {
  getCurrentUserProfile,
  requireCurrentUserProfile,
  syncUserProfileFromClerk,
} from "@/lib/auth";
import { syncHolidaysForCountry } from "@/lib/holidays/sync";
import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import {
  onboardingSchema,
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/profile";
import { cookies } from "next/headers";
import type { ThemePreference } from "@/lib/theme";
import { revalidatePath } from "next/cache";

async function persistLocaleCookie(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}

async function resolveUserProfile() {
  return (
    (await getCurrentUserProfile()) ?? (await syncUserProfileFromClerk())
  );
}

export async function completeOnboarding(input: UpdateProfileInput) {
  const profile = await resolveUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }
  const data = onboardingSchema.parse(input);

  await db.userProfile.update({
    where: { id: profile.id },
    data: {
      ...data,
      onboardingCompleted: true,
    },
  });

  await persistLocaleCookie(data.locale);

  const currentYear = new Date().getFullYear();
  await syncHolidaysForCountry({
    countryCode: data.countryCode,
    regionCode: data.regionCode,
    years: [currentYear, currentYear + 1],
  });

  if (process.env.INNGEST_EVENT_KEY) {
    await inngest.send({
      name: "holidays/sync.requested",
      data: {
        countryCode: data.countryCode,
        regionCode: data.regionCode,
      },
    });
  }

  revalidatePath("/today");
}

export async function updateProfileSettings(input: UpdateProfileInput) {
  const profile = await requireCurrentUserProfile();
  const data = updateProfileSchema.parse(input);

  await db.userProfile.update({
    where: { id: profile.id },
    data,
  });

  await persistLocaleCookie(data.locale);

  if (data.countryCode !== profile.countryCode) {
    const currentYear = new Date().getFullYear();
    await syncHolidaysForCountry({
      countryCode: data.countryCode,
      regionCode: data.regionCode,
      years: [currentYear, currentYear + 1],
    });
  }

  revalidatePath("/settings");
  revalidatePath("/today");
}

export async function updateProfileTheme(theme: ThemePreference) {
  const profile = await requireCurrentUserProfile();

  await db.userProfile.update({
    where: { id: profile.id },
    data: { theme },
  });

  revalidatePath("/settings");
}
