"use client";

import { updateProfileTheme } from "@/modules/profile/actions/profile.actions";
import {
  fromNextTheme,
  toNextTheme,
  type ThemePreference,
} from "@/lib/theme";
import { useClientMounted } from "@/shared/hooks/use-client-mounted";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useTransition } from "react";

const options = [
  { value: "LIGHT", icon: Sun, labelKey: "themeLight" },
  { value: "DARK", icon: Moon, labelKey: "themeDark" },
  { value: "SYSTEM", icon: Monitor, labelKey: "themeSystem" },
] as const;

const PERSIST_DEBOUNCE_MS = 350;

type ThemeSelectorProps = {
  initialTheme: ThemePreference;
};

function resolveActiveTheme(
  mounted: boolean,
  initialTheme: ThemePreference,
  optimisticTheme: ThemePreference | null,
  theme: string | undefined,
) {
  if (!mounted) {
    return initialTheme;
  }

  if (optimisticTheme) {
    return optimisticTheme;
  }

  if (theme === "light" || theme === "dark" || theme === "system") {
    return fromNextTheme(theme);
  }

  return initialTheme;
}

export function ThemeSelector({ initialTheme }: ThemeSelectorProps) {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const mounted = useClientMounted();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticTheme, setOptimisticTheme] =
    useState<ThemePreference | null>(null);
  const [persistingTheme, setPersistingTheme] =
    useState<ThemePreference | null>(null);
  const latestRequestRef = useRef(0);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPersistThemeRef = useRef<ThemePreference | null>(null);

  useEffect(() => {
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, []);

  const activeTheme = resolveActiveTheme(
    mounted,
    initialTheme,
    optimisticTheme,
    theme,
  );

  function persistTheme(nextTheme: ThemePreference, previousTheme: ThemePreference) {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setPersistingTheme(nextTheme);

    startTransition(async () => {
      const result = await updateProfileTheme(nextTheme);

      if (requestId !== latestRequestRef.current) {
        return;
      }

      setPersistingTheme(null);

      if (!result.ok) {
        setOptimisticTheme(previousTheme);
        setTheme(toNextTheme(previousTheme));
        setError(result.error || t("themeError"));
        return;
      }

      if (pendingPersistThemeRef.current === nextTheme) {
        setOptimisticTheme(null);
        pendingPersistThemeRef.current = null;
      }
    });
  }

  function handleSelect(nextTheme: (typeof options)[number]["value"]) {
    if (nextTheme === activeTheme) {
      return;
    }

    const previousTheme = activeTheme;

    setError(null);
    setOptimisticTheme(nextTheme);
    setTheme(toNextTheme(nextTheme));
    pendingPersistThemeRef.current = nextTheme;

    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(() => {
      persistTheme(nextTheme, previousTheme);
    }, PERSIST_DEBOUNCE_MS);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ value, icon: Icon, labelKey }) => {
          const isActive = activeTheme === value;
          const isSaving = isPending && persistingTheme === value;

          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelect(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "border-primary bg-primary/5 text-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground",
                !mounted && "opacity-90",
              )}
            >
              <Icon className={cn("size-4", isSaving && "animate-pulse")} />
              {t(labelKey)}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
