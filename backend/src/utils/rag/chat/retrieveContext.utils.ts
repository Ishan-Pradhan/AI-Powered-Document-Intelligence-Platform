import { DEFAULT_VECTOR_SEARCH_LIMIT } from '../../../constants';
import { chunksRepository } from '../../../repositories/chunks.repository';
import { embedQueryText } from '../../../services/embedding.service';

export const retrieveContext = async (message: string, documentId?: string) => {
  let matchedChunks = [];

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

  const context = matchedChunks.map((c: any) => c.text).join('\n\n---\n\n');

  return { matchedChunks, context };
};
