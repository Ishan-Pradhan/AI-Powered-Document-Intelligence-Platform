import type { DB_Document } from "@/types/ApiTypes";

export const GetStatusBadge = (status: DB_Document["status"]) => {
  switch (status) {
    case "ready":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-tropical-teal-500/10 px-2 py-0.5 text-xs font-semibold text-tropical-teal-600">
          Ready
        </span>
      );
    case "pending":
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-royal-gold-500/10 px-2 py-0.5 text-xs font-semibold text-royal-gold-600 animate-pulse">
          Processing
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
          Failed
        </span>
      );
  }
};
