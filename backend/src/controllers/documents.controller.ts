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
import { resolveFileType } from '../utils/rag/fileType.utils';
import { buildChunkRecords } from '../utils/rag/documentPipeline.utils';
import {
  buildPaginationMeta,
  getPaginationParams,
} from '../utils/pagination.utils';

export const uploadDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const file = req.file;
    const uploadedBy = req.user?.id;

    if (!file) {
      throw new ApiError(400, 'No file uploaded');
    }

    // 1. resolve type
    const fileType = resolveFileType(file) as
      | 'pdf'
      | 'docx'
      | 'txt'
      | 'csv'
      | 'xlsx'
      | 'xls';

    // 2. create document
    const doc = await documentsRepository.create({
      title: req.body.title || file.originalname,
      filename: file.originalname,
      fileType,
      status: 'processing',
      uploadedBy,
    });

    const documentId = doc.get('id') as string;

    try {
      // 3. parse
      const rawText = await parseDocumentBuffer(file.buffer, file.mimetype);

      // 4. chunk
      const chunks = splitTextIntoChunks(rawText, fileType === 'txt');

      // 5. embeddings
      const embeddings = chunks.length > 0 ? await embedChunkTexts(chunks) : [];

      // 6. build DB records
      const chunkRecords = buildChunkRecords(documentId, chunks, embeddings);

      await chunksRepository.bulkCreate(chunkRecords);

      // 7. finalize
      await documentsRepository.updateStatus(documentId, 'ready');

      return res.status(201).json({
        success: true,
        message: 'Document processed successfully',
        documentId,
      });
    } catch (error) {
      await documentsRepository
        .updateStatus(documentId, 'failed')
        .catch(() => {});

      throw new ApiError(500, 'Document processing failed');
    }
  },
);

export const getAllDocuments = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const search = String(req.query.search || '').trim();
    const { page, limit, offset } = getPaginationParams(req.query);

    const { rows: documents, count: totalItems } =
      await documentsRepository.findAndCountAll({
        limit,
        offset,
        search,
      });

    const meta = buildPaginationMeta({
      totalItems,
      page,
      limit,
      itemCount: documents.length,
    });

    return ok(
      res,
      {
        items: documents,
        meta,
      },
      'Documents retrieved successfully',
    );
  },
);

export const deleteDocument = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const { documentId } = req.params as { documentId: string };

    if (!documentId) {
      throw new ApiError(400, 'Document ID is required');
    }

    const document = await documentsRepository.findById(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    await documentsRepository.deleteDocument(documentId);

    return ok(res, null, 'Document deleted successfully');
  },
);
