import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { parseDocumentBuffer } from '../utils/rag/documentParser.utils';
import { documentsRepository } from '../repositories/documents.repository';
import { chunksRepository } from '../repositories/chunks.repository';
import { embedChunkTexts } from '../services/embedding.service';
import { splitTextIntoChunks } from '../utils/rag/chunker.utils';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiError } from '../utils/ApiError';

export const uploadDocument = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {
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
            const fileType = mimePart === 'plain' ? 'txt' : mimePart as string;
            const doc = await documentsRepository.create({
                title: title || file.originalname,
                filename: file.originalname,
                fileType,
                status: 'processing',
                uploadedBy
            });

            documentId = doc.get('id') as string;

            // 2. Parse File Buffer to text (Utility)
            const rawText = await parseDocumentBuffer(file.buffer, file.mimetype);

            // 3. Chunk text (Utility)
            const isTabular = file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') || file.mimetype.includes('csv');
            const textChunks = splitTextIntoChunks(rawText, isTabular);

            // 4. Generate Embeddings in Batch (Third-party Service)
            let embeddings: number[][] = [];
            try {
                embeddings = await embedChunkTexts(textChunks);
            } catch (err) {
                console.warn("Embeddings generation failed, proceeding with text-only chunks.", err);
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
                embeddings: embeddings[index] || null
            }));

            await chunksRepository.bulkCreate(chunkRecords);

            // 6. Complete status (Repository)
            await documentsRepository.updateStatus(currentDocumentId, 'ready');

            return res.status(201).json({
                success: true,
                message: 'Document parsed, chunked, and ingested successfully',
                documentId: currentDocumentId
            });
        } catch (error) {
            if (documentId) {
                await documentsRepository.updateStatus(documentId, 'failed').catch((statusError) => {
                    console.error('Failed to mark document as failed:', statusError);
                });
            }

            if (error instanceof ApiError) {
                throw error;
            }

            console.error('Upload document error:', error);
            throw new ApiError(500, 'Failed to upload document');
        }
   
});
