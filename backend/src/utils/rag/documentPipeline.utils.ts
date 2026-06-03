export const buildChunkRecords = (
  documentId: string,
  chunks: string[],
  embeddings: number[][],
) => {
  return chunks.map((text, index) => ({
    documentId,
    text,
    chunkIndex: index,
    embeddings: embeddings[index]?.length ? embeddings[index] : undefined,
  }));
};
