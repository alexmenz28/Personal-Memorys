"use client";

import { updateProfileTheme } from "@/lib/actions/profile";
import { fromNextTheme, toNextTheme, type ThemePreference } from "@/lib/theme";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

const options = [
  { value: "LIGHT" as const, icon: Sun, labelKey: "themeLight" },
  { value: "DARK" as const, icon: Moon, labelKey: "themeDark" },
  { value: "SYSTEM" as const, icon: Monitor, labelKey: "themeSystem" },
];

type ThemeSelectorProps = {
  initialTheme: ThemePreference;
};

export function ThemeSelector({ initialTheme }: ThemeSelectorProps) {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const activeTheme =
    theme === "light" || theme === "dark" || theme === "system"
      ? fromNextTheme(theme)
      : initialTheme;

  function handleSelect(nextTheme: ThemePreference) {
    setTheme(toNextTheme(nextTheme));

    startTransition(async () => {
      await updateProfileTheme(nextTheme);
    });
  }

  return (
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
  );
}
