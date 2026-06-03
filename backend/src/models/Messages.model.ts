import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { MessageInstance } from '../types/message.types';

export const Message = sequelize.define<MessageInstance>(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sourcesUsed: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: 'Messages',
    timestamps: true,
  },
);
