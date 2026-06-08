import type { EventFormValues } from "@/modules/events/components/event-form";

export function toReminderDaysBefore(values: EventFormValues) {
  if (values.isUndated || !values.reminderEnabled) {
    return null;
  }

  return values.reminderDaysBefore;
}

export function reminderDaysFromEvent(
  reminderDaysBefore: number | null | undefined,
): Pick<EventFormValues, "reminderEnabled" | "reminderDaysBefore"> {
  return {
    reminderEnabled: reminderDaysBefore != null,
    reminderDaysBefore: reminderDaysBefore ?? 7,
  };
}
