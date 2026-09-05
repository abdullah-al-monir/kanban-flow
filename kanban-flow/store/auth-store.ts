import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthResponse, AuthUser } from "@/lib/types"

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isHydrated: boolean
  setSession: (data: AuthResponse) => void
  clearSession: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      setSession: (data) =>
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      clearSession: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "kanban-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
