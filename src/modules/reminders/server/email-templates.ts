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
  appName: string;
  subject: (title: string) => string;
  preheader: (title: string, daysBefore: number) => string;
  greeting: string;
  headline: (daysBefore: number) => string;
  body: (eventDate: string) => string;
  dateLabel: string;
  timingLabel: (daysBefore: number) => string;
  peopleLabel: string;
  cta: string;
  footer: string;
};

const copy: Record<string, LocaleCopy> = {
  en: {
    appName: "Personal Memories",
    subject: (title) => `Reminder · ${title}`,
    preheader: (title, daysBefore) =>
      daysBefore === 0
        ? `${title} is today.`
        : `${title} is coming up in ${daysBefore} day${daysBefore === 1 ? "" : "s"}.`,
    greeting: "Hi there,",
    headline: (daysBefore) =>
      daysBefore === 0
        ? "Your event is today"
        : daysBefore === 1
          ? "Your event is tomorrow"
          : `Your event is in ${daysBefore} days`,
    body: (eventDate) =>
      `This is a friendly reminder so you have time to prepare.`,
    dateLabel: "Event date",
    timingLabel: (days) =>
      days === 0 ? "On the day" : `${days} day${days === 1 ? "" : "s"} before`,
    peopleLabel: "Linked people",
    cta: "Open Personal Memories",
    footer: "You received this email because you enabled reminders for this event.",
  },
  es: {
    appName: "Memorias Personales",
    subject: (title) => `Recordatorio · ${title}`,
    preheader: (title, daysBefore) =>
      daysBefore === 0
        ? `${title} es hoy.`
        : `${title} se acerca en ${daysBefore} día${daysBefore === 1 ? "" : "s"}.`,
    greeting: "Hola,",
    headline: (daysBefore) =>
      daysBefore === 0
        ? "Tu evento es hoy"
        : daysBefore === 1
          ? "Tu evento es mañana"
          : `Tu evento es en ${daysBefore} días`,
    body: () =>
      "Te enviamos este recordatorio con anticipación para que puedas prepararte.",
    dateLabel: "Fecha del evento",
    timingLabel: (days) =>
      days === 0 ? "El mismo día" : `${days} día${days === 1 ? "" : "s"} antes`,
    peopleLabel: "Personas vinculadas",
    cta: "Abrir Memorias Personales",
    footer:
      "Recibiste este correo porque activaste recordatorios para este evento.",
  },
};

function resolveLocale(locale: string) {
  return locale.startsWith("es") ? "es" : "en";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getAppUrl() {
  const configured = process.env.APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();

  if (vercel) {
    return `https://${vercel}`;
  }

  return "http://localhost:3000";
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
  const safeTitle = escapeHtml(eventTitle);
  const appUrl = getAppUrl();
  const preheader = strings.preheader(eventTitle, daysBefore);

  const peopleSection =
    peopleNames.length > 0
      ? `
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">
              ${strings.peopleLabel}
            </p>
            <p style="margin:0;font-size:15px;line-height:1.6;color:#111827;">
              ${peopleNames.map((name) => escapeHtml(name)).join(", ")}
            </p>
          </td>
        </tr>`
      : "";

  const html = `
<!DOCTYPE html>
<html lang="${resolvedLocale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(strings.subject(eventTitle))}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 20px;background:linear-gradient(180deg,#fafafa 0%,#ffffff 100%);border-bottom:1px solid #f3f4f6;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">
                  ${strings.appName}
                </p>
                <p style="margin:0;font-size:15px;line-height:1.5;color:#4b5563;">
                  ${strings.greeting}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 12px;">
                <span style="display:inline-block;margin-bottom:16px;padding:6px 12px;border-radius:999px;background-color:#eef2ff;color:#4338ca;font-size:12px;font-weight:600;">
                  ${strings.timingLabel(daysBefore)}
                </span>
                <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:700;color:#111827;">
                  ${safeTitle}
                </h1>
                <p style="margin:0;font-size:16px;line-height:1.6;color:#374151;">
                  ${strings.headline(daysBefore)}. ${strings.body(formattedDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:12px;background-color:#fafafa;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">
                        ${strings.dateLabel}
                      </p>
                      <p style="margin:0;font-size:18px;font-weight:600;color:#111827;">
                        ${escapeHtml(formattedDate)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${peopleSection}
            <tr>
              <td style="padding:0 32px 32px;">
                <a href="${appUrl}/today" style="display:inline-block;padding:12px 20px;border-radius:10px;background-color:#111827;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                  ${strings.cta}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #f3f4f6;background-color:#fafafa;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                  ${strings.footer}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return {
    subject: strings.subject(eventTitle),
    html,
  };
}
