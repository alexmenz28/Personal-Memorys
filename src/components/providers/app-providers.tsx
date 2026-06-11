"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import type { ThemePreference } from "@/lib/theme";

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
    <ThemeProvider userTheme={userTheme}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={timeZone}
      >
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
