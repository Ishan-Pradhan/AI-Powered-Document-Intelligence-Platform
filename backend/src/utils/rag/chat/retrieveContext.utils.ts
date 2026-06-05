import { DEFAULT_VECTOR_SEARCH_LIMIT } from '../../../constants';
import { chunksRepository } from '../../../repositories/chunks.repository';
import { embedQueryText } from '../../../services/embedding.service';

export const retrieveContext = async (message: string, documentId?: string) => {
  type MatchedChunk =
    | Awaited<ReturnType<typeof chunksRepository.searchSemantic>>[number]
    | Awaited<ReturnType<typeof chunksRepository.findChunksByDocumentId>>[number];

  let matchedChunks: MatchedChunk[] = [];

  try {
    const queryVector = await embedQueryText(message);

    matchedChunks = await chunksRepository.searchSemantic(
      queryVector,
      documentId,
      DEFAULT_VECTOR_SEARCH_LIMIT,
    );

    if (!matchedChunks.length) {
      matchedChunks = await chunksRepository.findChunksByDocumentId(
        documentId,
        DEFAULT_VECTOR_SEARCH_LIMIT,
      );
    }
  } catch (err) {
    matchedChunks = await chunksRepository.findChunksByDocumentId(
      documentId,
      DEFAULT_VECTOR_SEARCH_LIMIT,
    );
  }

  const context = matchedChunks.map((c) => (c as { text: string }).text).join('\n\n---\n\n');

  return { matchedChunks, context };
};
