import { PostAuthRedirect } from "@/components/auth/post-auth-redirect";
import { getPostAuthRedirectPath } from "@/modules/auth/server/redirect";

export default async function AuthContinuePage() {
  const target = await getPostAuthRedirectPath();

  return <PostAuthRedirect to={target} />;
}
