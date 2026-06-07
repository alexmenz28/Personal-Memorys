import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const relationshipStyles: Record<string, string> = {
  PARTNER: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  FAMILY: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  FRIEND: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  COLLEAGUE: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  OTHER: "bg-muted text-muted-foreground",
};

type RelationshipBadgeProps = {
  label: string;
  relationship: string;
};

export function RelationshipBadge({
  label,
  relationship,
}: RelationshipBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", relationshipStyles[relationship])}
    >
      {label}
    </Badge>
  );
}
