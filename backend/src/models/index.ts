import { User } from './users.model';
import { Chat } from './chats.model';
import { Message } from './Messages.model';
import { Document } from './documents.model';
import { Chunk } from './chunks.model';

User.hasMany(Chat,   { foreignKey: 'userId', as: 'chats' });
Chat.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

Document.hasMany(Chat, { foreignKey: 'documentId', as: 'chats' });
Chat.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

Document.hasMany(Chunk, { foreignKey: 'documentId', as: 'chunks' });
Chunk.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
