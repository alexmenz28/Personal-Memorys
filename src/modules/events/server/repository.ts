import "server-only";

import type {
  CreateEventInput,
  UpdateEventInput,
} from "@/modules/events/schemas/event.schema";
import { db } from "@/shared/server/db";
import { parseDateOnly } from "@/shared/lib/dates";

export const eventsRepository = {
  findForDateRange(
    userProfileId: string,
    startDate: string,
    endDate: string,
  ) {
    return db.event.findMany({
      where: {
        userProfileId,
        isUndated: false,
        date: {
          gte: parseDateOnly(startDate),
          lte: parseDateOnly(endDate),
        },
      },
      include: {
        eventPeople: {
          include: {
            person: {
              select: { id: true, name: true, relationship: true },
            },
          },
        },
      },
      orderBy: [{ date: "asc" }, { title: "asc" }],
    });
  },

  findAllDated(userProfileId: string) {
    return db.event.findMany({
      where: {
        userProfileId,
        isUndated: false,
        date: { not: null },
      },
      include: {
        eventPeople: {
          include: {
            person: {
              select: { id: true, name: true, relationship: true },
            },
          },
        },
      },
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
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdForProfile(eventId: string, userProfileId: string) {
    return db.event.findFirst({
      where: { id: eventId, userProfileId },
      include: {
        eventPeople: {
          include: {
            person: { select: { id: true, name: true } },
          },
        },
      },
    });
  },

  create(userProfileId: string, input: CreateEventInput) {
    const { personIds, date, ...rest } = input;

    return db.event.create({
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
      include: {
        eventPeople: {
          include: { person: { select: { id: true, name: true } } },
        },
      },
    });
  },

  update(userProfileId: string, input: UpdateEventInput) {
    const { id, personIds, date, ...rest } = input;

    return db.$transaction(async (tx) => {
      await tx.eventPerson.deleteMany({ where: { eventId: id } });

      return tx.event.update({
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
        include: {
          eventPeople: {
            include: { person: { select: { id: true, name: true } } },
          },
        },
      });
    });
  },

  delete(eventId: string, userProfileId: string) {
    return db.event.delete({
      where: { id: eventId, userProfileId },
    });
  },
};
