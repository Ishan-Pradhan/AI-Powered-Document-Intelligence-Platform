import { Op } from 'sequelize';
import { User } from '../models/users.model';
import { Chat } from '../models/chats.model';
import { Message } from '../models/Messages.model';
import { Document } from '../models/documents.model';
import { Chunk } from '../models/chunks.model';
import { isDevelopment } from '../config/env';

export const cleanupGuestUsers = async () => {
  try {
    // 7 days in production/default, 1 minute in development
    const thresholdMs = isDevelopment ? 30 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const thresholdDate = new Date(Date.now() - thresholdMs);

    // Find all guest users created before the threshold
    const guestUsers = await User.findAll({
      where: {
        email: {
          [Op.like]: 'guest_%',
        },
        createdAt: {
          [Op.lt]: thresholdDate,
        },
      },
    });

    if (guestUsers.length === 0) {
      return;
    }

    console.log(`[Cron] Found ${guestUsers.length} guest users to clean up.`);

    for (const user of guestUsers) {
      const userId = user.id;

      // 1. Delete associated messages and chats
      const chats = await Chat.findAll({ where: { userId } });
      const chatIds = chats.map((c) => c.get('id') as string);

      if (chatIds.length > 0) {
        await Message.destroy({ where: { chatId: { [Op.in]: chatIds } } });
        await Chat.destroy({ where: { userId } });
      }

      // 2. Delete associated chunks and documents
      const docs = await Document.findAll({ where: { uploadedBy: userId } });
      const docIds = docs.map((d) => d.get('id') as string);

      if (docIds.length > 0) {
        await Chunk.destroy({ where: { documentId: { [Op.in]: docIds } } });
        await Document.destroy({ where: { uploadedBy: userId } });
      }

      // 3. Delete the user
      await User.destroy({ where: { id: userId } });
      console.log(`[Cron] Successfully deleted guest user: ${user.email}`);
    }
  } catch (error) {
    console.error('[Cron] Error running guest user cleanup job:', error);
  }
};

// Start the cron job interval
export const startCleanupJob = () => {
  // Run cleanup every minute in development, every hour in production
  const runIntervalMs = isDevelopment ? 60 * 1000 : 60 * 60 * 1000;

  console.log(`[Cron] Starting guest user cleanup cron job (running every ${runIntervalMs / 60000} minute(s)).`);

  // Run once immediately on start
  cleanupGuestUsers();

  setInterval(cleanupGuestUsers, runIntervalMs);
};
