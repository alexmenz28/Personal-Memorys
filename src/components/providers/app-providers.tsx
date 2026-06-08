"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import type { ThemePreference } from "@/shared/lib/theme";

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
      signInFallbackRedirectUrl="/auth/continue"
      signUpFallbackRedirectUrl="/auth/continue"
    >
      <ThemeProvider userTheme={userTheme}>
        <QueryClientProvider client={queryClient}>
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone={timeZone}
          >
            {children}
          </NextIntlClientProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
