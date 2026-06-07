import { syncHolidaysForCountry } from "@/modules/holidays/server/sync";
import { inngest } from "@/modules/jobs/inngest/client";

export const syncUserHolidays = inngest.createFunction(
  {
    id: "sync-user-holidays",
    triggers: [{ event: "holidays/sync.requested" }],
  },
  async ({ event }) => {
    const currentYear = new Date().getFullYear();

    await syncHolidaysForCountry({
      countryCode: event.data.countryCode,
      regionCode: event.data.regionCode,
      years: [currentYear, currentYear + 1],
    });
  },
);

export const sendDailyReminders = inngest.createFunction(
  {
    id: "send-daily-reminders",
    triggers: [{ cron: "0 8 * * *" }],
  },
  async () => {
    return { sent: 0 };
  },
);

export const inngestFunctions = [syncUserHolidays, sendDailyReminders];
