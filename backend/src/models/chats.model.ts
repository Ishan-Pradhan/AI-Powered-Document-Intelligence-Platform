import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
export const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        defaultValue: 'New Conversation',
    }
}, {
    tableName: 'Chats',
    timestamps: true,
});