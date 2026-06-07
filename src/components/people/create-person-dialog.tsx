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
import { createPerson } from "@/modules/people/actions/people.actions";
import { relationshipTypes } from "@/modules/people/schemas/person.schema";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CreatedPerson = {
  id: string;
  name: string;
  relationship: string;
  notes: string | null;
};

type CreatePersonDialogProps = {
  onCreated?: (person: CreatedPerson) => void;
};

export function CreatePersonDialog({ onCreated }: CreatePersonDialogProps) {
  const t = useTranslations("people");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [relationship, setRelationship] =
    useState<(typeof relationshipTypes)[number]>("OTHER");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setRelationship("OTHER");
    setNotes("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createPerson({
        name,
        relationship,
        notes: notes || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      resetForm();

      if (onCreated) {
        onCreated({
          id: result.data.id,
          name: result.data.name,
          relationship: result.data.relationship,
          notes: result.data.notes,
        });
      } else {
        router.push(`/people?person=${result.data.id}`);
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
            {t("addPerson")}
          </PageActionButton>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addPerson")}</DialogTitle>
          <DialogDescription>{t("addPersonDescription")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="person-name">{t("name")}</Label>
            <Input
              id="person-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("namePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-relationship">{t("relationship")}</Label>
            <select
              id="person-relationship"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={relationship}
              onChange={(event) =>
                setRelationship(
                  event.target.value as (typeof relationshipTypes)[number],
                )
              }
            >
              {relationshipTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`relationships.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-notes">{t("generalNotes")}</Label>
            <Textarea
              id="person-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("notesPlaceholder")}
              rows={3}
            />
          </div>
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
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? tCommon("loading") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
