import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { config } from "dotenv";

config();

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function time(label, fn) {
  const start = Date.now();
  const result = await fn();
  const ms = Date.now() - start;
  const extra = Array.isArray(result) ? ` rows=${result.length}` : "";
  console.log(`${label}: ${ms}ms${extra}`);
  return result;
}

const profile = await time("profile", () => db.userProfile.findFirst());

if (!profile) {
  console.log("No profile found");
  process.exit(0);
}

await time("people list", () =>
  db.person.findMany({
    where: { userProfileId: profile.id },
    include: {
      _count: { select: { preferences: true, personNotes: true } },
    },
  }),
);

await time("person detail", () =>
  db.person.findFirst({
    where: { userProfileId: profile.id },
    include: { preferences: true, personNotes: true },
  }),
);

await time("holidays BO", () =>
  db.systemHoliday.findMany({
    where: {
      countryCode: profile.countryCode,
      regionCode: profile.regionCode ?? "",
    },
  }),
);

await time("events", () =>
  db.event.findMany({ where: { userProfileId: profile.id } }),
);

await db.$disconnect();
