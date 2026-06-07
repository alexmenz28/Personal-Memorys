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
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export type EventFormValues = {
  title: string;
  description: string;
  date: string;
  isUndated: boolean;
  personIds: string[];
};

type EventFormProps = {
  people: PersonOption[];
  initialValues?: Partial<EventFormValues>;
  submitLabel: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: EventFormValues) => void;
  footer?: React.ReactNode;
  /** Dialog modals use DialogFooter (cancel + save); panels use inline actions. */
  footerLayout?: "dialog" | "inline";
};

const defaultValues: EventFormValues = {
  title: "",
  description: "",
  date: "",
  isUndated: false,
  personIds: [],
};

export function EventForm({
  people,
  initialValues,
  submitLabel,
  isPending,
  error,
  onSubmit,
  footer,
  footerLayout = "inline",
}: EventFormProps) {
  const t = useTranslations("events");
  const [title, setTitle] = useState(initialValues?.title ?? defaultValues.title);
  const [description, setDescription] = useState(
    initialValues?.description ?? defaultValues.description,
  );
  const [date, setDate] = useState(initialValues?.date ?? defaultValues.date);
  const [isUndated, setIsUndated] = useState(
    initialValues?.isUndated ?? defaultValues.isUndated,
  );
  const [personIds, setPersonIds] = useState(
    initialValues?.personIds ?? defaultValues.personIds,
  );

  useEffect(() => {
    setTitle(initialValues?.title ?? defaultValues.title);
    setDescription(initialValues?.description ?? defaultValues.description);
    setDate(initialValues?.date ?? defaultValues.date);
    setIsUndated(initialValues?.isUndated ?? defaultValues.isUndated);
    setPersonIds(initialValues?.personIds ?? defaultValues.personIds);
  }, [initialValues]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ title, description, date, isUndated, personIds });
  }

  return (
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
      <EventPersonPicker
        people={people}
        selectedIds={personIds}
        onChange={setPersonIds}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {footerLayout === "dialog" ? (
        <DialogFooter>
          {footer}
          <Button type="submit" disabled={isPending || !title.trim()}>
            {submitLabel}
          </Button>
        </DialogFooter>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isPending || !title.trim()}>
            {submitLabel}
          </Button>
          {footer}
        </div>
      )}
    </form>
  );
}
