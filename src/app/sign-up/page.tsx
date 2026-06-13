import { SignUpForm } from "@/components/auth/sign-up-form";
import { isGoogleAuthEnabled } from "@/modules/auth/server/auth";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <SignUpForm googleEnabled={isGoogleAuthEnabled} />
    </div>
  );
}
