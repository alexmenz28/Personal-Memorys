import { getCachedProfileByAuthUserId } from "@/modules/auth/server/cached-profile";
import { getAuthUserId } from "@/modules/auth/server/session";
import { defaultLocale, isValidLocale } from "@/i18n/config";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale =
    cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : defaultLocale;

  let timeZone = "UTC";

  try {
    const userId = await getAuthUserId();

    if (userId) {
      const profile = await getCachedProfileByAuthUserId(userId);

      if (profile?.timezone) {
        timeZone = profile.timezone;
      }
    }
  } catch {
    // Public routes — keep UTC fallback.
  }

  return {
    locale,
    timeZone,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
