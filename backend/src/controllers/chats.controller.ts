import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { chatsRepository } from '../repositories/chats.repository';
import { chunksRepository } from '../repositories/chunks.repository';
import { generateAnswer } from '../services/ai.service';
import { messagesRepository } from '../repositories/messages.repository';
import { embedQueryText } from '../services/embedding.service';
import { DEFAULT_VECTOR_SEARCH_LIMIT } from '../constants';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';

export const chatWithDocument = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {
   
        const { chatId, message, documentId } = req.body;

        if (!message) {
            throw new ApiError(400, 'message is required');
        }

        let activeChatId = chatId;
        let activeDocumentId = documentId;

        if (!activeChatId) {
            const userId = req.user?.id || null;
            const newChat = await chatsRepository.create({
                userId,
                title: 'New Conversation',
                documentId: activeDocumentId || null
            });
            activeChatId = newChat.get('id') as string;
        } else {
            // Ensure chat row exists (FK constraint)
            const existingChat = await chatsRepository.findById(activeChatId);
            if (!existingChat) {
                const userId = req.user?.id || null;
                await chatsRepository.create({
                    id: activeChatId,
                    userId,
                    title: 'New Conversation',
                    documentId: activeDocumentId || null
                });
            } else {
                // Resolve documentId from the chat record if not provided in the request
                if (!activeDocumentId) {
                    activeDocumentId = existingChat.get('documentId') as string;
                }
            }
        }

        // 1. Save user query message to database (Repository)
        await messagesRepository.create({
            chatId: activeChatId,
            role: 'user',
            content: message
        });

        // 2. Fetch conversational history (Repository)
        const historyRecords = await messagesRepository.findByChatId(activeChatId);
        const history = historyRecords.map(m => ({
            role: m.get('role') as string,
            content: m.get('content') as string
        }));

        // 3. Search Semantic Chunks for Context (Embed query -> search)
        let context = '';
        let matchedChunks: any[] = [];
        try {
            const queryVector = await embedQueryText(message);
            matchedChunks = await chunksRepository.searchSemantic(queryVector, activeDocumentId, DEFAULT_VECTOR_SEARCH_LIMIT);

            // Fallback if semantic search returned 0 results (e.g., older documents with null embeddings)
            if (!matchedChunks || matchedChunks.length === 0) {
                console.warn("Semantic search returned 0 results, falling back to raw chunks.");
                matchedChunks = await chunksRepository.findChunksByDocumentId(activeDocumentId, DEFAULT_VECTOR_SEARCH_LIMIT);
            }

            context = matchedChunks.map(c => c.text).join('\n\n---\n\n');
        } catch (err) {
            // Fallback if semantic search fails entirely
            console.warn("Semantic search failed, fetching raw chunks.", err);
            matchedChunks = await chunksRepository.findChunksByDocumentId(activeDocumentId, DEFAULT_VECTOR_SEARCH_LIMIT);
            context = matchedChunks.map(c => c.text).join('\n\n---\n\n');
        }

        // 4. Generate Answer using LangChain ai service
        const answer = await generateAnswer(message, context, history);

        // 5. Track source references used to answer
        const sourcesUsed = matchedChunks.map(c => {
            const docTitle = c.documentTitle || (c.document ? c.document.title : 'Unknown Document');
            return {
                chunkId: c.id,
                textPreview: c.text.substring(0, 100) + '...',
                documentTitle: docTitle
            };
        });

        // 6. Save assistant answer to database (Repository)
        const savedAnswer = await messagesRepository.create({
            chatId: activeChatId,
            role: 'assistant',
            content: answer,
            sourcesUsed
        });

        // Extract stored fields safely
        const answerContent = savedAnswer.get('content') as string;
        const storedSources = savedAnswer.get('sourcesUsed') as { chunkId: string, textPreview: string, documentTitle: string }[];

        return res.status(200).json({
            success: true,
            chatId: activeChatId,
            answer: answerContent,
            sourcesUsed: storedSources
        });

});

export const getUserChats = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {

        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(401, 'Unauthorized');
        }
        const chats = await chatsRepository.findAllByUserId(userId);
        return ok(res, chats, "User chats retrieved successfully");
   
});

export const deleteChat = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {
  
        const userId = req.user?.id;
        const { chatId } = req.params;
        if (!userId) {
            throw new ApiError(401, 'Unauthorized');
        }

        const chat = await chatsRepository.findById(chatId as string);
        if (!chat) {
            throw new ApiError(404, 'Chat not found');
        }

        if (chat.get('userId') !== userId) {
            throw new ApiError(403, 'Forbidden');
        }

        await chatsRepository.delete(chatId as string);
        return ok(res, null, 'Chat deleted successfully');
    
});

export const getUserMessages = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {
        const userId = req.user?.id;

        if (!userId) {
            throw new ApiError(401, 'Unauthorized');
        }

        const messages = await messagesRepository.findByUserId(userId);
        return ok(res, messages, "User messages retrieved successfully");
});

export const deleteMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {

        const userId = req.user?.id;
        const { messageId } = req.params;
        if (!userId) {
            throw new ApiError(401, 'Unauthorized');
        }

        const messages = await messagesRepository.findByUserId(userId);
        const messageExists = messages.some(m => m.get('id') === messageId);
        if (!messageExists) {
            throw new ApiError(404, 'Message not found or not owned by user');
        }

        await messagesRepository.delete(messageId as string);
        return ok(res, null, 'Message deleted successfully');
});

export const getChatMessages = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {

        const userId = req.user?.id;
        const { chatId } = req.params;
        if (!userId) {
            throw new ApiError(401, 'Unauthorized');
        }

        const chat = await chatsRepository.findById(chatId as string);
        if (!chat) {
            throw new ApiError(404, 'Chat not found');
        }

        if (chat.get('userId') !== userId) {
            throw new ApiError(403, 'Forbidden');
        }

        const messages = await messagesRepository.findByChatId(chatId as string);
        return ok(res, messages, "Chat messages retrieved successfully");

});

export const renameChat = asyncHandler(async (req: AuthRequest, res: Response): Promise<Response> => {
  
        const userId = req.user?.id;
        const { chatId } = req.params;
        const { title } = req.body;

        if (!userId) {
            throw new ApiError(401, 'Unauthorized');
        }
        if (!title) {
            throw new ApiError(400, 'Title is required');
        }

        const chat = await chatsRepository.findById(chatId as string);
        if (!chat) {
            throw new ApiError(404, 'Chat not found');
        }

        if (chat.get('userId') !== userId) {
            throw new ApiError(403, 'Forbidden');
        }

        await chatsRepository.updateTitle(chatId as string, title);
        return ok(res, null, 'Chat renamed successfully');
});
