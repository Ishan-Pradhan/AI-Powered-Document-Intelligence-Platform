import { Message } from '../models/Messages.model';
import { Chat } from '../models/chats.model';
import { MessageInstance, MessageSource } from '../types/message.types';

export const messagesRepository = {
  create: (data: {
    chatId: string;
    role: 'user' | 'assistant';
    content: string;
    sourcesUsed?: MessageSource[];
  }) => {
    return Message.create(data);
  },

  findByChatId: async (chatId: string): Promise<MessageInstance[]> => {
    return await Message.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']],
    });
  },

  findByUserId: async (userId: string) => {
    return await Message.findAll({
      include: [
        {
          model: Chat,
          as: 'chat',
          where: { userId },
          attributes: [],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  },

  delete: async (id: string) => {
    return await Message.destroy({
      where: { id },
    });
  },
};
