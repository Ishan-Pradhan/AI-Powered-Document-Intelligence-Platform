import { sequelize } from '../config/db';
import { Chunk } from '../models/chunks.model';
import { Document } from '../models/documents.model';
import { DEFAULT_VECTOR_SEARCH_LIMIT } from '../constants';
import { QueryTypes } from 'sequelize';

type SemanticSearchResult = {
  id: string;
  text: string;
  documentId: string;
  metadata: unknown;
  documentTitle: string | null;
};

export const chunksRepository = {
  bulkCreate: async (
    chunks: {
      documentId: string;
      text: string;
      chunkIndex: number;
      embeddings?: number[] | null;
    }[],
  ) => {
    return await Chunk.bulkCreate(chunks);
  },

  // Retrieve raw chunks matching the filter options
  findChunksByDocumentId: (
    documentId?: string,
    limit = DEFAULT_VECTOR_SEARCH_LIMIT,
  ) => {
    const whereClause: { documentId?: string } = {};
    if (documentId) {
      whereClause.documentId = documentId;
    }

    return Chunk.findAll({
      where: whereClause,
      include: [
        {
          model: Document,
          as: 'document',
          attributes: ['title'],
        },
      ],
      limit,
      order: [['createdAt', 'ASC']],
    });
  },

  // Performs Cosine Similarity query comparing chunk vectors with user question vector

  searchSemantic: async (
    queryEmbedding: number[],
    documentId?: string,
    limit = DEFAULT_VECTOR_SEARCH_LIMIT,
  ): Promise<SemanticSearchResult[]> => {
    if (!queryEmbedding.length) {
      throw new Error('Query embedding cannot be empty');
    }

    const documentFilter = documentId ? `AND c."documentId" = :documentId` : '';

    const vectorStr = `[${queryEmbedding.join(',')}]`;

    const results = await sequelize.query<SemanticSearchResult>(
      `
      SELECT c.id, c.text, c."documentId", c.metadata, d.title as "documentTitle"
      FROM "Chunks" c
      LEFT JOIN "Documents" d ON c."documentId" = d.id
      WHERE c.embeddings IS NOT NULL ${documentFilter}
      ORDER BY c.embeddings <=> :vectorStr::vector
      LIMIT :limit
    `,
      {
        replacements: { documentId, limit, vectorStr },
        type: QueryTypes.SELECT,
      },
    );
    return results;
  },
};
