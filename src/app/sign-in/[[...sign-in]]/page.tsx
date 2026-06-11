import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/shared/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <SignIn
        appearance={clerkAppearance}
        fallbackRedirectUrl="/auth/continue"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
