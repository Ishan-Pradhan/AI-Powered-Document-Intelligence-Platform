interface SyncSummaryCardsProps {
  totalItems: number;
  readyCount: number;
  processingCount: number;
}

export function SyncSummaryCards({
  totalItems,
  readyCount,
  processingCount,
}: SyncSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 shrink-0">
      <div className="border border-border bg-card rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Total Sources
        </p>
        <p className="text-3xl font-bold mt-2">{totalItems}</p>
      </div>
      <div className="border border-border bg-card rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Loaded Ready
        </p>
        <p className="text-3xl font-bold mt-2">{readyCount}</p>
      </div>
      <div className="border border-border bg-card rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Loaded Processing
        </p>
        <p className="text-3xl font-bold mt-2">{processingCount}</p>
      </div>
    </div>
  );
}
