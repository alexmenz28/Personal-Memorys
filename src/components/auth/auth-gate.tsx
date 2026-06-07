"use client";

import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthGateProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function AuthGate({
  children,
  redirectTo = "/sign-in",
}: AuthGateProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const t = useTranslations("common");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(redirectTo);
    }
  }, [isLoaded, isSignedIn, redirectTo, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return children;
}
