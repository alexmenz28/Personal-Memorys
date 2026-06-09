import "server-only";

import { remindersRepository } from "@/modules/reminders/server/repository";
import { sendReminderEmail } from "@/modules/reminders/server/email.service";
import {
  addDaysToDateString,
  getDateStringInTimezone,
  getHourInTimezone,
  toIsoString,
} from "@/shared/lib/dates";
import { matchesAnnualDate } from "@/shared/lib/recurring-events";

type ProcessDailyRemindersOptions = {
  /** Dev/manual runs skip the user's preferred send hour. */
  ignoreHour?: boolean;
};

function eventMatchesOccurrence(
  event: {
    date: Date | null;
    isRecurring: boolean;
    isUndated: boolean;
  },
  occurrenceDate: string,
) {
  if (event.isUndated || !event.date) {
    return false;
  }

  const storedDate = toIsoString(event.date).slice(0, 10);

  if (event.isRecurring) {
    return matchesAnnualDate(storedDate, occurrenceDate);
  }

  return storedDate === occurrenceDate;
}

function isWithinReminderWindow(
  timezone: string,
  reminderHour: number,
  ignoreHour: boolean,
) {
  if (ignoreHour) {
    return true;
  }

  return getHourInTimezone(timezone) === reminderHour;
}

export async function processDailyReminders(
  options: ProcessDailyRemindersOptions = {},
) {
  const reminders = await remindersRepository.findActiveEmailRemindersForDelivery();
  let sent = 0;
  let skipped = 0;

  for (const reminder of reminders) {
    const profile = reminder.event.userProfile;

    if (
      !isWithinReminderWindow(
        profile.timezone,
        profile.reminderHour,
        options.ignoreHour ?? false,
      )
    ) {
      skipped += 1;
      continue;
    }

    const today = getDateStringInTimezone(profile.timezone);
    const occurrenceDate = addDaysToDateString(today, reminder.daysBefore);

    if (!eventMatchesOccurrence(reminder.event, occurrenceDate)) {
      skipped += 1;
      continue;
    }

    const alreadySent = await remindersRepository.hasDelivery(
      reminder.id,
      occurrenceDate,
    );

    if (alreadySent) {
      skipped += 1;
      continue;
    }

    const result = await sendReminderEmail({
      to: profile.email,
      locale: profile.locale,
      timezone: profile.timezone,
      eventTitle: reminder.event.title,
      occurrenceDate,
      daysBefore: reminder.daysBefore,
      peopleNames: reminder.event.eventPeople.map(({ person }) => person.name),
    });

    if (result.sent) {
      await remindersRepository.recordDelivery(reminder.id, occurrenceDate);
      sent += 1;
    } else {
      skipped += 1;
    }
  }

  return { sent, skipped, checked: reminders.length };
}
