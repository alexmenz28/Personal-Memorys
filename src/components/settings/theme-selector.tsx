"use client";

import { updateProfileTheme } from "@/modules/profile/actions/profile.actions";
import {
  fromNextTheme,
  toNextTheme,
  type ThemePreference,
} from "@/shared/lib/theme";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const options = [
  { value: "LIGHT", icon: Sun, labelKey: "themeLight" },
  { value: "DARK", icon: Moon, labelKey: "themeDark" },
  { value: "SYSTEM", icon: Monitor, labelKey: "themeSystem" },
] as const;

type ThemeSelectorProps = {
  initialTheme: ThemePreference;
};

export function ThemeSelector({ initialTheme }: ThemeSelectorProps) {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activeTheme =
    theme === "light" || theme === "dark" || theme === "system"
      ? fromNextTheme(theme)
      : initialTheme;

  function handleSelect(nextTheme: (typeof options)[number]["value"]) {
    const previousTheme = activeTheme;
    setError(null);
    setTheme(toNextTheme(nextTheme));

    startTransition(async () => {
      const result = await updateProfileTheme(nextTheme);

      if (!result.ok) {
        setTheme(toNextTheme(previousTheme));
        setError(result.error || t("themeError"));
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ value, icon: Icon, labelKey }) => {
          const isActive = activeTheme === value;

          return (
            <button
              key={value}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-primary bg-primary/5 text-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t(labelKey)}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
