import { Model, Optional } from 'sequelize';

export interface MessageAttributes {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  sourcesUsed?: MessageSource[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageSource {
  chunkId: string;
  textPreview: string;
  documentTitle: string;
}

export type MessageCreationAttributes = Optional<
  MessageAttributes,
  'id' | 'sourcesUsed' | 'createdAt' | 'updatedAt'
>;

export type MessageInstance = Model<
  MessageAttributes,
  MessageCreationAttributes
> &
  MessageAttributes;
