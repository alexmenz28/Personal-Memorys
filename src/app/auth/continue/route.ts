import { getPostAuthRedirectPath } from "@/modules/auth/server/redirect";
import { resolveUserProfile } from "@/modules/auth/server/session";
import { persistLocaleCookie } from "@/modules/profile/server/locale-cookie";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const profile = await resolveUserProfile();

  if (profile?.locale) {
    await persistLocaleCookie(profile.locale);
  }

  const target = await getPostAuthRedirectPath();

  return NextResponse.redirect(new URL(target, request.url));
}
