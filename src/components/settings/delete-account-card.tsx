"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAccount } from "@/modules/profile/actions/profile.actions";
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

type DeleteAccountCardProps = {
  userEmail: string;
};

export function DeleteAccountCard({ userEmail }: DeleteAccountCardProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { signOut } = useClerk();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDeleteAccount() {
    setError(null);

    startTransition(async () => {
      const result = await deleteAccount();

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDialogOpen(false);
      await signOut({ redirectUrl: "/" });
    });
  }

  return (
    <>
      <Card className="border-destructive/30 bg-card/80">
        <CardHeader>
          <CardTitle className="text-destructive">{t("deleteAccount")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("deleteAccountHint")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDialogOpen(true)}
          >
            {t("deleteAccount")}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("deleteAccountConfirmTitle")}
        description={t("deleteAccountConfirmDescription", { email: userEmail })}
        confirmLabel={t("deleteAccountConfirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDeleteAccount}
        isPending={isPending}
        destructive
      />
    </>
  );
}
