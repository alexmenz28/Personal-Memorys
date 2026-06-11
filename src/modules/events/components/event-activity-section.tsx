"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import {
  createEventNoteFromPersonNote,
  createEventNoteFromPreference,
  deleteEventNote,
} from "@/modules/events/actions/events.actions";
import { resolveEventActivityTiming } from "@/modules/events/lib/event-activity-copy";
import type { SerializedEventNote } from "@/modules/calendar/types/calendar-items";
import { fetchCustomPreferenceCategories } from "@/modules/people/actions/preference-category.actions";
import { fetchPersonDetail } from "@/modules/people/actions/people.actions";
import {
  resolvePreferenceCategoryLabel,
  type CustomPreferenceCategory,
} from "@/modules/people/lib/preference-categories";
import { FormActions } from "@/shared/components/layout/form-actions";
import { cn } from "@/lib/utils";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";

type LinkedPerson = {
  id: string;
  name: string;
};

type PersonPreference = {
  id: string;
  category: string;
  customCategoryId?: string | null;
  label: string;
  value: string;
};

type PersonNote = {
  id: string;
  content: string;
};

type ReferenceType = "preference" | "note";

type EventActivitySectionProps = {
  eventId: string;
  eventDate: string | null;
  isUndated: boolean;
  today: string;
  linkedPeople: LinkedPerson[];
  initialNotes: SerializedEventNote[];
};

export function EventActivitySection({
  eventId,
  eventDate,
  isUndated,
  today,
  linkedPeople,
  initialNotes,
}: EventActivitySectionProps) {
  const t = useTranslations("events");
  const tPeople = useTranslations("people");
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [personId, setPersonId] = useState(linkedPeople[0]?.id ?? "");
  const [referenceType, setReferenceType] = useState<ReferenceType>("preference");
  const [preferences, setPreferences] = useState<PersonPreference[]>([]);
  const [personNotes, setPersonNotes] = useState<PersonNote[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string | null>(
    null,
  );
  const [selectedPersonNoteId, setSelectedPersonNoteId] = useState<string | null>(
    null,
  );
  const [customCategories, setCustomCategories] = useState<
    CustomPreferenceCategory[]
  >([]);

  const timing = resolveEventActivityTiming(eventDate, isUndated, today);

  function getCategoryLabel(
    category: string,
    customCategoryId?: string | null,
  ) {
    return resolvePreferenceCategoryLabel(
      category,
      customCategoryId,
      customCategories,
      (key) => tPeople(`categories.${key}`),
    );
  }

  useEffect(() => {
    let cancelled = false;

    void fetchCustomPreferenceCategories().then((result) => {
      if (!cancelled && result.ok) {
        setCustomCategories(result.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const loggedPreferenceIds = useMemo(
    () =>
      new Set(
        notes
          .map((note) => note.preferenceId)
          .filter((id): id is string => Boolean(id)),
      ),
    [notes],
  );

  const loggedPersonNoteIds = useMemo(
    () =>
      new Set(
        notes
          .map((note) => note.personNoteId)
          .filter((id): id is string => Boolean(id)),
      ),
    [notes],
  );

  useEffect(() => {
    if (!personId) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setDetailsLoading(true);
      setError(null);
    });

    void fetchPersonDetail(personId).then((result) => {
      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setPreferences([]);
        setPersonNotes([]);
        setSelectedPreferenceId(null);
        setSelectedPersonNoteId(null);
        setError(result.error);
        setDetailsLoading(false);
        return;
      }

      setPreferences(result.data.preferences);
      setPersonNotes(result.data.personNotes);
      setSelectedPreferenceId(null);
      setSelectedPersonNoteId(null);
      setDetailsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [personId]);

  function handleLogReference() {
    if (!personId) {
      return;
    }

    setError(null);

    if (referenceType === "preference") {
      if (!selectedPreferenceId) {
        return;
      }

      startTransition(async () => {
        const result = await createEventNoteFromPreference({
          eventId,
          personId,
          preferenceId: selectedPreferenceId,
        });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setNotes((current) => [result.data, ...current]);
        setSelectedPreferenceId(null);
      });

      return;
    }

    if (!selectedPersonNoteId) {
      return;
    }

    startTransition(async () => {
      const result = await createEventNoteFromPersonNote({
        eventId,
        personId,
        personNoteId: selectedPersonNoteId,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setNotes((current) => [result.data, ...current]);
      setSelectedPersonNoteId(null);
    });
  }

  function handleDelete(noteId: string) {
    setError(null);

    startTransition(async () => {
      const result = await deleteEventNote(noteId, eventId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setNotes((current) => current.filter((note) => note.id !== noteId));
    });
  }

  if (linkedPeople.length === 0) {
    return (
      <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
        <h3 className="text-sm font-medium">{t(`eventActivityTitle.${timing}`)}</h3>
        <p className="text-sm text-muted-foreground">{t("eventActivityNeedPeople")}</p>
      </div>
    );
  }

  const availablePreferences = preferences.filter(
    (preference) => !loggedPreferenceIds.has(preference.id),
  );
  const availablePersonNotes = personNotes.filter(
    (note) => !loggedPersonNoteIds.has(note.id),
  );

  const hasReferenceOptions =
    referenceType === "preference"
      ? availablePreferences.length > 0
      : availablePersonNotes.length > 0;

  const selectedReferenceId =
    referenceType === "preference"
      ? selectedPreferenceId
      : selectedPersonNoteId;

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{t(`eventActivityTitle.${timing}`)}</h3>
        <p className="text-xs text-muted-foreground">
          {t(`eventActivityHint.${timing}`)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity-person">{t("eventActivityPerson")}</Label>
        <FormSelect
          id="activity-person"
          value={personId}
          onValueChange={setPersonId}
          options={linkedPeople.map((person) => ({
            value: person.id,
            label: person.name,
          }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity-reference-type">
          {t("eventActivityReferenceType")}
        </Label>
        <FormSelect
          id="activity-reference-type"
          value={referenceType}
          onValueChange={(value) => {
            setReferenceType(value as ReferenceType);
            setSelectedPreferenceId(null);
            setSelectedPersonNoteId(null);
            setError(null);
          }}
          options={[
            { value: "preference", label: t("eventActivityReferencePreference") },
            { value: "note", label: t("eventActivityReferenceNote") },
          ]}
        />
      </div>

      {detailsLoading ? (
        <p className="text-sm text-muted-foreground">{t("eventActivityLoading")}</p>
      ) : referenceType === "preference" ? (
        preferences.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">
              {t("eventActivityNoPreferences")}
            </p>
            <Link
              href={`/people?person=${personId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              <ExternalLink className="size-4" />
              {t("eventActivityAddPreference")}
            </Link>
          </div>
        ) : availablePreferences.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">
              {t("eventActivityAllLogged")}
            </p>
            <Link
              href={`/people?person=${personId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              <ExternalLink className="size-4" />
              {t("eventActivityAddPreference")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Label>{t("eventActivityPickPreference")}</Label>
            <ul className="space-y-2">
              {availablePreferences.map((preference) => {
                const isSelected = selectedPreferenceId === preference.id;

                return (
                  <li key={preference.id}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setSelectedPreferenceId(preference.id)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60 bg-background hover:bg-muted/30",
                      )}
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {getCategoryLabel(
                          preference.category,
                          preference.customCategoryId,
                        )}
                      </p>
                      <p className="font-medium">{preference.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {preference.value}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )
      ) : personNotes.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-background/60 p-4">
          <p className="text-sm text-muted-foreground">
            {t("eventActivityNoPersonNotes")}
          </p>
          <Link
            href={`/people?person=${personId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            <ExternalLink className="size-4" />
            {t("eventActivityAddPersonNote")}
          </Link>
        </div>
      ) : availablePersonNotes.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-background/60 p-4">
          <p className="text-sm text-muted-foreground">
            {t("eventActivityAllNotesLogged")}
          </p>
          <Link
            href={`/people?person=${personId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            <ExternalLink className="size-4" />
            {t("eventActivityAddPersonNote")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>{t("eventActivityPickPersonNote")}</Label>
          <ul className="space-y-2">
            {availablePersonNotes.map((note) => {
              const isSelected = selectedPersonNoteId === note.id;

              return (
                <li key={note.id}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setSelectedPersonNoteId(note.id)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/60 bg-background hover:bg-muted/30",
                    )}
                  >
                    <p className="text-sm leading-relaxed">{note.content}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasReferenceOptions ? (
        <FormActions>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending || !selectedReferenceId}
            onClick={handleLogReference}
          >
            {t(`eventActivityLog.${timing}`)}
          </Button>
          <Link
            href={`/people?person=${personId}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2",
            )}
          >
            <ExternalLink className="size-4" />
            {referenceType === "preference"
              ? t("eventActivityAddPreference")
              : t("eventActivityAddPersonNote")}
          </Link>
        </FormActions>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noEventActivity")}</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background p-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {note.personNoteId
                    ? t("eventActivityReferenceNote")
                    : getCategoryLabel(note.category, note.customCategoryId)}
                  {note.person ? (
                    <>
                      {" · "}
                      <Link
                        href={`/people?person=${note.person.id}`}
                        className="normal-case tracking-normal text-primary hover:underline"
                      >
                        {note.person.name}
                      </Link>
                    </>
                  ) : null}
                </p>
                <p className="font-medium">{note.label}</p>
                <p className="text-sm text-muted-foreground">{note.value}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => handleDelete(note.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
