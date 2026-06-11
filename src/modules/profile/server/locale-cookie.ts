import "server-only";

import { isValidLocale } from "@/i18n/config";
import { cookies } from "next/headers";

export async function persistLocaleCookie(locale: string) {
  if (!isValidLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}
