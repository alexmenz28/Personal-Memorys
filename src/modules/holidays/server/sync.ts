import "server-only";

import Holidays from "date-holidays";
import { db } from "@/shared/server/db";

type SyncHolidaysInput = {
  countryCode: string;
  regionCode?: string;
  years: number[];
};

function buildHolidayKey(name: string, date: string) {
  return `${date}:${name.toLowerCase().replace(/\s+/g, "-")}`;
}

function normalizeRegionCode(regionCode?: string) {
  return regionCode ?? "";
}

export async function syncHolidaysForCountry({
  countryCode,
  regionCode,
  years,
}: SyncHolidaysInput) {
  const normalizedRegionCode = normalizeRegionCode(regionCode);
  const hd = normalizedRegionCode
    ? new Holidays(countryCode, normalizedRegionCode)
    : new Holidays(countryCode);
  const now = new Date();

  for (const year of years) {
    const holidays = hd.getHolidays(year);

    for (const holiday of holidays) {
      const date = holiday.date.slice(0, 10);
      const holidayKey = buildHolidayKey(holiday.name, date);

      await db.systemHoliday.upsert({
        where: {
          countryCode_regionCode_year_holidayKey: {
            countryCode,
            regionCode: normalizedRegionCode,
            year,
            holidayKey,
          },
        },
        update: {
          title: holiday.name,
          date: new Date(`${date}T00:00:00.000Z`),
          isMovable: holiday.type === "public",
          lastSyncedAt: now,
        },
        create: {
          countryCode,
          regionCode: normalizedRegionCode,
          year,
          holidayKey,
          title: holiday.name,
          date: new Date(`${date}T00:00:00.000Z`),
          isMovable: holiday.type === "public",
          lastSyncedAt: now,
        },
      });
    }
  }
}
