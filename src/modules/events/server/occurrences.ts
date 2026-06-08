import "server-only";

import { eventsRepository } from "@/modules/events/server/repository";
import { parseDateOnly, toIsoString } from "@/shared/lib/dates";
import { expandRecurringOccurrences } from "@/shared/lib/recurring-events";

type EventWithPeople = Awaited<
  ReturnType<typeof eventsRepository.findNonRecurringInDateRange>
>[number];

function normalizeForExpansion(event: EventWithPeople) {
  return {
    id: event.id,
    date: event.date ? toIsoString(event.date).slice(0, 10) : null,
    isRecurring: event.isRecurring,
    isUndated: event.isUndated,
  };
}

export async function getEventOccurrencesInRange(
  userProfileId: string,
  startDate: string,
  endDate: string,
) {
  const [fixed, recurring] = await Promise.all([
    eventsRepository.findNonRecurringInDateRange(
      userProfileId,
      startDate,
      endDate,
    ),
    eventsRepository.findRecurringDated(userProfileId),
  ]);

  const catalog = new Map(
    [...fixed, ...recurring].map((event) => [event.id, event]),
  );

  const expanded = expandRecurringOccurrences(
    [...fixed, ...recurring].map((event) => normalizeForExpansion(event)),
    startDate,
    endDate,
  );

  return expanded.map((occurrence) => {
    const source = catalog.get(occurrence.id)!;

    return {
      ...source,
      occurrenceDate: parseDateOnly(occurrence.date),
    };
  });
}
