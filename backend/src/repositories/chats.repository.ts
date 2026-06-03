import { Chat } from '../models/chats.model';

export const chatsRepository = {
  findById: (id: string) => {
    return Chat.findByPk(id);
  },

  create: (data: { id?: string; userId?: string | null; title?: string }) => {
    return Chat.create(data);
  },

  findPaginatedByUserId: (
    userId: string,
    options?: { limit?: number; offset?: number },
  ) => {
    const { limit, offset } = options || {};

    return Chat.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  },

  delete: (id: string) => {
    return Chat.destroy({
      where: { id },
    });
  },

  updateTitle: async (id: string, title: string) => {
    const chat = await Chat.findByPk(id);
    if (!chat) return null;

    await chat.update({ title });
    return chat;
  },
};
