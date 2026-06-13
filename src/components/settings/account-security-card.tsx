"use client";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/modules/auth/client/auth-client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type LinkedAccount = {
  id: string;
  providerId: string;
};

type AccountSecurityCardProps = {
  userEmail: string;
  googleEnabled: boolean;
};

export function AccountSecurityCard({
  userEmail,
  googleEnabled,
}: AccountSecurityCardProps) {
  const t = useTranslations("settings");
  const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      const result = await authClient.listAccounts();

      if (cancelled) {
        return;
      }

      if (result.error) {
        setLoadError(result.error.message ?? t("accountSecurityLoadError"));
        return;
      }

      setAccounts(result.data ?? []);
    }

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const hasCredential = accounts?.some(
    (account) => account.providerId === "credential",
  );
  const hasGoogle = accounts?.some((account) => account.providerId === "google");
  const canUnlinkGoogle = Boolean(hasGoogle && hasCredential);

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsChangingPassword(true);

    const formData = new FormData(event.currentTarget);

    const result = await authClient.changePassword({
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      revokeOtherSessions: true,
    });

    setIsChangingPassword(false);

    if (result.error) {
      setPasswordError(result.error.message ?? t("changePasswordError"));
      return;
    }

    setPasswordSuccess(true);
    event.currentTarget.reset();
  }

  async function handleUnlinkGoogle() {
    setUnlinkError(null);
    setIsUnlinking(true);

    const result = await authClient.unlinkAccount({
      providerId: "google",
    });

    setIsUnlinking(false);

    if (result.error) {
      setUnlinkError(result.error.message ?? t("unlinkGoogleError"));
      return;
    }

    setAccounts((current) =>
      current?.filter((account) => account.providerId !== "google") ?? [],
    );
  }

  if (loadError) {
    return (
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>{t("accountSecurity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{loadError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!accounts) {
    return (
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>{t("accountSecurity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("accountSecurityLoading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle>{t("accountSecurity")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("accountSecurityHint")}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {hasCredential ? (
          <section className="space-y-4">
            <h3 className="text-sm font-medium">{t("changePassword")}</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError ? (
                <p className="text-sm text-destructive">{passwordError}</p>
              ) : null}
              {passwordSuccess ? (
                <p className="text-sm text-muted-foreground">{t("changePasswordSuccess")}</p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="current-password">{t("currentPassword")}</Label>
                <PasswordInput
                  id="current-password"
                  name="currentPassword"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("newPassword")}</Label>
                <PasswordInput
                  id="new-password"
                  name="newPassword"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? t("changingPassword") : t("changePassword")}
              </Button>
            </form>
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noPasswordAccount")}</p>
        )}

        {googleEnabled ? (
          <section className="space-y-4 border-t border-border/60 pt-8">
            <h3 className="text-sm font-medium">{t("googleAccount")}</h3>
            {hasGoogle ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("googleLinked")}</p>
                {canUnlinkGoogle ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUnlinkGoogle}
                    disabled={isUnlinking}
                  >
                    {isUnlinking ? t("unlinkingGoogle") : t("unlinkGoogle")}
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("cannotUnlinkOnlyProvider")}
                  </p>
                )}
                {unlinkError ? (
                  <p className="text-sm text-destructive">{unlinkError}</p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("linkGoogleHint", { email: userEmail })}
                </p>
                <GoogleAuthButton mode="link" callbackURL="/settings" />
              </div>
            )}
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
