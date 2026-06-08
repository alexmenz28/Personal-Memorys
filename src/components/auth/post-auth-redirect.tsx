"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

type PostAuthRedirectProps = {
  to: string;
};

/**
 * Full-page navigation after Clerk sign-in.
 * Client-side router.replace + server redirect can leave a blank "Rendering…" screen.
 */
export function PostAuthRedirect({ to }: PostAuthRedirectProps) {
  const t = useTranslations("common");

  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">{t("loading")}</p>
    </div>
  );
}
