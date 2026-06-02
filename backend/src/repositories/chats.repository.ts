import { Chat } from '../models/chats.model';

export const chatsRepository = {
    findById: async (id: string) => {
        return await Chat.findByPk(id);
    },

    create: async (data: { id?: string; userId?: string | null; title?: string }) => {
        return await Chat.create(data);
    },

    findAllByUserId: async (userId: string, options?: { limit?: number; offset?: number }) => {
        const { limit, offset } = options || {};
        return await Chat.findAll({
            where: { userId },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    },

    findAndCountAllByUserId: async (userId: string, options?: { limit?: number; offset?: number }) => {
        const { limit, offset } = options || {};
        return await Chat.findAndCountAll({
            where: { userId },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    },

    delete: async (id: string) => {
        return await Chat.destroy({
            where: { id }
        });
    },

    updateTitle: async (id: string, title: string) => {
        return await Chat.update({ title }, { where: { id } });
    }
};