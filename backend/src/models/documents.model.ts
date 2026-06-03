import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { DocumentInstance } from '../types/document.types';

export const Document = sequelize.define<DocumentInstance>(
  'Document',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM('pdf', 'docx', 'txt', 'csv', 'xlsx', 'xls'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'ready', 'failed'),
      defaultValue: 'pending',
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: 'Documents',
    timestamps: true,
  },
);
