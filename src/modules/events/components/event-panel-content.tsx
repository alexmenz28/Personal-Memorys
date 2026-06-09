"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EventForm,
  type EventFormValues,
} from "@/modules/events/components/event-form";
import {
  reminderDaysFromEvent,
  toReminderDaysBefore,
} from "@/modules/events/components/event-form.helpers";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import { EventActivitySection } from "@/modules/events/components/event-activity-section";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/modules/events/actions/events.actions";
import type { SerializedEvent } from "@/modules/calendar/types/calendar-items";
import { ChangeSummary } from "@/shared/components/ui/change-summary";
import { diffEventFormChanges, type FormChange } from "@/shared/lib/form-changes";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export type EventMutationResult = Pick<
  SerializedEvent,
  | "id"
  | "title"
  | "description"
  | "date"
  | "isUndated"
  | "isRecurring"
  | "eventPeople"
>;

type EventPanelContentProps = {
  mode: "create" | "edit";
  event?: SerializedEvent | null;
  people: PersonOption[];
  today: string;
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
      isRecurring: event.isRecurring,
      personIds: event.eventPeople.map(({ person }) => person.id),
      ...reminderDaysFromEvent(event.reminderDaysBefore),
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
  today,
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
  const formatter = useFormatter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EventFormValues | null>(null);
  const [saveChanges, setSaveChanges] = useState<FormChange[]>([]);

  const initialValues = useMemo(
    () =>
      toFormValues(event, {
        defaultDate,
        defaultUndated,
        defaultPersonIds,
      }),
    [defaultDate, defaultPersonIds, defaultUndated, event],
  );

  const personNamesById = useMemo(
    () => new Map(people.map((person) => [person.id, person.name])),
    [people],
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

  function buildChangeSummary(values: EventFormValues) {
    return diffEventFormChanges(initialValues, values, personNamesById, {
      title: t("title"),
      description: t("description"),
      date: t("date"),
      undated: t("undated"),
      recurring: t("recurring"),
      people: t("people"),
      reminder: t("reminderEmail"),
      yes: t("yes"),
      no: t("no"),
      empty: t("emptyValue"),
      formatReminder: (enabled, daysBefore) => {
        if (!enabled || daysBefore.length === 0) {
          return t("reminderDisabled");
        }

        return [...daysBefore]
          .sort((left, right) => left - right)
          .map((offset) => t(`reminderDays.${offset}`))
          .join(", ");
      },
      formatPeople: (names) =>
        names.length > 0 ? names.join(", ") : t("emptyValue"),
      formatDate: (dateValue, isUndated) => {
        if (isUndated) {
          return t("undated");
        }

        if (!dateValue) {
          return t("emptyValue");
        }

        const parsed = new Date(`${dateValue}T12:00:00`);
        return formatter.dateTime(parsed, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    });
  }

  function submitUpdate(values: EventFormValues) {
    if (!event) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await updateEvent({
        id: event.id,
        title: values.title,
        description: values.description || undefined,
        date: values.isUndated ? undefined : values.date || undefined,
        isUndated: values.isUndated,
        isRecurring: values.isRecurring,
        personIds: values.personIds.length > 0 ? values.personIds : undefined,
        reminderDaysBefore: toReminderDaysBefore(values),
      });

      if (!result.ok) {
        setError(result.error);
        setSaveConfirmOpen(false);
        return;
      }

      setSaveConfirmOpen(false);
      setPendingValues(null);
      onUpdated?.(result.data);
      finishSuccess();
    });
  }

  function handleSubmit(values: EventFormValues) {
    setError(null);

    if (mode === "edit") {
      const changes = buildChangeSummary(values);

      if (changes.length === 0) {
        return;
      }

      setPendingValues(values);
      setSaveChanges(changes);
      setSaveConfirmOpen(true);
      return;
    }

    startTransition(async () => {
      const result = await createEvent({
        title: values.title,
        description: values.description || undefined,
        date: values.isUndated ? undefined : values.date || undefined,
        isUndated: values.isUndated,
        isRecurring: values.isRecurring,
        personIds: values.personIds.length > 0 ? values.personIds : undefined,
        reminderDaysBefore: toReminderDaysBefore(values),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onCreated?.(result.data);
      finishSuccess();
    });
  }

  function handleConfirmSave() {
    if (pendingValues) {
      submitUpdate(pendingValues);
    }
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
          footerLayout="panel"
          linkSelectedPeopleToProfile={mode === "edit"}
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
        {mode === "edit" && event ? (
          <EventActivitySection
            key={`${event.id}-${event.eventPeople.map(({ person }) => person.id).join(",")}`}
            eventId={event.id}
            eventDate={event.occurrenceDate ?? event.date}
            isUndated={event.isUndated}
            today={today}
            linkedPeople={event.eventPeople.map(({ person }) => person)}
            initialNotes={event.eventNotes}
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title={t("saveConfirmTitle")}
        description={t("saveConfirmDescription")}
        confirmLabel={tCommon("save")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleConfirmSave}
        isPending={isPending}
      >
        <ChangeSummary changes={saveChanges} />
      </ConfirmDialog>

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
