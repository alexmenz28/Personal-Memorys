import "server-only";

import { parseDateOnly } from "@/shared/lib/dates";
import { db } from "@/shared/server/db";

export const remindersRepository = {
  syncEmailReminders(
    eventId: string,
    daysBeforeList: number[] | null | undefined,
  ) {
    return db.$transaction(async (tx) => {
      const existing = await tx.reminder.findMany({
        where: { eventId, channel: "EMAIL" },
      });

      const targetDays = [...new Set(daysBeforeList ?? [])].sort(
        (left, right) => left - right,
      );

      if (targetDays.length === 0) {
        if (existing.length > 0) {
          await tx.reminder.deleteMany({
            where: { eventId, channel: "EMAIL" },
          });
        }

        return [];
      }

      const targetSet = new Set(targetDays);
      const existingByDays = new Map(
        existing.map((reminder) => [reminder.daysBefore, reminder]),
      );

      for (const reminder of existing) {
        if (!targetSet.has(reminder.daysBefore)) {
          await tx.reminder.delete({ where: { id: reminder.id } });
        }
      }

      const synced = [];

      for (const daysBefore of targetDays) {
        const current = existingByDays.get(daysBefore);

        if (current) {
          synced.push(
            await tx.reminder.update({
              where: { id: current.id },
              data: { isActive: true },
            }),
          );
          continue;
        }

        synced.push(
          await tx.reminder.create({
            data: {
              eventId,
              daysBefore,
              channel: "EMAIL",
            },
          }),
        );
      }

      return synced;
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
