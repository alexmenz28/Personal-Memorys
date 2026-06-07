"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import type { ThemePreference } from "@/lib/theme";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
  userTheme?: ThemePreference;
};

export function AppProviders({
  children,
  locale,
  messages,
  userTheme,
}: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
    >
      <ThemeProvider userTheme={userTheme}>
        <QueryClientProvider client={queryClient}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
