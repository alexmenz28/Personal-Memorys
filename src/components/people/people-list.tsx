"use client";

import { CreatePersonDialog } from "@/components/people/create-person-dialog";
import { PersonCard } from "@/components/people/person-card";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

type PersonListItem = {
  id: string;
  name: string;
  relationship: string;
  notes: string | null;
  _count: {
    preferences: number;
    personNotes: number;
  };
};

type CreatedPerson = {
  id: string;
  name: string;
  relationship: string;
  notes: string | null;
};

type PeopleListProps = {
  people: PersonListItem[];
  onSelectPerson?: (personId: string, personName: string) => void;
  onPersonCreated?: (person: CreatedPerson) => void;
};

export function PeopleList({
  people,
  onSelectPerson,
  onPersonCreated,
}: PeopleListProps) {
  const t = useTranslations("people");

  if (people.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-card/50">
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("empty")}</p>
          </div>
          <CreatePersonDialog onCreated={onPersonCreated} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {people.map((person) => (
        <PersonCard
          key={person.id}
          id={person.id}
          name={person.name}
          relationship={person.relationship}
          notes={person.notes}
          preferencesCount={person._count.preferences}
          notesCount={person._count.personNotes}
          onSelect={onSelectPerson}
        />
      ))}
    </div>
  );
}
