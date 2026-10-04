import axios from "axios";

const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const apiBaseUrl = normalizeBaseUrl(rawBaseUrl);

export const api = axios.create({
  baseURL: apiBaseUrl || undefined,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const buildApiUrl = (path: string) => {
  if (!apiBaseUrl) return path;
  return new URL(path, apiBaseUrl).toString();
};

// Response Interceptor for handling token expiration (401)
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, _token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT attempt token refresh on auth endpoints (login, register, forgot-password, etc.)
    // If these endpoints return 401, it means invalid credentials, not an expired access token.
    const requestUrl = originalRequest.url || "";
    const isAuthRoute =
      requestUrl.includes("/api/v1/auth/login") ||
      requestUrl.includes("/api/v1/auth/register") ||
      requestUrl.includes("/api/v1/auth/refresh-access-token") ||
      requestUrl.includes("/api/v1/auth/forgot-password") ||
      requestUrl.includes("/api/v1/auth/reset-password") ||
      requestUrl.includes("/api/v1/auth/resend-verification-email") ||
      requestUrl.includes("/api/v1/auth/guest") ||
      requestUrl.includes("/api/v1/auth/sso");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/v1/auth/refresh-access-token");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
