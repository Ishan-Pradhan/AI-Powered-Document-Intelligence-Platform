import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export const Chunk = sequelize.define('Chunk', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    documentId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    chunkIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    }
}, {
    tableName: 'Chunks',
    timestamps: true,
});
