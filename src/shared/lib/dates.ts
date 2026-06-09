export function getDateStringInTimezone(
  timezone: string,
  date = new Date(),
): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

export function getHourInTimezone(timezone: string, date = new Date()) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    hour12: false,
  }).format(date);

  return Number(hour);
}

export function formatHourLabel(hour: number, locale: string) {
  const date = new Date(Date.UTC(2024, 0, 1, hour, 0, 0));

  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
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

/** Normalizes Date or ISO string to `YYYY-MM-DD`. */
export function toDateOnlyString(value: Date | string) {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
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
