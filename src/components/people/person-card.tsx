"use client";

import { RelationshipBadge } from "@/components/people/relationship-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type PersonCardProps = {
  id: string;
  name: string;
  relationship: string;
  notes?: string | null;
  preferencesCount: number;
  notesCount: number;
  onSelect?: (personId: string, personName: string) => void;
};

export function PersonCard({
  id,
  name,
  relationship,
  notes,
  preferencesCount,
  notesCount,
  onSelect,
}: PersonCardProps) {
  const t = useTranslations("people");
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function handleClick() {
    onSelect?.(id, name);
  }

  function handleMouseEnter() {
    void fetchPersonDetailPrefetch(id);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="group block w-full text-left"
    >
      <Card className="border-border/60 bg-card/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="size-12 border border-border/60">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-medium">{name}</h3>
              <RelationshipBadge
                relationship={relationship}
                label={t(`relationships.${relationship}`)}
              />
            </div>
            {notes ? (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {notes}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                {t("counts", { preferences: preferencesCount, notes: notesCount })}
              </p>
            )}
          </div>
          <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </CardContent>
      </Card>
    </button>
  );
}

const prefetchCache = new Set<string>();

function fetchPersonDetailPrefetch(personId: string) {
  if (prefetchCache.has(personId)) {
    return;
  }

  prefetchCache.add(personId);
  void import("@/modules/people/actions/people.actions").then(
    ({ fetchPersonDetail }) => fetchPersonDetail(personId),
  );
}
