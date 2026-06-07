import "server-only";

import type { CreateEventInput } from "@/modules/events/schemas/event.schema";
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
};
