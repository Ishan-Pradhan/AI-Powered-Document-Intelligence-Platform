import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadDocumentModal from "@/components/knowledgeBase/UploadDocumentModal";
import { SyncSummaryCards } from "@/components/knowledgeBase/SyncSummaryCards";
import { DocumentTable } from "@/components/knowledgeBase/DocumentTable";
import { useKnowledgeBase } from "@/hooks/knowledgeBase/useKnowledgeBase";
import { KnowledgeBaseSkeleton } from "@/components/knowledgeBase/KnowledgeBaseSkeleton";

export default function KnowledgeBasePage() {
  const {
    sources,
    meta,
    readyCount,
    processingCount,
    isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    isModalOpen,
    setIsModalOpen,
    handleDelete,
  } = useKnowledgeBase();

  if (isLoading) {
    return <KnowledgeBaseSkeleton />;
  }

  if (sources.length === 0 && !searchQuery) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background p-8 text-foreground">
        <FileText className="size-10 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No documents found</h2>
        <p className="text-sm text-muted-foreground">
          Upload documents to populate your knowledge base and enable smarter AI
          interactions.
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 h-10 rounded-md bg-primary-500 text-white font-medium text-sm transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Document
        </Button>
        <UploadDocumentModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 text-foreground">
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingest documents and sync data sources into the system vector
              index.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 h-10 rounded-md bg-primary-500 text-white font-medium text-sm transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Add Document
          </Button>
        </div>

        <SyncSummaryCards
          totalItems={meta.totalItems}
          readyCount={readyCount}
          processingCount={processingCount}
        />

        <DocumentTable
          sources={sources}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onDelete={handleDelete}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
        />
      </div>

      <UploadDocumentModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
