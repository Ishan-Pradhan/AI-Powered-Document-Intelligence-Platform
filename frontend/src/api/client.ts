import axios from "axios"

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ""

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim()
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed
}

export const apiBaseUrl = normalizeBaseUrl(rawBaseUrl)

export const api = axios.create({
  baseURL: apiBaseUrl || undefined,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export const buildApiUrl = (path: string) => {
  if (!apiBaseUrl) return path
  return new URL(path, apiBaseUrl).toString()
}
