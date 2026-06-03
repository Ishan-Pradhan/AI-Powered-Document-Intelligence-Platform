import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { chatsRepository } from '../repositories/chats.repository';
import { generateAnswer } from '../services/ai.service';
import { messagesRepository } from '../repositories/messages.repository';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { retrieveContext } from '../utils/rag/chat/retrieveContext.utils';
import { assertChatOwnership } from '../utils/rag/chat/chatGuard.utils';
import { SemanticSearchResult } from '../types/rag.types';

// CHAT WITH DOCUMENT CONTEXT
export const chatWithDocument = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const { chatId, message, documentId } = req.body;

    if (!message) {
      throw new ApiError(400, 'message is required');
    }

    const userId = req.user?.id || null;
    // 1. create or reuse chat
    let activeChatId = chatId;

    if (!activeChatId) {
      const newChat = await chatsRepository.create({
        userId,
        title: message.trim().slice(0, 50),
      });

      activeChatId = newChat.get('id') as string;
    }

    // 2. store user message
    await messagesRepository.create({
      chatId: activeChatId,
      role: 'user',
      content: message,
    });

    // 3. history
    const historyRecords = await messagesRepository.findByChatId(activeChatId);

    const history = historyRecords.map((m) => ({
      role: m.get('role') as string,
      content: m.get('content') as string,
    }));

    // 4. RAG context retrieval
    const { matchedChunks, context } = (await retrieveContext(
      message,
      documentId,
    )) as {
      matchedChunks: SemanticSearchResult[];
      context: string;
    };

    // 5. LLM response
    const answer = await generateAnswer(message, context, history);

    // 6. sources
    const sourcesUsed = matchedChunks.map((c) => ({
      chunkId: c.id,
      textPreview: c.text.slice(0, 100),
      documentTitle: c.documentTitle || 'Unknown Document',
    }));

    // 7. store assistant message
    const savedAnswer = await messagesRepository.create({
      chatId: activeChatId,
      role: 'assistant',
      content: answer,
      sourcesUsed,
    });

    return res.status(200).json({
      success: true,
      chatId: activeChatId,
      answer: savedAnswer.get('content'),
      sourcesUsed: savedAnswer.get('sourcesUsed'),
    });
  },
);

// GET USERS CHAT
export const getUserChats = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    const chats = await chatsRepository.findPaginatedByUserId(userId);

    return ok(res, chats, 'User chats retrieved successfully');
  },
);

// DELETE CHAT
export const deleteChat = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    const { chatId } = req.params;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    await assertChatOwnership(chatId as string, userId);

    await chatsRepository.delete(chatId as string);

    return ok(res, null, 'Chat deleted successfully');
  },
);

// GET USERS MESSAGES
export const getUserMessages = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const messages = await messagesRepository.findByUserId(userId);
    return ok(res, messages, 'User messages retrieved successfully');
  },
);

// GET CHAT MESSAGES
export const getChatMessages = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const { chatId } = req.params;

    await assertChatOwnership(chatId as string, userId as string);

    const messages = await messagesRepository.findByChatId(chatId as string);

    return ok(res, messages, 'Chat messages retrieved successfully');
  },
);

// RENAME CHAT
export const renameChat = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const { chatId } = req.params;
    const { title } = req.body;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

    await assertChatOwnership(chatId as string, userId as string);

    await chatsRepository.updateTitle(chatId as string, title);

    return ok(res, null, 'Chat renamed successfully');
  },
);
