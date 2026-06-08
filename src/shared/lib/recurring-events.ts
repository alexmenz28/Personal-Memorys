/** Annual recurrence helpers (month/day, any year). */

export type RecurringEventLike = {
  id: string;
  date: string | null;
  isRecurring: boolean;
  isUndated: boolean;
};

export function annualOccurrenceDate(storedDate: string, year: number): string {
  const month = Number(storedDate.slice(5, 7));
  const day = Number(storedDate.slice(8, 10));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const safeDay = Math.min(day, lastDay);

  return `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

export function matchesAnnualDate(storedDate: string, targetDate: string) {
  return annualOccurrenceDate(storedDate, Number(targetDate.slice(0, 4))) === targetDate;
}

export function expandRecurringOccurrences<T extends RecurringEventLike>(
  events: T[],
  startDate: string,
  endDate: string,
): Array<T & { date: string }> {
  const startYear = Number(startDate.slice(0, 4));
  const endYear = Number(endDate.slice(0, 4));
  const occurrences: Array<T & { date: string }> = [];

  for (const event of events) {
    if (event.isUndated || !event.date) {
      continue;
    }

    if (!event.isRecurring) {
      if (event.date >= startDate && event.date <= endDate) {
        occurrences.push({ ...event, date: event.date });
      }
      continue;
    }

    for (let year = startYear; year <= endYear; year += 1) {
      const occurrenceDate = annualOccurrenceDate(event.date, year);

      if (occurrenceDate >= startDate && occurrenceDate <= endDate) {
        occurrences.push({ ...event, date: occurrenceDate });
      }
    }
  }

  return occurrences.sort((left, right) => {
    const byDate = left.date.localeCompare(right.date);
    return byDate !== 0 ? byDate : left.id.localeCompare(right.id);
  });
}

export function calendarItemIdForEvent(eventId: string, occurrenceDate: string) {
  return `event-${eventId}--${occurrenceDate}`;
}
