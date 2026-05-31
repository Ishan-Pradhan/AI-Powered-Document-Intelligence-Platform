import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { parseDocumentBuffer } from '../utils/rag/documentParser.utils';
import { documentsRepository } from '../repositories/documents.repository';
import { chunksRepository } from '../repositories/chunks.repository';
import { embedChunkTexts } from '../services/embedding.service';
import { splitTextIntoChunks } from '../utils/rag/chunker.utils';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { title } = req.body;
        const uploadedBy = req.user?.id || undefined;  // Always from JWT, never from body
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

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

        const documentId = doc.get('id') as string;
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
        const chunkRecords = textChunks.map((text, index) => ({
            documentId: documentId,
            text,
            chunkIndex: index,
            embeddings: embeddings[index] || null
        }));

        await chunksRepository.bulkCreate(chunkRecords);

        // 6. Complete status (Repository)
        await documentsRepository.updateStatus(documentId, 'ready');

        return res.status(201).json({
            success: true,
            message: 'Document parsed, chunked, and ingested successfully',
            documentId: documentId
        });
    } catch (error: any) {
        console.error("Document ingestion error:", error);
        return res.status(500).json({ error: 'Failed to process and ingest document' });
    }
};
