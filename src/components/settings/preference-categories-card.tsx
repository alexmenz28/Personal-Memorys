"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCustomPreferenceCategory,
  deleteCustomPreferenceCategory,
} from "@/modules/people/actions/preference-category.actions";
import {
  BUILTIN_PREFERENCE_CATEGORIES,
  type CustomPreferenceCategory,
} from "@/modules/people/lib/preference-categories";
import { MAX_CUSTOM_PREFERENCE_CATEGORIES } from "@/modules/people/schemas/preference-category.schema";
import { useServerSyncedState } from "@/shared/hooks/use-server-synced-state";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type PreferenceCategoriesCardProps = {
  customCategories: CustomPreferenceCategory[];
};

export function PreferenceCategoriesCard({
  customCategories: initialCustomCategories,
}: PreferenceCategoriesCardProps) {
  const t = useTranslations("settings");
  const tPeople = useTranslations("people");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [customCategories, setCustomCategories] = useServerSyncedState(
    initialCustomCategories,
  );
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomPreferenceCategory | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const atLimit = customCategories.length >= MAX_CUSTOM_PREFERENCE_CATEGORIES;

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!label.trim() || isPending || atLimit) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await createCustomPreferenceCategory({ label: label.trim() });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCustomCategories((current) =>
        [...current, result.data].sort((left, right) =>
          left.label.localeCompare(right.label),
        ),
      );
      setLabel("");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteCustomPreferenceCategory({ id: deleteTarget.id });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCustomCategories((current) =>
        current.filter((category) => category.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>{t("preferenceCategories")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("preferenceCategoriesHint")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-medium">{t("builtinCategories")}</h3>
            <ul className="flex flex-wrap gap-2">
              {BUILTIN_PREFERENCE_CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-sm text-muted-foreground"
                >
                  {tPeople(`categories.${category}`)}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">{t("customCategories")}</h3>
              <span className="text-xs text-muted-foreground">
                {t("customCategoriesCount", {
                  count: customCategories.length,
                  max: MAX_CUSTOM_PREFERENCE_CATEGORIES,
                })}
              </span>
            </div>

            {customCategories.length > 0 ? (
              <ul className="space-y-2">
                {customCategories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{category.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(category)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("noCustomCategories")}
              </p>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="custom-category-label">
                  {t("addCustomCategory")}
                </Label>
                <Input
                  id="custom-category-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder={t("customCategoryPlaceholder")}
                  disabled={isPending || atLimit}
                  maxLength={60}
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" variant="secondary" disabled={isPending || atLimit || !label.trim()}>
                {isPending ? tCommon("loading") : t("addCustomCategory")}
              </Button>
            </form>
          </section>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title={t("deleteCustomCategoryTitle", { label: deleteTarget?.label ?? "" })}
        description={t("deleteCustomCategoryDescription")}
        confirmLabel={t("deleteCustomCategoryConfirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDelete}
        isPending={isPending}
        destructive
      />
    </>
  );
}
