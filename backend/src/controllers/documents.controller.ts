import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { parseDocumentBuffer } from '../utils/rag/documentParser.utils';
import { documentsRepository } from '../repositories/documents.repository';
import { chunksRepository } from '../repositories/chunks.repository';
import { embedChunkTexts } from '../services/embedding.service';
import { splitTextIntoChunks } from '../utils/rag/chunker.utils';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';

export const uploadDocument = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const { title } = req.body;
    const uploadedBy = req.user?.id || undefined;
    const file = req.file;
    let documentId: string | undefined;

    if (!file) {
      throw new ApiError(400, 'No file uploaded');
    }

    try {
      // 1. Create document in database (pure CRUD)
      const mimePart = file.mimetype.split('/')[1];
      let fileType = 'txt';
      if (file.mimetype === 'application/pdf') {
        fileType = 'pdf';
      } else if (
        file.originalname.endsWith('.docx') ||
        file.mimetype ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        fileType = 'docx';
      } else if (
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')
      ) {
        // Map spreadsheets/CSVs to 'txt' in DB since we parse them to structured text
        fileType = 'txt';
      }

      const doc = await documentsRepository.create({
        title: title || file.originalname,
        filename: file.originalname,
        fileType,
        status: 'processing',
        uploadedBy,
      });

      documentId = doc.get('id') as string;

      // 2. Parse File Buffer to text (Utility)
      const rawText = await parseDocumentBuffer(file.buffer, file.mimetype);

      // 3. Chunk text (Utility)
      const isTabular =
        file.mimetype.includes('excel') ||
        file.mimetype.includes('spreadsheet') ||
        file.mimetype.includes('csv');
      const textChunks = splitTextIntoChunks(rawText, isTabular);

      // 4. Generate Embeddings in Batch (Third-party Service)
      let embeddings: number[][] = [];
      if (textChunks.length > 0) {
        try {
          embeddings = await embedChunkTexts(textChunks);
          // Validate count matches and all vectors have dimensions
          if (!embeddings || embeddings.length !== textChunks.length) {
            throw new Error(
              `Embedding model returned ${embeddings?.length ?? 0} vectors for ${textChunks.length} chunks`,
            );
          }
          const emptyIndex = embeddings.findIndex((e) => !e || e.length === 0);
          if (emptyIndex !== -1) {
            throw new Error(
              `Vector at index ${emptyIndex} is empty/falsy. Total returned: ${embeddings.length}`,
            );
          }
        } catch (err) {
          console.error('Embeddings generation failed:', err);
          throw new ApiError(
            500,
            `Failed to generate embeddings for document: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      // 5. Save Chunks to Database (Repository)
      if (!documentId) {
        throw new ApiError(500, 'Failed to create document record');
      }

      const currentDocumentId = documentId;
      const chunkRecords = textChunks.map((text, index) => ({
        documentId: currentDocumentId,
        text,
        chunkIndex: index,
        // Use the embedding if valid, otherwise undefined so Sequelize omits the column
        embeddings:
          embeddings[index] && embeddings[index].length > 0
            ? embeddings[index]
            : undefined,
      }));

      await chunksRepository.bulkCreate(chunkRecords);

      // 6. Complete status (Repository)
      await documentsRepository.updateStatus(currentDocumentId, 'ready');

      return res.status(201).json({
        success: true,
        message: 'Document parsed, chunked, and ingested successfully',
        documentId: currentDocumentId,
      });
    } catch (error) {
      if (documentId) {
        await documentsRepository
          .updateStatus(documentId, 'failed')
          .catch((statusError) => {
            console.error('Failed to mark document as failed:', statusError);
          });
      }

      if (error instanceof ApiError) {
        throw error;
      }

      console.error('Upload document error:', error);
      throw new ApiError(500, 'Failed to upload document');
    }
  },
);

export const getAllDocuments = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    const { rows: documents, count: totalItems } = await documentsRepository.findAndCountAll({
      limit,
      offset,
      search
    });

    const totalPages = Math.ceil(totalItems / limit);

    return ok(res, {
      items: documents,
      meta: {
        totalItems,
        itemCount: documents.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page
      }
    }, 'Documents retrieved successfully');
  },
);

export const deleteDocument = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    const { documentId } = req.params as { documentId: string };
    const document = await documentsRepository.findById(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }
    await documentsRepository.deleteDocument(documentId);
    return ok(res, null, 'Document deleted successfully');
  },
);
