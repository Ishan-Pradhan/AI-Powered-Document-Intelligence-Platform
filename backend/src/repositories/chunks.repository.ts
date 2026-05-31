import { sequelize } from "../config/db";
import { Chunk } from "../models/chunks.models";
import { Document } from "../models/documents.models";
import { DEFAULT_VECTOR_SEARCH_LIMIT } from "../constants";

export const chunksRepository = {
    // Bulk create pre-split chunks into the database
    bulkCreate: async (chunks: { documentId: string; text: string; chunkIndex: number; embeddings?: number[] | null }[]) => {
        return await Chunk.bulkCreate(chunks);
    },

    // Retrieve raw chunks matching the filter options
    findChunksByDocumentId: async (documentId?: string, limit = DEFAULT_VECTOR_SEARCH_LIMIT) => {
        const whereClause: any = {};
        if (documentId) {
            whereClause.documentId = documentId;
        }

        return await Chunk.findAll({
            where: whereClause,
            include: [{
                model: Document,
                as: 'document',
                attributes: ['title']
            }],
            limit,
            order: [['createdAt', 'ASC']],
        });
    },

    /**
     * Performs Cosine Similarity query comparing chunk vectors with user question vector
     */
    searchSemantic: async (queryEmbedding: number[], documentId?: string, limit = DEFAULT_VECTOR_SEARCH_LIMIT): Promise<any[]> => {
        const documentFilter = documentId ? `AND c."documentId" = :documentId` : '';
        const vectorStr = `[${queryEmbedding.join(',')}]`;

        const results = await sequelize.query(`
      SELECT c.id, c.text, c."documentId", c.metadata, d.title as "documentTitle"
      FROM "Chunks" c
      LEFT JOIN "Documents" d ON c."documentId" = d.id
      WHERE c.embeddings IS NOT NULL ${documentFilter}
      ORDER BY c.embeddings <=> :vectorStr::vector
      LIMIT :limit
    `, {
            replacements: { documentId, limit, vectorStr },
            type: 'SELECT'
        });
        return results;
    }
};
