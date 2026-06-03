import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID');

const titleOptional = z
  .string()
  .trim()
  .min(1, 'Title cannot be empty')
  .max(200, 'Title is too long')
  .optional();

export const uploadDocumentSchema = {
  body: z.object({
    title: titleOptional,
  }),
};

export const chatWithDocumentSchema = {
  body: z.object({
    chatId: uuid.optional(),
    documentId: uuid.optional(),
    message: z.string().trim().min(1).max(8000),
  }),
};

export const chatIdParamsSchema = {
  params: z.object({
    chatId: uuid,
  }),
};

export const renameChatSchema = {
  params: z.object({
    chatId: uuid,
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title is too long'),
  }),
};

export const messageIdParamsSchema = {
  params: z.object({
    messageId: uuid,
  }),
};

export const toggleBlockUserSchema = {
  params: z.object({
    id: uuid,
  }),
};

export const documentQuerySchema = {
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
  }),
};

export const getAllUsersSchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
  }),
};

export const deleteDocumentSchema = {
  params: z.object({
    documentId: uuid,
  }),
};

export const chatQuerySchema = {
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  }),
};

export const messageQuerySchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};
