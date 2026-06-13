import "server-only";

import { Resend } from "resend";

type SendAuthEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "re_...") {
    return null;
  }

  return new Resend(apiKey);
}

export async function sendAuthEmail(input: SendAuthEmailInput) {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail || fromEmail.includes("yourdomain")) {
    console.warn("[auth] RESEND_FROM_EMAIL not configured — skipping email.");
    return { sent: false as const, reason: "missing_from_email" };
  }

  const resend = getResendClient();

  if (!resend) {
    console.warn("[auth] RESEND_API_KEY not configured — skipping email.");
    return { sent: false as const, reason: "missing_api_key" };
  }

  await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { sent: true as const };
}
