import { Message } from "../models/Messages.model";
import { Chat } from "../models/chats.model";

export const messagesRepository = {
    // Save chat message
    create: async (data: { chatId: string; role: 'user' | 'assistant'; content: string; sourcesUsed?: any }) => {
        return await Message.create(data);
    },

    // Fetch conversation history
    findByChatId: async (chatId: string) => {
        return await Message.findAll({
            where: { chatId },
            order: [['createdAt', 'ASC']]
        });
    },

    // Fetch all messages belonging to a specific user
    findByUserId: async (userId: string) => {
        return await Message.findAll({
            include: [{
                model: Chat,
                as: 'chat',
                where: { userId },
                attributes: []
            }],
            order: [['createdAt', 'ASC']]
        });
    },

    // Delete message
    delete: async (id: string) => {
        return await Message.destroy({
            where: { id }
        });
    }
};
