"use client";

import { Button } from "@/components/ui/button";
import { PageActionButton } from "@/shared/components/layout/page-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent } from "@/modules/events/actions/events.actions";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CreateEventDialogProps = {
  defaultDate?: string;
};

export function CreateEventDialog({ defaultDate }: CreateEventDialogProps) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(defaultDate ?? "");
  const [isUndated, setIsUndated] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate(defaultDate ?? "");
    setIsUndated(false);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createEvent({
        title,
        description: description || undefined,
        date: isUndated ? undefined : date || undefined,
        isUndated,
        isRecurring: false,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      resetForm();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <PageActionButton>
            <Plus className="size-4" />
            {t("addEvent")}
          </PageActionButton>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addEvent")}</DialogTitle>
          <DialogDescription>{t("addEventDescription")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="event-title">{t("title")}</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("titlePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">{t("description")}</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isUndated}
              onChange={(event) => setIsUndated(event.target.checked)}
              className="size-4 rounded border-input"
            />
            {t("undated")}
          </label>
          {!isUndated ? (
            <div className="space-y-2">
              <Label htmlFor="event-date">{t("date")}</Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required={!isUndated}
              />
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? tCommon("loading") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
