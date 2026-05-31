import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export const Message = sequelize.define('Message', {
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
    }
}, {
    tableName: 'Messages',
    timestamps: true,
});