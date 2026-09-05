import { create } from "zustand"
import { persist } from "zustand/middleware"

export const ACCENT_THEMES = [
  { value: "slate", label: "Slate", swatch: "oklch(0.44 0.02 260)" },
  { value: "indigo", label: "Indigo", swatch: "oklch(0.5 0.18 270)" },
  { value: "emerald", label: "Emerald", swatch: "oklch(0.55 0.14 155)" },
  { value: "amber", label: "Amber", swatch: "oklch(0.65 0.16 70)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.55 0.19 15)" },
] as const

export type AccentTheme = (typeof ACCENT_THEMES)[number]["value"]

interface ThemeState {
  accent: AccentTheme
  setAccent: (accent: AccentTheme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accent: "slate",
      setAccent: (accent) => set({ accent }),
    }),
    { name: "kanban-accent-theme" }
  )
)
