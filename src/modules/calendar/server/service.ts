import "server-only";

import {
  getCachedEventsForDateRange,
} from "@/modules/events/server/cached-queries";
import {
  getCachedHolidaysForDate,
  getCachedHolidaysForDateRange,
} from "@/modules/holidays/server/cached-queries";
import {
  addDaysToDateString,
  getDateStringInTimezone,
} from "@/shared/lib/dates";

type ProfileContext = {
  id: string;
  countryCode: string;
  regionCode: string | null;
  timezone: string;
  locale: string;
};

export const calendarService = {
  async getToday(profile: ProfileContext) {
    const today = getDateStringInTimezone(profile.timezone);

    const [holidays, events] = await Promise.all([
      getCachedHolidaysForDate(
        profile.countryCode,
        profile.regionCode,
        today,
      ),
      getCachedEventsForDateRange(profile.id, today, today),
    ]);

    return { today, holidays, events };
  },

  async getUpcoming(profile: ProfileContext, days = 30) {
    const startDate = getDateStringInTimezone(profile.timezone);
    const endDate = addDaysToDateString(startDate, days);

    const [holidays, events] = await Promise.all([
      getCachedHolidaysForDateRange({
        countryCode: profile.countryCode,
        regionCode: profile.regionCode,
        startDate,
        endDate,
      }),
      getCachedEventsForDateRange(profile.id, startDate, endDate),
    ]);

    return { startDate, endDate, holidays, events };
  },
};
