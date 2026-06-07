import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-500/20", className)} />
  );
}

// Mirrors SyncSummaryCards — 3 stat cards
function SkeletonSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-border bg-card rounded-xl p-5 space-y-3">
          <Shimmer className="h-3 w-24 rounded-full" />
          <Shimmer className="h-8 w-12 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// Mirrors one DocumentTable row: icon + name, type, status badge, date, action
function SkeletonTableRow() {
  return (
    <tr className="border-b border-border last:border-0">
      {/* Name column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Shimmer className="size-4 shrink-0 rounded" />
          <Shimmer className="h-3.5 w-40 rounded-full" />
        </div>
      </td>
      {/* Type */}
      <td className="px-6 py-4">
        <Shimmer className="h-3 w-10 rounded-full" />
      </td>
      {/* Status badge */}
      <td className="px-6 py-4">
        <Shimmer className="h-5 w-16 rounded-full" />
      </td>
      {/* Date */}
      <td className="px-6 py-4">
        <Shimmer className="h-3 w-20 rounded-full" />
      </td>
      {/* Actions */}
      <td className="px-6 py-4 flex justify-end">
        <Shimmer className="size-6 rounded" />
      </td>
    </tr>
  );
}

// Mirrors DocumentTable header + rows + pagination footer
function SkeletonDocumentTable({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {/* List header: title + search bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Shimmer className="h-5 w-28 rounded-full self-start" />
        <Shimmer className="h-9 w-full sm:w-64 rounded-md" />
      </div>

      {/* Table shell */}
      <div className="mt-4 border border-border rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            {/* thead ghost */}
            <thead className="bg-muted/40">
              <tr>
                {["Name", "Type", "Status", "Updated At", "Actions"].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 border-b border-border"
                  >
                    <Shimmer className="h-3 w-14 rounded-full" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer ghost */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <Shimmer className="h-3 w-36 rounded-full" />
          <div className="flex gap-2">
            <Shimmer className="h-8 w-20 rounded-md" />
            <Shimmer className="h-8 w-14 rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}

// Full-page skeleton — drop-in replacement for isLoading state
export function KnowledgeBaseSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 text-foreground">
      <div className="max-w-4xl mx-auto">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <Shimmer className="h-7 w-40 rounded-md" />
            <Shimmer className="h-3.5 w-72 rounded-full" />
          </div>
          <Shimmer className="h-10 w-36 rounded-md" />
        </div>

        <SkeletonSummaryCards />
        <SkeletonDocumentTable rows={6} />
      </div>
    </div>
  );
}
