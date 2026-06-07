"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const RECENT_COUNT = 3;
const SEARCH_LIMIT = 8;

export type PersonOption = {
  id: string;
  name: string;
  createdAt?: string;
};

type EventPersonPickerProps = {
  people: PersonOption[];
  selectedIds: string[];
  onChange: (personIds: string[]) => void;
};

export function EventPersonPicker({
  people,
  selectedIds,
  onChange,
}: EventPersonPickerProps) {
  const t = useTranslations("events");
  const [query, setQuery] = useState("");

  const recentPeople = useMemo(() => {
    return [...people]
      .sort((left, right) => {
        const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
        const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
        return rightTime - leftTime;
      })
      .slice(0, RECENT_COUNT);
  }, [people]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return people
      .filter((person) => person.name.toLowerCase().includes(normalizedQuery))
      .slice(0, SEARCH_LIMIT);
  }, [people, query]);

  const selectedPeople = useMemo(
    () => people.filter((person) => selectedIds.includes(person.id)),
    [people, selectedIds],
  );

  function togglePerson(personId: string) {
    if (selectedIds.includes(personId)) {
      onChange(selectedIds.filter((id) => id !== personId));
      return;
    }

    onChange([...selectedIds, personId]);
  }

  function removePerson(personId: string) {
    onChange(selectedIds.filter((id) => id !== personId));
  }

  if (people.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{t("people")}</Label>
        <p className="text-sm text-muted-foreground">{t("noPeople")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>{t("people")}</Label>

      {selectedPeople.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedPeople.map((person) => (
            <Badge key={person.id} variant="secondary" className="gap-1 pr-1">
              {person.name}
              <button
                type="button"
                onClick={() => removePerson(person.id)}
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={t("removePerson", { name: person.name })}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPeople")}
          className="pl-9"
        />
      </div>

      {query.trim() ? (
        searchResults.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noSearchResults")}</p>
        ) : (
          <div className="space-y-1 rounded-xl border border-border/60 bg-muted/10 p-2">
            {searchResults.map((person) => {
              const isSelected = selectedIds.includes(person.id);

              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => togglePerson(person.id)}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/40",
                    isSelected && "bg-primary/10 text-foreground",
                  )}
                >
                  {person.name}
                </button>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("recentPeople")}
          </p>
          <div className="flex flex-wrap gap-2">
            {recentPeople.map((person) => {
              const isSelected = selectedIds.includes(person.id);

              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => togglePerson(person.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background hover:bg-muted/40",
                  )}
                >
                  {person.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("peopleHint")}</p>
    </div>
  );
}
