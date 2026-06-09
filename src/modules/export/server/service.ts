import "server-only";

import { db } from "@/shared/server/db";
import { toIsoString } from "@/shared/lib/dates";

const EXPORT_VERSION = "1.0";

function formatDateOnly(value: Date | null) {
  return value ? toIsoString(value).slice(0, 10) : null;
}

export async function buildUserExport(userProfileId: string) {
  const [profile, people, events] = await Promise.all([
    db.userProfile.findUnique({
      where: { id: userProfileId },
      select: {
        email: true,
        locale: true,
        timezone: true,
        countryCode: true,
        regionCode: true,
        theme: true,
        reminderHour: true,
        createdAt: true,
      },
    }),
    db.person.findMany({
      where: { userProfileId },
      orderBy: { name: "asc" },
      include: {
        preferences: { orderBy: { createdAt: "asc" } },
        personNotes: { orderBy: { createdAt: "asc" } },
      },
    }),
    db.event.findMany({
      where: { userProfileId },
      orderBy: [{ date: "asc" }, { title: "asc" }],
      include: {
        eventPeople: {
          include: {
            person: { select: { id: true, name: true } },
          },
        },
        reminders: {
          where: { isActive: true },
          orderBy: { daysBefore: "desc" },
        },
        eventNotes: { orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  if (!profile) {
    throw new Error("User profile not found");
  }

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profile: {
      email: profile.email,
      locale: profile.locale,
      timezone: profile.timezone,
      countryCode: profile.countryCode,
      regionCode: profile.regionCode,
      theme: profile.theme,
      reminderHour: profile.reminderHour,
      createdAt: profile.createdAt.toISOString(),
    },
    people: people.map((person) => ({
      id: person.id,
      name: person.name,
      relationship: person.relationship,
      notes: person.notes,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
      preferences: person.preferences.map((preference) => ({
        id: preference.id,
        category: preference.category,
        title: preference.label,
        detail: preference.value,
        createdAt: preference.createdAt.toISOString(),
      })),
      personNotes: person.personNotes.map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
      })),
    })),
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: formatDateOnly(event.date),
      isRecurring: event.isRecurring,
      isUndated: event.isUndated,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      people: event.eventPeople.map(({ person }) => ({
        id: person.id,
        name: person.name,
      })),
      reminderDaysBefore: event.reminders.map(
        (reminder) => reminder.daysBefore,
      ),
      eventNotes: event.eventNotes.map((note) => ({
        id: note.id,
        personId: note.personId,
        preferenceId: note.preferenceId,
        category: note.category,
        label: note.label,
        detail: note.value,
        createdAt: note.createdAt.toISOString(),
      })),
    })),
  };
}

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function toCsvRow(values: Array<string | number | boolean | null | undefined>) {
  return values.map(escapeCsvCell).join(",");
}

export function buildUserExportCsv(
  data: Awaited<ReturnType<typeof buildUserExport>>,
) {
  const lines: string[] = [];

  lines.push(toCsvRow(["section", "person_name", "event_title", "date", "category", "title", "detail", "content", "relationship", "is_recurring", "reminder_days"]));

  for (const person of data.people) {
    lines.push(
      toCsvRow([
        "person",
        person.name,
        "",
        "",
        "",
        "",
        "",
        person.notes ?? "",
        person.relationship,
        "",
        "",
      ]),
    );

    for (const preference of person.preferences) {
      lines.push(
        toCsvRow([
          "preference",
          person.name,
          "",
          "",
          preference.category,
          preference.title,
          preference.detail,
          "",
          "",
          "",
          "",
        ]),
      );
    }

    for (const note of person.personNotes) {
      lines.push(
        toCsvRow([
          "person_note",
          person.name,
          "",
          "",
          "",
          "",
          "",
          note.content,
          "",
          "",
          "",
        ]),
      );
    }
  }

  for (const event of data.events) {
    lines.push(
      toCsvRow([
        "event",
        event.people.map((person) => person.name).join("; "),
        event.title,
        event.date,
        "",
        "",
        event.description ?? "",
        "",
        "",
        event.isRecurring,
        event.reminderDaysBefore.join("; "),
      ]),
    );

    for (const note of event.eventNotes) {
      lines.push(
        toCsvRow([
          "event_activity",
          note.personId
            ? data.people.find((person) => person.id === note.personId)?.name ?? ""
            : event.people.map((person) => person.name).join("; "),
          event.title,
          event.date,
          note.category,
          note.label,
          note.detail,
          "",
          "",
          "",
          "",
        ]),
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

export function buildExportFilename(format: "json" | "csv") {
  const date = new Date().toISOString().slice(0, 10);
  return `personal-memories-${date}.${format}`;
}
