export type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export type AuthUserDto = {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
}

export interface Chats {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isVerified: boolean;
  isBlocked: boolean;
  authProvider: "local" | "google" | "github";
  avatarUrl?: string;
  createdAt: string;
}


export interface DB_Document {
  id: string;
  title: string;
  filename: string;
  fileType: string;
  status: "pending" | "processing" | "ready" | "failed";
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}


