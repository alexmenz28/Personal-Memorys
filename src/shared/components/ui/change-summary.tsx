import type { FormChange } from "@/shared/lib/form-changes";

type ChangeSummaryProps = {
  changes: FormChange[];
};

export function ChangeSummary({ changes }: ChangeSummaryProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <ul className="max-h-60 space-y-2 overflow-y-auto text-sm">
      {changes.map((change) => (
        <li
          key={change.field}
          className="rounded-lg border border-border/60 bg-muted/30 p-3"
        >
          <p className="font-medium">{change.label}</p>
          <p className="mt-1 text-muted-foreground">
            <span>{change.before}</span>
            <span aria-hidden="true"> → </span>
            <span className="text-foreground">{change.after}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
