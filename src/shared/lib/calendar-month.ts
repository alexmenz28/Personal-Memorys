export type MonthRef = {
  year: number;
  month: number;
};

export function dateToString(date: Date | string): string {
  if (typeof date === "string") {
    return date.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function parseMonthRef(dateString: string): MonthRef {
  const [year, month] = dateString.split("-").map(Number);
  return { year, month: month - 1 };
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const date = new Date(Date.UTC(year, month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

export function getMonthLabel({ year, month }: MonthRef, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
}

export function getWeekdayLabels(locale: string) {
  const monday = new Date(Date.UTC(2024, 0, 1));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      timeZone: "UTC",
    }).format(date);
  });
}

export function getMonthOptions(locale: string) {
  return Array.from({ length: 12 }, (_, month) => ({
    value: month,
    label: new Intl.DateTimeFormat(locale, {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, month, 1))),
  }));
}

export function getYearOptions(minYear: number, maxYear: number) {
  return Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);
}

export function getYearBoundsFromDates(
  dates: string[],
  today: string,
  paddingYears = 2,
) {
  const currentYear = Number(today.slice(0, 4));
  const years = dates.map((date) => Number(date.slice(0, 4)));

  if (years.length === 0) {
    return {
      minYear: currentYear - paddingYears,
      maxYear: currentYear + paddingYears,
    };
  }

  return {
    minYear: Math.min(currentYear - paddingYears, ...years),
    maxYear: Math.max(currentYear + paddingYears, ...years),
  };
}

export function buildMonthGrid({ year, month }: MonthRef): Array<string | null> {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;

  const cells: Array<string | null> = [];

  for (let index = 0; index < mondayOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const monthString = String(month + 1).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");
    cells.push(`${year}-${monthString}-${dayString}`);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}
