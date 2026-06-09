import "server-only";

import type {
  CreateEventInput,
  UpdateEventInput,
} from "@/modules/events/schemas/event.schema";
import { remindersRepository } from "@/modules/reminders/server/repository";
import { db } from "@/shared/server/db";
import { parseDateOnly } from "@/shared/lib/dates";

const eventPeopleInclude = {
  eventPeople: {
    include: {
      person: {
        select: { id: true, name: true, relationship: true },
      },
    },
  },
} as const;

const remindersInclude = {
  reminders: {
    where: { channel: "EMAIL" as const, isActive: true },
    select: { daysBefore: true },
    orderBy: { daysBefore: "desc" as const },
  },
} as const;

const eventNotesInclude = {
  eventNotes: {
    include: {
      person: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

const defaultEventInclude = {
  ...eventPeopleInclude,
  ...remindersInclude,
  ...eventNotesInclude,
} as const;

export const eventsRepository = {
  findNonRecurringInDateRange(
    userProfileId: string,
    startDate: string,
    endDate: string,
  ) {
    return db.event.findMany({
      where: {
        userProfileId,
        isUndated: false,
        isRecurring: false,
        date: {
          gte: parseDateOnly(startDate),
          lte: parseDateOnly(endDate),
        },
      },
      include: defaultEventInclude,
      orderBy: [{ date: "asc" }, { title: "asc" }],
    });
  },

  findRecurringDated(userProfileId: string) {
    return db.event.findMany({
      where: {
        userProfileId,
        isUndated: false,
        isRecurring: true,
        date: { not: null },
      },
      include: defaultEventInclude,
      orderBy: [{ date: "asc" }, { title: "asc" }],
    });
  },

  /** @deprecated Use getEventOccurrencesInRange for reads that include annual recurrence. */
  findForDateRange(
    userProfileId: string,
    startDate: string,
    endDate: string,
  ) {
    return this.findNonRecurringInDateRange(
      userProfileId,
      startDate,
      endDate,
    );
  },

  findAllDated(userProfileId: string) {
    return db.event.findMany({
      where: {
        userProfileId,
        isUndated: false,
        date: { not: null },
      },
      include: defaultEventInclude,
      orderBy: [{ date: "asc" }, { title: "asc" }],
    });
  },

  findUndated(userProfileId: string) {
    return db.event.findMany({
      where: { userProfileId, isUndated: true },
      include: {
        eventPeople: {
          include: {
            person: {
              select: { id: true, name: true },
            },
          },
        },
        ...eventNotesInclude,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdForProfile(eventId: string, userProfileId: string) {
    return db.event.findFirst({
      where: { id: eventId, userProfileId },
      include: defaultEventInclude,
    });
  },

  async create(userProfileId: string, input: CreateEventInput) {
    const { personIds, date, reminderDaysBefore, ...rest } = input;

    const event = await db.event.create({
      data: {
        userProfileId,
        title: rest.title,
        description: rest.description,
        date: date ? parseDateOnly(date) : null,
        isRecurring: rest.isRecurring,
        isUndated: rest.isUndated,
        eventPeople: personIds?.length
          ? {
              create: personIds.map((personId) => ({ personId })),
            }
          : undefined,
      },
      include: defaultEventInclude,
    });

    if (!rest.isUndated && reminderDaysBefore?.length) {
      await remindersRepository.syncEmailReminders(event.id, reminderDaysBefore);
    }

    const refreshed = await this.findByIdForProfile(event.id, userProfileId);

    if (!refreshed) {
      throw new Error("Event not found after create.");
    }

    return refreshed;
  },

  async update(userProfileId: string, input: UpdateEventInput) {
    const { id, personIds, date, reminderDaysBefore, ...rest } = input;

    await db.$transaction(async (tx) => {
      await tx.eventPerson.deleteMany({ where: { eventId: id } });

      await tx.event.update({
        where: { id, userProfileId },
        data: {
          title: rest.title,
          description: rest.description,
          date: rest.isUndated ? null : date ? parseDateOnly(date) : null,
          isRecurring: rest.isRecurring,
          isUndated: rest.isUndated,
          eventPeople: personIds?.length
            ? {
                create: personIds.map((personId) => ({ personId })),
              }
            : undefined,
        },
      });
    });

    const nextReminderDays = rest.isUndated
      ? null
      : (reminderDaysBefore ?? null);

    await remindersRepository.syncEmailReminders(id, nextReminderDays);

    const refreshed = await this.findByIdForProfile(id, userProfileId);

    if (!refreshed) {
      throw new Error("Event not found after update.");
    }

    return refreshed;
  },

  delete(eventId: string, userProfileId: string) {
    return db.event.delete({
      where: { id: eventId, userProfileId },
    });
  },
};
