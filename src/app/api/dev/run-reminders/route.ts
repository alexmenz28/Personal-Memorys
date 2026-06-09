import { processDailyReminders } from "@/modules/reminders/server/delivery.service";

/** Solo desarrollo: dispara recordatorios sin esperar al cron de Inngest. */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not available" }, { status: 403 });
  }

  const result = await processDailyReminders({ ignoreHour: true });

  return Response.json(result);
}
