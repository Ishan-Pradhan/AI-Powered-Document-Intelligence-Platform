import { CHUNK_SIZE, OVERLAP, ROWS_PER_CHUNK } from '../../constants';

/**
 * Splits text into RAG-ready chunks
 */
export const splitTextIntoChunks = (
  text: string,
  isTabular = false,
): string[] => {
  if (!text || !text.trim()) return [];

  const chunks: string[] = [];

  /**
   * TABULAR DATA (CSV / Excel)
   */
  if (isTabular) {
    const rows = text
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const header = rows[0]; // assume first row is header
    const dataRows = rows.slice(1);

    for (let i = 0; i < dataRows.length; i += ROWS_PER_CHUNK) {
      const chunkRows = dataRows.slice(i, i + ROWS_PER_CHUNK);

      // Repeat header for context in every chunk
      const chunk = [header, ...chunkRows].join('\n');
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * TEXT DATA (PDF / DOCX / TXT)
   * Sentence-aware chunking (better than raw slicing)
   */
  const sentences =
    text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > CHUNK_SIZE) {
      chunks.push(currentChunk.trim());
      currentChunk = currentChunk.slice(-OVERLAP) + ' ' + sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};
