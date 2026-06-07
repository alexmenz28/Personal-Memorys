import "server-only";

import { holidaysQueries } from "@/modules/holidays/server/queries";
import { unstable_cache } from "next/cache";

export function getCachedHolidaysForDate(
  countryCode: string,
  regionCode: string | null | undefined,
  date: string,
) {
  const region = regionCode ?? "";

  return unstable_cache(
    async () => holidaysQueries.findForDate(countryCode, region, date),
    ["holidays-date", countryCode, region, date],
    { revalidate: 3600, tags: [`holidays-${countryCode}`] },
  )();
}

export function getCachedHolidaysForDateRange(input: {
  countryCode: string;
  regionCode?: string | null;
  startDate: string;
  endDate: string;
}) {
  const region = input.regionCode ?? "";

  return unstable_cache(
    async () => holidaysQueries.findForDateRange(input),
    [
      "holidays-range",
      input.countryCode,
      region,
      input.startDate,
      input.endDate,
    ],
    { revalidate: 3600, tags: [`holidays-${input.countryCode}`] },
  )();
}
