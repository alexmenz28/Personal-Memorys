export function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-40 rounded-xl bg-muted/70" />
        <div className="h-40 rounded-xl bg-muted/70" />
      </div>
      <div className="space-y-3">
        <div className="h-16 rounded-xl bg-muted/60" />
        <div className="h-16 rounded-xl bg-muted/60" />
        <div className="h-16 rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}

export function PersonDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-xl bg-muted/70" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-muted/60" />
        <div className="h-64 rounded-xl bg-muted/60" />
      </div>
      <div className="h-48 rounded-xl bg-muted/60" />
    </div>
  );
}
