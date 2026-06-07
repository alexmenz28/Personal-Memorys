"use client";

import { toNextTheme, type ThemePreference } from "@/shared/lib/theme";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

type ThemeSyncProps = {
  theme: ThemePreference;
};

export function ThemeSync({ theme }: ThemeSyncProps) {
  const { setTheme } = useTheme();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) {
      return;
    }

    hasSynced.current = true;
    setTheme(toNextTheme(theme));
  }, [theme, setTheme]);

  return null;
}
