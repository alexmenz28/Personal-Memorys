"use client";

import { toNextTheme, type ThemePreference } from "@/shared/lib/theme";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

type ThemeSyncProps = {
  theme: ThemePreference;
};

export function ThemeSync({ theme }: ThemeSyncProps) {
  const { setTheme, theme: currentTheme } = useTheme();
  const syncedThemeRef = useRef<ThemePreference | null>(null);

  useEffect(() => {
    if (syncedThemeRef.current === theme) {
      return;
    }

    const nextTheme = toNextTheme(theme);

    if (currentTheme !== nextTheme) {
      setTheme(nextTheme);
    }

    syncedThemeRef.current = theme;
  }, [currentTheme, setTheme, theme]);

  return null;
}
