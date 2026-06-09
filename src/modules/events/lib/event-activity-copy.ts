export type EventActivityTiming = "undated" | "past" | "today" | "future";

export function resolveEventActivityTiming(
  eventDate: string | null | undefined,
  isUndated: boolean,
  today: string,
): EventActivityTiming {
  if (isUndated || !eventDate) {
    return "undated";
  }

  if (eventDate < today) {
    return "past";
  }

  if (eventDate === today) {
    return "today";
  }

  return "future";
}
