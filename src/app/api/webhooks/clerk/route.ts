import { profileRepository } from "@/modules/profile/server/repository";
import { db } from "@/shared/server/db";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await request.text();
  const webhook = new Webhook(webhookSecret);

  let event: WebhookEvent;

  try {
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const email =
      event.data.email_addresses?.find(
        (entry) => entry.id === event.data.primary_email_address_id,
      )?.email_address ?? event.data.email_addresses?.[0]?.email_address;

    if (email) {
      await profileRepository.upsertFromClerk({
        clerkUserId: event.data.id,
        email,
      });
    }
  }

  if (event.type === "user.deleted" && event.data.id) {
    await db.userProfile.deleteMany({
      where: { clerkUserId: event.data.id },
    });
  }

  return new Response("OK", { status: 200 });
}
