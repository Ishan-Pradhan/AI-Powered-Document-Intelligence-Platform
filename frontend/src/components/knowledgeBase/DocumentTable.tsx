import { useState } from "react";
import { FileText, Search, Trash2, Trash2Icon, Copy, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/utils/formatDate";
import { GetStatusBadge } from "@/components/knowledgeBase/GetStatusBadge";
import type { DB_Document } from "@/types/ApiTypes";

interface DocumentTableProps {
  sources: DB_Document[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
}

export function DocumentTable({
  sources,
  searchQuery,
  setSearchQuery,
  onDelete,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: DocumentTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <>
      {/* list header */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="font-bold text-lg self-start sm:self-center">
          Data Sources
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* sources table */}
      <div className="mt-4 border border-border rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-muted-foreground">
            <thead className="bg-muted/40 text-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 border-b border-border">Name</th>
                <th className="px-6 py-3 border-b border-border">Type</th>
                <th className="px-6 py-3 border-b border-border">Status</th>
                <th className="px-6 py-3 border-b border-border">Updated At</th>
                <th className="px-6 py-3 border-b border-border text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {sources.map((source) => (
                <tr
                  key={source.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <FileText className="size-4 text-primary-500 shrink-0" />
                    <span
                      className="truncate max-w-50 sm:max-w-xs font-semibold text-foreground"
                      title={source.title || source.filename}
                    >
                      {source.title || source.filename}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs capitalize">
                    {source.fileType}
                  </td>
                  <td className="px-6 py-4">
                    {GetStatusBadge(source.status)}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {formatDate(source.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCopyId(source.id)}
                      className="p-1 rounded w-auto flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Copy Document ID"
                    >
                      {copiedId === source.id ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <div className="p-1 rounded w-auto flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                          <Trash2 className="size-4" />
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this document and all its
                            associated data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            variant="outline"
                            className="text-black"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(source.id)}
                            variant="destructive"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-sm text-muted-foreground"
                  >
                    No data sources found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages || 1} • {totalItems} total documents
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              className="h-8 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              className="h-8 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
