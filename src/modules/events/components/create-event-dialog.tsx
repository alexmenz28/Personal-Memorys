"use client";

import { Button } from "@/components/ui/button";
import { PageActionButton } from "@/shared/components/layout/page-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EventForm,
  type EventFormValues,
} from "@/modules/events/components/event-form";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import { createEvent } from "@/modules/events/actions/events.actions";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CreatedEvent = {
  id: string;
  title: string;
  description: string | null;
  date: Date | null;
  isUndated: boolean;
  isRecurring: boolean;
  eventPeople: Array<{ person: { id: string; name: string } }>;
};

type CreateEventDialogProps = {
  defaultDate?: string;
  defaultUndated?: boolean;
  people?: PersonOption[];
  defaultPersonIds?: string[];
  onCreated?: (event: CreatedEvent) => void;
};

export function CreateEventDialog({
  defaultDate,
  defaultUndated = false,
  people = [],
  defaultPersonIds = [],
  onCreated,
}: CreateEventDialogProps) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(values: EventFormValues) {
    setError(null);

    startTransition(async () => {
      const result = await createEvent({
        title: values.title,
        description: values.description || undefined,
        date: values.isUndated ? undefined : values.date || undefined,
        isUndated: values.isUndated,
        isRecurring: false,
        personIds: values.personIds.length > 0 ? values.personIds : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      setFormKey((current) => current + 1);

      if (onCreated) {
        onCreated(result.data);
      } else {
        router.refresh();
      }
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
        <EventForm
          key={formKey}
          people={people}
          initialValues={{
            date: defaultDate ?? "",
            isUndated: defaultUndated,
            personIds: defaultPersonIds,
          }}
          submitLabel={isPending ? tCommon("loading") : tCommon("save")}
          isPending={isPending}
          error={error}
          onSubmit={handleSubmit}
          footerLayout="dialog"
          footer={
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
