import "server-only";

import { db } from "@/shared/server/db";
import type { ThemePreference } from "@/shared/lib/theme";
import { ThemePreference as PrismaThemePreference } from "@/generated/prisma/client";

const profileInclude = { subscription: true } as const;

export const profileRepository = {
  findByAuthUserId(authUserId: string) {
    return db.userProfile.findUnique({
      where: { authUserId },
      include: profileInclude,
    });
  },

  upsertFromAuth(input: { authUserId: string; email: string }) {
    return db.userProfile.upsert({
      where: { authUserId: input.authUserId },
      update: { email: input.email },
      create: {
        authUserId: input.authUserId,
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
