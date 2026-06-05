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

const processQueue = (error: unknown, token: string | null = null) => {
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

    // Prevent infinite loop on refresh-access-token failure
    if (originalRequest.url?.includes("/api/v1/auth/refresh-access-token")) {
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
