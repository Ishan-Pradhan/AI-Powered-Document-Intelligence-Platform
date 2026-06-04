import type {
  ApiResponse,
  Chats,
  DB_Document,
  PaginatedResponse,
} from "@/types/ApiTypes";
import { api } from "./client";

export type ChatSource = {
  chunkId: string;
  textPreview: string;
  documentTitle: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  sourcesUsed?: ChatSource[];
  createdAt: string;
  updatedAt: string;
};

export type ChatThreadResponse = {
  chatId: string;
  answer: string;
  sourcesUsed: ChatSource[];
};

type ChatsResponse = Chats[] | { rows: Chats[] } | { items: Chats[] };

export const getChats = async (): Promise<Chats[]> => {
  const res = await api.get<ApiResponse<ChatsResponse>>("/api/v1/chat/chats");
  const data = res.data.data;

  if (!data) return [];

  if (Array.isArray(data)) return data;

  if ("rows" in data) return data.rows;

  if ("items" in data) return data.items;
  return [];
};

export const deleteChat = async (chatId: string) => {
  await api.delete(`/api/v1/chat/chats/${chatId}`);
};

export const renameChat = async (chatId: string, title: string) => {
  await api.patch(`/api/v1/chat/chats/${chatId}`, { title });
};

export const getChatMessages = async (
  chatId: string,
): Promise<ChatMessage[]> => {
  const res = await api.get<ApiResponse<ChatMessage[]>>(
    `/api/v1/chat/chats/${chatId}/messages`,
  );
  return res.data.data ?? [];
};

// Removed deleteMessage and deleteUserMessage functions

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/api/v1/chat/documents/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
};

export const getAllDocuments = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<DB_Document>> => {
  const { page = 1, limit = 10, search = "" } = options || {};
  const res = await api.get<ApiResponse<PaginatedResponse<DB_Document>>>(
    "/api/v1/chat/documents",
    {
      params: { page, limit, search },
    },
  );
  return res.data.data;
};

export const deleteDocument = async (documentId: string) => {
  await api.delete(`/api/v1/chat/documents/${documentId}`);
};

export const sendChatMessage = async (payload: {
  message: string;
  chatId?: string;
  documentId?: string;
}): Promise<ChatThreadResponse> => {
  const res = await api.post<ApiResponse<ChatThreadResponse>>(
    "/api/v1/chat/chats",
    payload,
  );
  return res.data as unknown as ChatThreadResponse;
};
