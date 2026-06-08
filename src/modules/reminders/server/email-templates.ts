import "server-only";

import { formatDateForDisplay } from "@/shared/lib/dates";

type ReminderEmailContent = {
  locale: string;
  timezone: string;
  eventTitle: string;
  occurrenceDate: string;
  daysBefore: number;
  peopleNames: string[];
};

type LocaleCopy = {
  subject: (title: string) => string;
  greeting: string;
  intro: (daysBefore: number, eventDate: string) => string;
  peopleLabel: string;
  footer: string;
  daysLabel: (days: number) => string;
};

const copy: Record<string, LocaleCopy> = {
  en: {
    subject: (title) => `Reminder: ${title}`,
    greeting: "Hi,",
    intro: (daysBefore, eventDate) =>
      daysBefore === 0
        ? `Your event is today (${eventDate}).`
        : `Your event is in ${daysBefore} day${daysBefore === 1 ? "" : "s"} (${eventDate}).`,
    peopleLabel: "Linked people",
    footer: "Personal Memories — remember what matters.",
    daysLabel: (days) =>
      days === 0 ? "On the day" : `${days} day${days === 1 ? "" : "s"} before`,
  },
  es: {
    subject: (title) => `Recordatorio: ${title}`,
    greeting: "Hola,",
    intro: (daysBefore, eventDate) =>
      daysBefore === 0
        ? `Tu evento es hoy (${eventDate}).`
        : `Tu evento es en ${daysBefore} día${daysBefore === 1 ? "" : "s"} (${eventDate}).`,
    peopleLabel: "Personas vinculadas",
    footer: "Memorias Personales — recuerda lo que importa.",
    daysLabel: (days) =>
      days === 0 ? "El mismo día" : `${days} día${days === 1 ? "" : "s"} antes`,
  },
};

function resolveLocale(locale: string) {
  return locale.startsWith("es") ? "es" : "en";
}

export function buildReminderEmail({
  locale,
  timezone,
  eventTitle,
  occurrenceDate,
  daysBefore,
  peopleNames,
}: ReminderEmailContent) {
  const resolvedLocale = resolveLocale(locale);
  const strings = copy[resolvedLocale];
  const formattedDate = formatDateForDisplay(
    occurrenceDate,
    resolvedLocale,
    timezone,
  );

  const peopleSection =
    peopleNames.length > 0
      ? `<p style="margin:16px 0 4px;font-size:14px;color:#6b7280;">${strings.peopleLabel}</p>
         <p style="margin:0;font-size:15px;">${peopleNames.join(", ")}</p>`
      : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#111827;">
      <p style="font-size:15px;">${strings.greeting}</p>
      <h1 style="font-size:20px;font-weight:600;margin:16px 0 8px;">${eventTitle}</h1>
      <p style="font-size:15px;line-height:1.5;color:#374151;">
        ${strings.intro(daysBefore, formattedDate)}
      </p>
      ${peopleSection}
      <p style="margin-top:24px;font-size:12px;color:#9ca3af;">${strings.footer}</p>
    </div>
  `.trim();

  return {
    subject: strings.subject(eventTitle),
    html,
  };
}
