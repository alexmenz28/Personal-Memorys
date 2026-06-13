import { SignInForm } from "@/components/auth/sign-in-form";
import { isGoogleAuthEnabled } from "@/modules/auth/server/auth";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <SignInForm googleEnabled={isGoogleAuthEnabled} />
    </div>
  );
}
