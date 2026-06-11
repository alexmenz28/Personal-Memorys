import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/shared/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <SignUp
        appearance={clerkAppearance}
        fallbackRedirectUrl="/auth/continue"
        signInUrl="/sign-in"
      />
    </div>
  );
}
