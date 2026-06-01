import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { chatsRepository } from '../repositories/chats.repository';
import { chunksRepository } from '../repositories/chunks.repository';
import { generateAnswer } from '../services/ai.service';
import { messagesRepository } from '../repositories/messages.repository';
import { embedQueryText } from '../services/embedding.service';
import { DEFAULT_VECTOR_SEARCH_LIMIT } from '../constants';

export const chatWithDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { chatId, message, documentId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'message is required' });
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
    } catch (error: any) {
        console.error("Chat error:", error);
        return res.status(500).json({ error: 'Failed to process chat response' });
    }
};

export const getUserChats = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const chats = await chatsRepository.findAllByUserId(userId);
        return res.status(200).json({ success: true, chats });
    } catch (error: any) {
        console.error("Get user chats error:", error);
        return res.status(500).json({ error: 'Failed to fetch chats' });
    }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.id;
        const { chatId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const chat = await chatsRepository.findById(chatId as string);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (chat.get('userId') !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await chatsRepository.delete(chatId as string);
        return res.status(200).json({ success: true, message: 'Chat deleted successfully' });
    } catch (error: any) {
        console.error("Delete chat error:", error);
        return res.status(500).json({ error: 'Failed to delete chat' });
    }
};

export const getUserMessages = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const messages = await messagesRepository.findByUserId(userId);
        return res.status(200).json({ success: true, messages });
    } catch (error: any) {
        console.error("Get user messages error:", error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.id;
        const { messageId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const messages = await messagesRepository.findByUserId(userId);
        const messageExists = messages.some(m => m.get('id') === messageId);
        if (!messageExists) {
            return res.status(404).json({ error: 'Message not found or not owned by user' });
        }

        await messagesRepository.delete(messageId as string);
        return res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error: any) {
        console.error("Delete message error:", error);
        return res.status(500).json({ error: 'Failed to delete message' });
    }
};

export const getChatMessages = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.id;
        const { chatId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const chat = await chatsRepository.findById(chatId as string);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (chat.get('userId') !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const messages = await messagesRepository.findByChatId(chatId as string);
        return res.status(200).json({ success: true, messages });
    } catch (error: any) {
        console.error("Get chat messages error:", error);
        return res.status(500).json({ error: 'Failed to fetch messages for this chat' });
    }
};

export const renameChat = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.id;
        const { chatId } = req.params;
        const { title } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const chat = await chatsRepository.findById(chatId as string);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (chat.get('userId') !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await chatsRepository.updateTitle(chatId as string, title);
        return res.status(200).json({ success: true, message: 'Chat renamed successfully' });
    } catch (error: any) {
        console.error("Rename chat error:", error);
        return res.status(500).json({ error: 'Failed to rename chat' });
    }
};
