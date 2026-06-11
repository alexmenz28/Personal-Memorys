import { PostAuthRedirect } from "@/components/auth/post-auth-redirect";
import { getPostAuthRedirectPath } from "@/modules/auth/server/redirect";
import { resolveUserProfile } from "@/modules/auth/server/session";
import { persistLocaleCookie } from "@/modules/profile/server/locale-cookie";

export default async function AuthContinuePage() {
  const profile = await resolveUserProfile();

  if (profile?.locale) {
    await persistLocaleCookie(profile.locale);
  }

  const target = await getPostAuthRedirectPath();

  return <PostAuthRedirect to={target} />;
}
