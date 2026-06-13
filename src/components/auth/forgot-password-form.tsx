"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/modules/auth/client/auth-client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? t("forgotPasswordError"));
      return;
    }

    setSent(true);
  }

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("forgotPasswordTitle")}</CardTitle>
        <CardDescription>{t("forgotPasswordSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("forgotPasswordSent")}</p>
            <Link
              href="/sign-in"
              className="inline-block text-sm text-foreground underline-offset-4 hover:underline"
            >
              {t("backToSignIn")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("sendingResetLink") : t("sendResetLink")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/sign-in"
                className="text-foreground underline-offset-4 hover:underline"
              >
                {t("backToSignIn")}
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
