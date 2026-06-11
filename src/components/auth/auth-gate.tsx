"use client";

import { authClient } from "@/modules/auth/client/auth-client";
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
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const t = useTranslations("common");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(redirectTo);
    }
  }, [isPending, session, redirectTo, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return children;
}
