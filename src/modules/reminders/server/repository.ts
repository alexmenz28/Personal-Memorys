import "server-only";

import { parseDateOnly } from "@/shared/lib/dates";
import { db } from "@/shared/server/db";

export const remindersRepository = {
  syncEmailReminder(eventId: string, daysBefore: number | null | undefined) {
    return db.$transaction(async (tx) => {
      const existing = await tx.reminder.findFirst({
        where: { eventId, channel: "EMAIL" },
      });

      if (daysBefore === null || daysBefore === undefined) {
        if (existing) {
          await tx.reminder.delete({ where: { id: existing.id } });
        }

        return null;
      }

      if (existing) {
        return tx.reminder.update({
          where: { id: existing.id },
          data: { daysBefore, isActive: true },
        });
      }

      return tx.reminder.create({
        data: {
          eventId,
          daysBefore,
          channel: "EMAIL",
        },
      });
    });
  },

  findActiveEmailRemindersForDelivery() {
    return db.reminder.findMany({
      where: {
        isActive: true,
        channel: "EMAIL",
        event: {
          isUndated: false,
          date: { not: null },
        },
      },
      include: {
        event: {
          include: {
            eventPeople: {
              include: {
                person: { select: { name: true } },
              },
            },
            userProfile: {
              select: {
                email: true,
                locale: true,
                timezone: true,
              },
            },
          },
        },
      },
    });
  },

  hasDelivery(reminderId: string, occurrenceDate: string) {
    return db.reminderDelivery.findUnique({
      where: {
        reminderId_occurrenceDate: {
          reminderId,
          occurrenceDate: parseDateOnly(occurrenceDate),
        },
      },
      select: { id: true },
    });
  },

  recordDelivery(reminderId: string, occurrenceDate: string) {
    return db.reminderDelivery.create({
      data: {
        reminderId,
        occurrenceDate: parseDateOnly(occurrenceDate),
      },
    });
  },
};
