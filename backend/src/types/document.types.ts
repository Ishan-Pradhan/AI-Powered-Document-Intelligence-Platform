import { Model, Optional } from 'sequelize';

export interface DocumentAttributes {
  id: string;
  title: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'xls';
  status: 'pending' | 'processing' | 'ready' | 'failed';
  uploadedBy: string | null;
  metadata: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DocumentCreationAttributes = Optional<
  DocumentAttributes,
  'id' | 'status' | 'uploadedBy' | 'metadata' | 'createdAt' | 'updatedAt'
>;

export type DocumentInstance = Model<
  DocumentAttributes,
  DocumentCreationAttributes
> &
  DocumentAttributes;
