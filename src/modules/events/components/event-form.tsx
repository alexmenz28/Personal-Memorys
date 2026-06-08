"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EventPersonPicker,
  type PersonOption,
} from "@/modules/events/components/event-person-picker";
import { EventReminderFields } from "@/modules/reminders/components/event-reminder-fields";
import { FloatingFormActions } from "@/shared/components/layout/floating-form-actions";
import { FormActions } from "@/shared/components/layout/form-actions";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export type EventFormValues = {
  title: string;
  description: string;
  date: string;
  isUndated: boolean;
  isRecurring: boolean;
  personIds: string[];
  reminderEnabled: boolean;
  reminderDaysBefore: number;
};

type EventFormProps = {
  people: PersonOption[];
  initialValues?: Partial<EventFormValues>;
  submitLabel: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: EventFormValues) => void;
  footer?: React.ReactNode;
  /** Dialog modals use DialogFooter; panels use floating actions. */
  footerLayout?: "dialog" | "panel";
};

const defaultValues: EventFormValues = {
  title: "",
  description: "",
  date: "",
  isUndated: false,
  isRecurring: false,
  personIds: [],
  reminderEnabled: false,
  reminderDaysBefore: 7,
};

function resolveInitialValues(
  initialValues?: Partial<EventFormValues>,
): EventFormValues {
  const reminderDaysBefore =
    initialValues?.reminderDaysBefore ?? defaultValues.reminderDaysBefore;

  return {
    ...defaultValues,
    ...initialValues,
    reminderEnabled:
      initialValues?.reminderEnabled ??
      (initialValues?.reminderDaysBefore != null
        ? true
        : defaultValues.reminderEnabled),
    reminderDaysBefore,
    personIds: initialValues?.personIds ?? defaultValues.personIds,
  };
}

export function EventForm({
  people,
  initialValues,
  submitLabel,
  isPending,
  error,
  onSubmit,
  footer,
  footerLayout = "panel",
}: EventFormProps) {
  const t = useTranslations("events");
  const resolvedInitial = resolveInitialValues(initialValues);
  const [title, setTitle] = useState(resolvedInitial.title);
  const [description, setDescription] = useState(resolvedInitial.description);
  const [date, setDate] = useState(resolvedInitial.date);
  const [isUndated, setIsUndated] = useState(resolvedInitial.isUndated);
  const [isRecurring, setIsRecurring] = useState(resolvedInitial.isRecurring);
  const [personIds, setPersonIds] = useState(resolvedInitial.personIds);
  const [reminderEnabled, setReminderEnabled] = useState(
    resolvedInitial.reminderEnabled,
  );
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    resolvedInitial.reminderDaysBefore,
  );

  useEffect(() => {
    const next = resolveInitialValues(initialValues);
    setTitle(next.title);
    setDescription(next.description);
    setDate(next.date);
    setIsUndated(next.isUndated);
    setIsRecurring(next.isRecurring);
    setPersonIds(next.personIds);
    setReminderEnabled(next.reminderEnabled);
    setReminderDaysBefore(next.reminderDaysBefore);
  }, [initialValues]);

  function handleUndatedChange(checked: boolean) {
    setIsUndated(checked);

    if (checked) {
      setIsRecurring(false);
      setReminderEnabled(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      title,
      description,
      date,
      isUndated,
      isRecurring,
      personIds,
      reminderEnabled,
      reminderDaysBefore,
    });
  }

  const actionBar = (
    <FormActions>
      {footer}
      <Button type="submit" disabled={isPending || !title.trim()}>
        {submitLabel}
      </Button>
    </FormActions>
  );

  return (
    <form
      className={cn(
        footerLayout === "dialog" && "flex min-h-0 flex-1 flex-col overflow-hidden",
      )}
      onSubmit={handleSubmit}
    >
      <div
        className={cn(
          "space-y-4",
          footerLayout === "dialog" && "min-h-0 flex-1 overflow-y-auto pr-1",
        )}
      >
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
            onChange={(event) => handleUndatedChange(event.target.checked)}
            className="size-4 rounded border-input"
          />
          {t("undated")}
        </label>
        {!isUndated ? (
          <>
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(event) => setIsRecurring(event.target.checked)}
                className="size-4 rounded border-input"
              />
              {t("recurring")}
            </label>
            {isRecurring ? (
              <p className="text-xs text-muted-foreground">{t("recurringHint")}</p>
            ) : null}
            <EventReminderFields
              enabled={reminderEnabled}
              daysBefore={reminderDaysBefore}
              disabled={isPending}
              onEnabledChange={setReminderEnabled}
              onDaysBeforeChange={setReminderDaysBefore}
            />
          </>
        ) : null}
        <EventPersonPicker
          people={people}
          selectedIds={personIds}
          onChange={setPersonIds}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {footerLayout === "dialog" ? (
        <DialogFooter>{actionBar}</DialogFooter>
      ) : (
        <FloatingFormActions>{actionBar}</FloatingFormActions>
      )}
    </form>
  );
}
