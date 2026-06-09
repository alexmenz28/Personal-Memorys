"use client";

import { FilterableItemsList } from "@/components/people/filterable-items-list";
import { RelationshipBadge } from "@/components/people/relationship-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelect } from "@/components/ui/form-select";
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
  buildPreferenceCategoryOptions,
  getPreferenceCategoryFilterKey,
  resolvePreferenceCategoryLabel,
  type CustomPreferenceCategory,
} from "@/modules/people/lib/preference-categories";
import {
  preferenceCategories,
  relationshipTypes,
} from "@/modules/people/schemas/person.schema";
import { ChangeSummary } from "@/shared/components/ui/change-summary";
import { cn } from "@/shared/lib/utils";
import { FloatingFormActions } from "@/shared/components/layout/floating-form-actions";
import { FormActions } from "@/shared/components/layout/form-actions";
import {
  diffPersonProfileChanges,
  type FormChange,
} from "@/shared/lib/form-changes";
import { ArrowLeft, CalendarPlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type Preference = {
  id: string;
  category: string;
  customCategoryId: string | null;
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
  onPersonUpdated?: (person: PersonDetailProps["person"]) => void;
  onCreateEvent?: (personId: string) => void;
  customPreferenceCategories?: CustomPreferenceCategory[];
};

export function PersonDetail({
  person,
  variant = "page",
  onBack,
  onDeleted,
  onPersonUpdated,
  onCreateEvent,
  customPreferenceCategories = [],
}: PersonDetailProps) {
  const t = useTranslations("people");
  const tEvents = useTranslations("events");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(person.name);
  const [relationship, setRelationship] = useState(person.relationship);
  const [notes, setNotes] = useState(person.notes ?? "");
  const [prefCategory, setPrefCategory] = useState("FOOD");
  const [prefLabel, setPrefLabel] = useState("");
  const [prefValue, setPrefValue] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [saveChanges, setSaveChanges] = useState<FormChange[]>([]);
  const [preferences, setPreferences] = useState(person.preferences);
  const [personNotes, setPersonNotes] = useState(person.personNotes);

  const categoryOptions = useMemo(
    () =>
      buildPreferenceCategoryOptions(
        preferenceCategories.map((category) => ({
          value: category,
          label: t(`categories.${category}`),
        })),
        customPreferenceCategories,
      ),
    [customPreferenceCategories, t],
  );

  function getCategoryLabel(
    category: string,
    customCategoryId?: string | null,
  ) {
    return resolvePreferenceCategoryLabel(
      category,
      customCategoryId,
      customPreferenceCategories,
      (key) => t(`categories.${key}`),
    );
  }

  const savedProfile = {
    name: person.name,
    relationship: person.relationship,
    notes: person.notes ?? "",
  };

  useEffect(() => {
    setName(person.name);
    setRelationship(person.relationship);
    setNotes(person.notes ?? "");
    setPreferences(person.preferences);
    setPersonNotes(person.personNotes);
  }, [person]);

  function notifyPersonUpdated(
    nextPreferences: Preference[],
    nextNotes: PersonNote[],
    nextName = name,
  ) {
    onPersonUpdated?.({
      ...person,
      name: nextName,
      relationship,
      notes: notes || null,
      preferences: nextPreferences,
      personNotes: nextNotes,
    });
  }

  const initials = person.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function buildProfileChanges() {
    return diffPersonProfileChanges(
      savedProfile,
      { name, relationship, notes },
      {
        name: t("name"),
        relationship: t("relationship"),
        notes: t("generalNotes"),
        empty: t("emptyValue"),
        formatRelationship: (value) => t(`relationships.${value}`),
      },
    );
  }

  function requestSaveProfile() {
    const changes = buildProfileChanges();

    if (changes.length === 0) {
      return;
    }

    setSaveChanges(changes);
    setSaveConfirmOpen(true);
  }

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
        setSaveConfirmOpen(false);
        return;
      }

      setSaveConfirmOpen(false);
      notifyPersonUpdated(preferences, personNotes, name);

      if (!onPersonUpdated && variant === "page") {
        router.refresh();
      }
    });
  }

  function handleDeletePerson() {
    startTransition(async () => {
      const result = await deletePerson(person.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDeleteDialogOpen(false);

      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/people");
        router.refresh();
      }
    });
  }

  function addPreference() {
    if (!prefLabel.trim() || !prefValue.trim()) {
      return;
    }

    startTransition(async () => {
      const result = await createPreference({
        personId: person.id,
        categoryRef: prefCategory,
        label: prefLabel,
        value: prefValue,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const nextPreferences = [result.data, ...preferences];
      setPreferences(nextPreferences);
      setPrefLabel("");
      setPrefValue("");
      notifyPersonUpdated(nextPreferences, personNotes);
    });
  }

  function addNote() {
    if (!noteContent.trim()) {
      return;
    }

    startTransition(async () => {
      const result = await createPersonNote({
        personId: person.id,
        content: noteContent,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const nextNotes = [result.data, ...personNotes];
      setPersonNotes(nextNotes);
      setNoteContent("");
      notifyPersonUpdated(preferences, nextNotes);
    });
  }

  function removePreference(preferenceId: string) {
    startTransition(async () => {
      const result = await deletePreference(preferenceId, person.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const nextPreferences = preferences.filter(
        (preference) => preference.id !== preferenceId,
      );
      setPreferences(nextPreferences);
      notifyPersonUpdated(nextPreferences, personNotes);
    });
  }

  function removeNote(noteId: string) {
    startTransition(async () => {
      const result = await deletePersonNote(noteId, person.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const nextNotes = personNotes.filter((note) => note.id !== noteId);
      setPersonNotes(nextNotes);
      notifyPersonUpdated(preferences, nextNotes);
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

  const profileActions = (
    <FormActions>
      <Button
        variant="destructive"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="size-4" />
        {t("deletePerson")}
      </Button>
      <Button onClick={requestSaveProfile} disabled={isPending}>
        {isPending ? tCommon("loading") : tCommon("save")}
      </Button>
    </FormActions>
  );

  return (
    <div
      className={cn(
        isPanel ? "space-y-6 pb-24" : "mx-auto max-w-3xl space-y-6",
      )}
    >
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

      {profileCard}

      {onCreateEvent ? (
        <FormActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => onCreateEvent(person.id)}
          >
            <CalendarPlus className="size-4" />
            {tEvents("addEventForPerson")}
          </Button>
        </FormActions>
      ) : null}

      <div
        className={cn("grid gap-6", !isPanel && "lg:grid-cols-2")}
      >
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
              <FormSelect
                id="edit-relationship"
                value={relationship}
                onValueChange={setRelationship}
                options={relationshipTypes.map((type) => ({
                  value: type,
                  label: t(`relationships.${type}`),
                }))}
              />
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
            {!isPanel ? profileActions : null}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t("preferences")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.length > 0 ? (
              <FilterableItemsList
                items={preferences}
                emptyMessage={t("noPreferences")}
                noResultsMessage={t("noFilterResults")}
                viewAllLabel={(count) => t("viewAllPreferences", { count })}
                viewLessLabel={t("viewLess")}
                searchPlaceholder={t("searchPreferences")}
                previewLayout={isPanel ? "list" : "grid"}
                getSearchText={(preference) =>
                  `${preference.label} ${preference.value}`
                }
                categoryFilter={{
                  getCategory: (preference) =>
                    getPreferenceCategoryFilterKey(
                      preference.category,
                      preference.customCategoryId,
                    ),
                  allLabel: t("filterAll"),
                  categories: categoryOptions,
                }}
                filteredCountLabel={(count, total) =>
                  t("filteredCount", { count, total })
                }
                renderItem={(preference, context) => (
                  <div
                    className={
                      context === "preview"
                        ? "h-full rounded-xl border border-border/60 bg-muted/30 p-3"
                        : "flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                    }
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {getCategoryLabel(
                          preference.category,
                          preference.customCategoryId,
                        )}
                      </p>
                      <p className="font-medium">{preference.label}</p>
                      <p
                        className={
                          context === "preview"
                            ? "truncate text-sm text-muted-foreground"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {preference.value}
                      </p>
                    </div>
                    {context === "full" ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removePreference(preference.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                )}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("noPreferences")}</p>
            )}

            <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-muted/10 p-4">
              <p className="text-sm font-medium">{t("addPreference")}</p>
              <div
                className={cn(
                  "grid gap-3",
                  isPanel ? "grid-cols-1" : "sm:grid-cols-2",
                )}
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="preference-category">{t("preferenceCategory")}</Label>
                  <FormSelect
                    id="preference-category"
                    value={prefCategory}
                    onValueChange={setPrefCategory}
                    options={categoryOptions}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preference-label">{t("preferenceLabel")}</Label>
                  <Input
                    id="preference-label"
                    value={prefLabel}
                    onChange={(event) => setPrefLabel(event.target.value)}
                    placeholder={t("preferenceLabelPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preference-value">{t("preferenceValue")}</Label>
                  <Input
                    id="preference-value"
                    value={prefValue}
                    onChange={(event) => setPrefValue(event.target.value)}
                    placeholder={t("preferenceValuePlaceholder")}
                  />
                </div>
              </div>
              <Button
                className={cn(isPanel && "w-full")}
                variant="secondary"
                onClick={addPreference}
                disabled={isPending || !prefLabel.trim() || !prefValue.trim()}
              >
                {t("addPreference")}
              </Button>
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
          <FormActions>
            <Button
              variant="secondary"
              onClick={addNote}
              disabled={isPending || !noteContent.trim()}
            >
              {t("addNote")}
            </Button>
          </FormActions>
          <FilterableItemsList
            items={personNotes}
            emptyMessage={t("noNotes")}
            noResultsMessage={t("noFilterResults")}
            viewAllLabel={(count) => t("viewAllNotes", { count })}
            viewLessLabel={t("viewLess")}
            searchPlaceholder={t("searchNotes")}
            getSearchText={(note) => note.content}
            filteredCountLabel={(count, total) =>
              t("filteredCount", { count, total })
            }
            renderItem={(note, context) => (
              <div
                className={
                  context === "preview"
                    ? "h-full rounded-xl border border-border/60 bg-muted/30 p-3"
                    : "flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                }
              >
                <p
                  className={
                    context === "preview"
                      ? "line-clamp-3 text-sm leading-relaxed"
                      : "text-sm leading-relaxed"
                  }
                >
                  {note.content}
                </p>
                {context === "full" ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeNote(note.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {isPanel ? (
        <FloatingFormActions>{profileActions}</FloatingFormActions>
      ) : null}

      <ConfirmDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title={t("saveConfirmTitle")}
        description={t("saveConfirmDescription")}
        confirmLabel={tCommon("save")}
        cancelLabel={tCommon("cancel")}
        onConfirm={saveProfile}
        isPending={isPending}
      >
        <ChangeSummary changes={saveChanges} />
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteConfirmTitle", { name })}
        description={t("deleteConfirmDescription", { name })}
        confirmLabel={t("deletePerson")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDeletePerson}
        isPending={isPending}
        destructive
      />
    </div>
  );
}
