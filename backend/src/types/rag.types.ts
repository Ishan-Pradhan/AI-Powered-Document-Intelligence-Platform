export type ChunkMetadata = {
  pageNumber?: number;
  chunkIndex?: number;
  startChar?: number;
  endChar?: number;
  source?: string;
};

export type SemanticSearchResult = {
  id: string;
  text: string;
  documentId: string;
  documentTitle?: string;
  metadata?: ChunkMetadata;
};
