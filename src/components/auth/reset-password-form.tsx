"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { authClient } from "@/modules/auth/client/auth-client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const invalidToken = useMemo(
    () => !token || tokenError === "INVALID_TOKEN",
    [token, tokenError],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("password") as string;

    const result = await authClient.resetPassword({
      newPassword,
      token,
    });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? t("resetPasswordError"));
      return;
    }

    setSuccess(true);
    router.push("/sign-in");
    router.refresh();
  }

  if (invalidToken) {
    return (
      <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("resetPasswordTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-destructive">{t("resetPasswordInvalidToken")}</p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm text-foreground underline-offset-4 hover:underline"
          >
            {t("requestNewResetLink")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("resetPasswordTitle")}</CardTitle>
        <CardDescription>{t("resetPasswordSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="text-sm text-muted-foreground">{t("resetPasswordSuccess")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="password">{t("newPassword")}</Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("resettingPassword") : t("resetPassword")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
