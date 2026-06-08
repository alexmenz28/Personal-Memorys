import type { EventFormValues } from "@/modules/events/components/event-form";

export function toReminderDaysBefore(values: EventFormValues) {
  if (values.isUndated || !values.reminderEnabled) {
    return null;
  }

  const offsets = [...new Set(values.reminderDaysBefore)].sort(
    (left, right) => left - right,
  );

  return offsets.length > 0 ? offsets : null;
}

export function reminderDaysFromEvent(
  reminderDaysBefore: number[] | null | undefined,
): Pick<EventFormValues, "reminderEnabled" | "reminderDaysBefore"> {
  const offsets = reminderDaysBefore ?? [];

  return {
    reminderEnabled: offsets.length > 0,
    reminderDaysBefore: offsets.length > 0 ? offsets : [7],
  };
}
