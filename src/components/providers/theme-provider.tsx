"use client";

import { toNextTheme, type ThemePreference } from "@/shared/lib/theme";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  userTheme?: ThemePreference;
};

export function ThemeProvider({ children, userTheme }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={userTheme ? toNextTheme(userTheme) : "light"}
      enableSystem
      disableTransitionOnChange
      storageKey="personal-memories-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
