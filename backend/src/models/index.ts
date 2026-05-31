import { User } from './users.models';
import { Chat } from './chats.model';
import { Message } from './Messages.models';
import { Document } from './documents.models';
import { Chunk } from './chunks.models';

User.hasMany(Chat,   { foreignKey: 'userId', as: 'chats' });
Chat.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

Document.hasMany(Chat, { foreignKey: 'documentId', as: 'chats' });
Chat.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

Document.hasMany(Chunk, { foreignKey: 'documentId', as: 'chunks' });
Chunk.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
