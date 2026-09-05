import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/auth-store"
import type { ApiError, AuthResponse } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export class ApiClientError extends Error {
  status: number
  payload: ApiError | null
  constructor(status: number, payload: ApiError | null, message: string) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
    _retried?: boolean
  }
}

export const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken && !config.skipAuth) {
    config.headers.set("Authorization", `Bearer ${accessToken}`)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        useAuthStore.getState().setSession(data)
        return data.accessToken
      })
      .catch(() => {
        useAuthStore.getState().clearSession()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const config = error.config as InternalAxiosRequestConfig & {
      skipAuth?: boolean
      _retried?: boolean
    }

    if (
      error.response?.status === 401 &&
      !config.skipAuth &&
      !config._retried
    ) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        config._retried = true
        return http(config)
      }
      return Promise.reject(
        new ApiClientError(401, null, "Session expired. Please sign in again.")
      )
    }

    const payload = error.response?.data ?? null
    const message = Array.isArray(payload?.message)
      ? payload!.message.join(", ")
      : (payload?.message as string) ||
        error.message ||
        "Something went wrong. Please try again."
    return Promise.reject(
      new ApiClientError(error.response?.status ?? 0, payload, message)
    )
  }
)

export const api = {
  get: <T>(path: string, config?: Parameters<typeof http.get>[1]) =>
    http.get<T>(path, config).then((r) => r.data),
  post: <T>(
    path: string,
    body?: unknown,
    config?: Parameters<typeof http.post>[2]
  ) => http.post<T>(path, body, config).then((r) => r.data),
  patch: <T>(
    path: string,
    body?: unknown,
    config?: Parameters<typeof http.patch>[2]
  ) => http.patch<T>(path, body, config).then((r) => r.data),
  delete: <T>(path: string, config?: Parameters<typeof http.delete>[1]) =>
    http.delete<T>(path, config).then((r) => r.data),
}
