import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDocument, getAllDocuments } from "@/api/chat";
import type { DB_Document, PaginatedResponse } from "@/types/ApiTypes";

const LIMIT = 10;

export function useKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ["documents", currentPage, searchQuery],
    queryFn: () => getAllDocuments({ page: currentPage, limit: LIMIT, search: searchQuery }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: (_, id) => {
      queryClient.setQueryData<PaginatedResponse<DB_Document>>(
        ["documents", currentPage, searchQuery],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((doc) => doc.id !== id),
            meta: {
              ...old.meta,
              totalItems: Math.max(0, old.meta.totalItems - 1),
            },
          };
        },
      );
    },
  });

  const sources = documentsQuery.data?.items ?? [];
  const meta = documentsQuery.data?.meta ?? { totalItems: 0, totalPages: 1 };

  const readyCount = sources.filter((s) => s.status === "ready").length;
  const processingCount = sources.filter(
    (s) => s.status === "processing" || s.status === "pending",
  ).length;

  const handleDelete = (id: string) => deleteMutation.mutate(id);

  return {
    sources,
    meta,
    readyCount,
    processingCount,
    isLoading: documentsQuery.isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    isModalOpen,
    setIsModalOpen,
    handleDelete,
  };
}
