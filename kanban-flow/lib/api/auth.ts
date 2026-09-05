import { api } from "./client"
import type { AuthResponse } from "@/lib/types"

export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<AuthResponse>("/auth/register", data, { skipAuth: true }),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data, { skipAuth: true }),
}
