import "server-only";

import { db } from "@/shared/server/db";
import type { ThemePreference } from "@/shared/lib/theme";
import { ThemePreference as PrismaThemePreference } from "@/generated/prisma/client";

const profileInclude = { subscription: true } as const;

export const profileRepository = {
  findByClerkUserId(clerkUserId: string) {
    return db.userProfile.findUnique({
      where: { clerkUserId },
      include: profileInclude,
    });
  },

  upsertFromClerk(input: { clerkUserId: string; email: string }) {
    return db.userProfile.upsert({
      where: { clerkUserId: input.clerkUserId },
      update: { email: input.email },
      create: {
        clerkUserId: input.clerkUserId,
        email: input.email,
        countryCode: "US",
        subscription: { create: {} },
      },
      include: profileInclude,
    });
  },

  deleteById(id: string) {
    return db.userProfile.delete({
      where: { id },
    });
  },

  update(
    id: string,
    data: {
      locale?: string;
      timezone?: string;
      countryCode?: string;
      regionCode?: string | null;
      theme?: ThemePreference;
      reminderHour?: number;
      onboardingCompleted?: boolean;
    },
  ) {
    const { theme, ...rest } = data;

    return db.userProfile.update({
      where: { id },
      data: {
        ...rest,
        ...(theme ? { theme: theme as PrismaThemePreference } : {}),
      },
      include: profileInclude,
    });
  },
};
