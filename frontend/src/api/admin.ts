import type {
  AdminUser,
  ApiResponse,
  PaginatedResponse,
} from "@/types/ApiTypes";
import { api } from "./client";

export const getAllUsers = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<AdminUser>> => {
  const { page = 1, limit = 10, search = "" } = options || {};
  const res = await api.get<ApiResponse<PaginatedResponse<AdminUser>>>(
    "/api/v1/admin/users",
    {
      params: { page, limit, search },
    },
  );
  return res.data.data;
};

export const toggleBlockUser = async (userId: string): Promise<void> => {
  await api.patch(`/api/v1/admin/toggle-block/${userId}`);
};

export const changeOwnPassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await api.post("/api/v1/auth/change-password", payload);
};

export const getUserStats = async (): Promise<{
  totalUsers: number;
  blockedUsers: number;
  adminUsers: number;
}> => {
  const res = await api.get<
    ApiResponse<{
      totalUsers: number;
      blockedUsers: number;
      adminUsers: number;
    }>
  >("/api/v1/admin/stats");
  return res.data.data;
};
