import { chatsRepository } from '../../../repositories/chats.repository';
import { ApiError } from '../../ApiError';

export const assertChatOwnership = async (chatId: string, userId: string) => {
  const chat = await chatsRepository.findById(chatId);

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  if (chat.get('userId') !== userId) {
    throw new ApiError(403, 'Forbidden');
  }

  return chat;
};
