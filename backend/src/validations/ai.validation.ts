import { z } from "zod";

const uuid = z.string().uuid("Invalid UUID");

const titleOptional = z
  .string()
  .trim()
  .min(1, "Title cannot be empty")
  .max(200, "Title is too long")
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
    message: z
      .string()
      .trim()
      .min(1, "message is required")
      .max(8000, "message is too long"),
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
      .min(1, "Title is required")
      .max(120, "Title is too long"),
  }),
};

export const messageIdParamsSchema = {
  params: z.object({
    messageId: uuid,
  }),
};
