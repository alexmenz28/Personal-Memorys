export function getDateStringInTimezone(
  timezone: string,
  date = new Date(),
): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

export function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function addDaysToDateString(dateString: string, days: number) {
  const date = parseDateOnly(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function coerceToDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

/** Normalizes Date or ISO string (e.g. from unstable_cache) to ISO string. */
export function toIsoString(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

export function formatDateForDisplay(
  date: Date | string,
  locale: string,
  timezone: string,
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(coerceToDate(date));
}
