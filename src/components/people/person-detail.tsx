"use client";

import { RelationshipBadge } from "@/components/people/relationship-badge";
import { FadeIn } from "@/components/motion/fade-in";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPersonNote,
  createPreference,
  deletePerson,
  deletePersonNote,
  deletePreference,
  updatePerson,
} from "@/modules/people/actions/people.actions";
import {
  preferenceCategories,
  relationshipTypes,
} from "@/modules/people/schemas/person.schema";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Preference = {
  id: string;
  category: string;
  label: string;
  value: string;
};

type PersonNote = {
  id: string;
  content: string;
};

type PersonDetailProps = {
  person: {
    id: string;
    name: string;
    relationship: string;
    notes: string | null;
    preferences: Preference[];
    personNotes: PersonNote[];
  };
  variant?: "page" | "panel";
  onBack?: () => void;
  onDeleted?: () => void;
};

export function PersonDetail({
  person,
  variant = "page",
  onBack,
  onDeleted,
}: PersonDetailProps) {
  const t = useTranslations("people");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(person.name);
  const [relationship, setRelationship] = useState(person.relationship);
  const [notes, setNotes] = useState(person.notes ?? "");
  const [prefCategory, setPrefCategory] =
    useState<(typeof preferenceCategories)[number]>("FOOD");
  const [prefLabel, setPrefLabel] = useState("");
  const [prefValue, setPrefValue] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const initials = person.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function saveProfile() {
    setError(null);
    startTransition(async () => {
      const result = await updatePerson(person.id, {
        name,
        relationship: relationship as (typeof relationshipTypes)[number],
        notes: notes || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleDeletePerson() {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    startTransition(async () => {
      await deletePerson(person.id);

      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/people");
      }

      router.refresh();
    });
  }

  function addPreference() {
    if (!prefLabel.trim() || !prefValue.trim()) {
      return;
    }

    startTransition(async () => {
      await createPreference({
        personId: person.id,
        category: prefCategory,
        label: prefLabel,
        value: prefValue,
      });
      setPrefLabel("");
      setPrefValue("");
      router.refresh();
    });
  }

  function addNote() {
    if (!noteContent.trim()) {
      return;
    }

    startTransition(async () => {
      await createPersonNote({
        personId: person.id,
        content: noteContent,
      });
      setNoteContent("");
      router.refresh();
    });
  }

  const isPanel = variant === "panel";
  const profileCard = (
        <Card className="border-border/60 bg-card/80">
          <CardContent className="flex items-start gap-4 p-6">
            <Avatar className="size-16 border border-border/60">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
                <RelationshipBadge
                  relationship={relationship}
                  label={t(`relationships.${relationship}`)}
                />
              </div>
              <p className="text-sm text-muted-foreground">{t("detailSubtitle")}</p>
            </div>
          </CardContent>
        </Card>
  );

  return (
    <div className={isPanel ? "space-y-6" : "mx-auto max-w-3xl space-y-6"}>
      {!isPanel ? (
        onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backToPeople")}
          </button>
        ) : (
          <Link
            href="/people"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backToPeople")}
          </Link>
        )
      ) : null}

      {isPanel ? profileCard : <FadeIn>{profileCard}</FadeIn>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t("profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("name")}</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-relationship">{t("relationship")}</Label>
              <select
                id="edit-relationship"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
              >
                {relationshipTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`relationships.${type}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">{t("generalNotes")}</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <div className="flex gap-2">
              <Button onClick={saveProfile} disabled={isPending}>
                {isPending ? tCommon("loading") : tCommon("save")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePerson}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
                {t("deletePerson")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t("preferences")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("preferenceCategory")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={prefCategory}
                  onChange={(event) =>
                    setPrefCategory(
                      event.target.value as (typeof preferenceCategories)[number],
                    )
                  }
                >
                  {preferenceCategories.map((category) => (
                    <option key={category} value={category}>
                      {t(`categories.${category}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("preferenceLabel")}</Label>
                <Input
                  value={prefLabel}
                  onChange={(event) => setPrefLabel(event.target.value)}
                  placeholder={t("preferenceLabelPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("preferenceValue")}</Label>
                <Input
                  value={prefValue}
                  onChange={(event) => setPrefValue(event.target.value)}
                  placeholder={t("preferenceValuePlaceholder")}
                />
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={addPreference}
              disabled={isPending || !prefLabel.trim() || !prefValue.trim()}
            >
              {t("addPreference")}
            </Button>
            <div className="space-y-2">
              {person.preferences.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("noPreferences")}
                </p>
              ) : (
                person.preferences.map((preference) => (
                  <div
                    key={preference.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t(`categories.${preference.category}`)}
                      </p>
                      <p className="font-medium">{preference.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {preference.value}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        startTransition(async () => {
                          await deletePreference(preference.id, person.id);
                          router.refresh();
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{t("notes")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-note">{t("addNote")}</Label>
            <Textarea
              id="new-note"
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder={t("notePlaceholder")}
              rows={3}
            />
          </div>
          <Button
            variant="secondary"
            onClick={addNote}
            disabled={isPending || !noteContent.trim()}
          >
            {t("addNote")}
          </Button>
          <div className="space-y-2">
            {person.personNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noNotes")}</p>
            ) : (
              person.personNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                >
                  <p className="text-sm leading-relaxed">{note.content}</p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      startTransition(async () => {
                        await deletePersonNote(note.id, person.id);
                        router.refresh();
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
