"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ColorTheme =
  "green" | "blue" | "violet" | "amber" | "rose" | "slate"
export type DarkBg = "zinc" | "slate" | "neutral" | "obsidian"

const COLOR_THEME_VALUES: ColorTheme[] = [
  "green",
  "blue",
  "violet",
  "amber",
  "rose",
  "slate",
]
const DARK_BG_VALUES: DarkBg[] = ["zinc", "slate", "neutral", "obsidian"]

interface ThemeConfigState {
  colorTheme: ColorTheme
  darkBg: DarkBg
  setColorTheme: (theme: ColorTheme) => void
  setDarkBg: (bg: DarkBg) => void
}

const useThemeConfigStore = create<ThemeConfigState>()(
  persist(
    (set) => ({
      colorTheme: "slate",
      darkBg: "zinc",
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setDarkBg: (darkBg) => set({ darkBg }),
    }),
    { name: "kanban-theme-config" }
  )
)

export function useThemeConfig() {
  const { colorTheme, darkBg, setColorTheme, setDarkBg } = useThemeConfigStore()

  useEffect(() => {
    const html = document.documentElement
    for (const t of COLOR_THEME_VALUES) html.classList.remove(`theme-${t}`)
    html.classList.add(`theme-${colorTheme}`)
  }, [colorTheme])

  useEffect(() => {
    const html = document.documentElement
    for (const b of DARK_BG_VALUES) html.classList.remove(`dark-bg-${b}`)
    html.classList.add(`dark-bg-${darkBg}`)
  }, [darkBg])

  return { colorTheme, darkBg, setColorTheme, setDarkBg }
}
