import "server-only";

import { db } from "@/shared/server/db";
import { parseDateOnly } from "@/shared/lib/dates";

type HolidayRangeInput = {
  countryCode: string;
  regionCode?: string | null;
  startDate: string;
  endDate: string;
};

export const holidaysQueries = {
  findForDateRange({
    countryCode,
    regionCode,
    startDate,
    endDate,
  }: HolidayRangeInput) {
    return db.systemHoliday.findMany({
      where: {
        countryCode,
        regionCode: regionCode ?? "",
        date: {
          gte: parseDateOnly(startDate),
          lte: parseDateOnly(endDate),
        },
      },
      orderBy: { date: "asc" },
    });
  },

  findForDate(
    countryCode: string,
    regionCode: string | null | undefined,
    date: string,
  ) {
    return db.systemHoliday.findMany({
      where: {
        countryCode,
        regionCode: regionCode ?? "",
        date: parseDateOnly(date),
      },
      orderBy: { title: "asc" },
    });
  },
};
