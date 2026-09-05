import { api } from "./client"
import type { PublicUser } from "@/lib/types"

export const usersApi = {
  me: () => api.get<PublicUser>("/users/me"),
  updateMe: (data: Partial<Pick<PublicUser, "email" | "fullName">>) =>
    api.patch<PublicUser>("/users/me", data),
  search: (email: string) =>
    api.get<PublicUser[]>(`/users/search?email=${encodeURIComponent(email)}`),
}
