"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EventForm,
  type EventFormValues,
} from "@/modules/events/components/event-form";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/modules/events/actions/events.actions";
import type { SerializedEvent } from "@/modules/calendar/types/calendar-items";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export type EventMutationResult = {
  id: string;
  title: string;
  description: string | null;
  date: Date | null;
  isUndated: boolean;
  isRecurring: boolean;
  eventPeople: Array<{ person: { id: string; name: string } }>;
};

type EventPanelContentProps = {
  mode: "create" | "edit";
  event?: SerializedEvent | null;
  people: PersonOption[];
  defaultDate?: string;
  defaultUndated?: boolean;
  defaultPersonIds?: string[];
  showBack?: boolean;
  onBack?: () => void;
  onSuccess?: () => void;
  onCreated?: (event: EventMutationResult) => void;
  onUpdated?: (event: EventMutationResult) => void;
  onDeleted?: (eventId: string) => void;
};

function toFormValues(
  event: SerializedEvent | null | undefined,
  defaults: {
    defaultDate?: string;
    defaultUndated?: boolean;
    defaultPersonIds?: string[];
  },
): Partial<EventFormValues> {
  if (event) {
    return {
      title: event.title,
      description: event.description ?? "",
      date: event.date ?? "",
      isUndated: event.isUndated,
      personIds: event.eventPeople.map(({ person }) => person.id),
    };
  }

  return {
    date: defaults.defaultDate ?? "",
    isUndated: defaults.defaultUndated ?? false,
    personIds: defaults.defaultPersonIds ?? [],
  };
}

export function EventPanelContent({
  mode,
  event,
  people,
  defaultDate,
  defaultUndated = false,
  defaultPersonIds = [],
  showBack = false,
  onBack,
  onSuccess,
  onCreated,
  onUpdated,
  onDeleted,
}: EventPanelContentProps) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const initialValues = useMemo(
    () =>
      toFormValues(event, {
        defaultDate,
        defaultUndated,
        defaultPersonIds,
      }),
    [defaultDate, defaultPersonIds, defaultUndated, event],
  );

  const title = mode === "create" ? t("addEvent") : t("editEvent");
  const description =
    mode === "create" ? t("addEventDescription") : t("editEventDescription");

  function finishSuccess() {
    onSuccess?.();
    if (!onSuccess) {
      router.refresh();
    }
  }

  function handleSubmit(values: EventFormValues) {
    setError(null);

    startTransition(async () => {
      if (mode === "create") {
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

        onCreated?.(result.data);
        finishSuccess();
        return;
      }

      if (!event) {
        return;
      }

      const result = await updateEvent({
        id: event.id,
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

      onUpdated?.(result.data);
      finishSuccess();
    });
  }

  function handleDelete() {
    if (!event) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEvent({ id: event.id });

      if (!result.ok) {
        setError(result.error);
        setDeleteDialogOpen(false);
        return;
      }

      setDeleteDialogOpen(false);
      onDeleted?.(event.id);
      finishSuccess();
    });
  }

  return (
    <>
      <div className="space-y-4">
        {showBack && onBack ? (
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
            {tCommon("back")}
          </Button>
        ) : null}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <EventForm
          key={event?.id ?? `create-${defaultPersonIds.join(",")}-${defaultDate ?? ""}`}
          people={people}
          initialValues={initialValues}
          submitLabel={isPending ? tCommon("loading") : tCommon("save")}
          isPending={isPending}
          error={error}
          onSubmit={handleSubmit}
          footer={
            mode === "edit" ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
                {t("deleteEvent")}
              </Button>
            ) : undefined
          }
        />
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteEventTitle")}
        description={t("deleteEventDescription")}
        confirmLabel={t("deleteEvent")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDelete}
        isPending={isPending}
        destructive
      />
    </>
  );
}
