import { db } from "@/lib/db";

export async function getPeopleForProfile(userProfileId: string) {
  return db.person.findMany({
    where: { userProfileId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          preferences: true,
          personNotes: true,
        },
      },
    },
  });
}

export async function getPersonForProfile(personId: string, userProfileId: string) {
  return db.person.findFirst({
    where: { id: personId, userProfileId },
    include: {
      preferences: { orderBy: { createdAt: "desc" } },
      personNotes: { orderBy: { createdAt: "desc" } },
    },
  });
}
