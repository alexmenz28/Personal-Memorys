"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import type { ThemePreference } from "@/lib/theme";
import { clerkAppearance } from "@/shared/lib/clerk-appearance";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
  timeZone: string;
  userTheme?: ThemePreference;
};

export function AppProviders({
  children,
  locale,
  messages,
  timeZone,
  userTheme,
}: AppProvidersProps) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/auth/continue"
      signUpFallbackRedirectUrl="/auth/continue"
      appearance={clerkAppearance}
    >
      <ThemeProvider userTheme={userTheme}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone={timeZone}
        >
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
