import { CHUNK_SIZE, OVERLAP, ROWS_PER_CHUNK } from "../../constants";

// Splitting text into arrays of strings ready to be stored in the database.
export const splitTextIntoChunks = (text: string, isTabular = false): string[] => {
    const chunks: string[] = [];

    if (isTabular) {
        // Grouping spreadsheet data by rows to preserve table layout structure
        const rows = text.split('\n').filter(line => line.trim().length > 0);
        const rowsPerChunk = ROWS_PER_CHUNK;

        for (let i = 0; i < rows.length; i += rowsPerChunk) {
            chunks.push(rows.slice(i, i + rowsPerChunk).join('\n'));
        }
    } else {
        // Standard sliding character window for PDF, Word, Markdown, and TXT files
        const chunkSize = CHUNK_SIZE;
        const overlap = OVERLAP;
        let i = 0;

        while (i < text.length) {
            chunks.push(text.slice(i, i + chunkSize));
            i += (chunkSize - overlap);
        }
    }

    return chunks;
};
