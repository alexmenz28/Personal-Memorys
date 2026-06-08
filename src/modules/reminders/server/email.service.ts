import "server-only";

import { buildReminderEmail } from "@/modules/reminders/server/email-templates";
import { Resend } from "resend";

type SendReminderEmailInput = {
  to: string;
  locale: string;
  timezone: string;
  eventTitle: string;
  occurrenceDate: string;
  daysBefore: number;
  peopleNames: string[];
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "re_...") {
    return null;
  }

  return new Resend(apiKey);
}

export async function sendReminderEmail(input: SendReminderEmailInput) {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail || fromEmail.includes("yourdomain")) {
    console.warn("[reminders] RESEND_FROM_EMAIL not configured — skipping send.");
    return { sent: false, reason: "missing_from_email" as const };
  }

  const resend = getResendClient();

  if (!resend) {
    console.warn("[reminders] RESEND_API_KEY not configured — skipping send.");
    return { sent: false, reason: "missing_api_key" as const };
  }

  const { subject, html } = buildReminderEmail(input);

  await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject,
    html,
  });

  return { sent: true as const };
}
