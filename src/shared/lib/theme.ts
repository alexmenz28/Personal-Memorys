export const themePreferences = ["LIGHT", "DARK", "SYSTEM"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export type NextTheme = "light" | "dark" | "system";

export function toNextTheme(theme: ThemePreference): NextTheme {
  switch (theme) {
    case "LIGHT":
      return "light";
    case "DARK":
      return "dark";
    case "SYSTEM":
      return "system";
  }
}

export function fromNextTheme(theme: string): ThemePreference {
  switch (theme) {
    case "dark":
      return "DARK";
    case "system":
      return "SYSTEM";
    default:
      return "LIGHT";
  }
}

export function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}
