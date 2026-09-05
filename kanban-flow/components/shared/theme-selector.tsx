"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  useThemeConfig,
  type ColorTheme,
  type DarkBg,
} from "@/hooks/useThemeConfig"
import { Check, Palette } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

const COLOR_THEMES: {
  value: ColorTheme
  label: string
  light: string
  dark: string
}[] = [
  { value: "green", label: "Green", light: "#10b981", dark: "#34d399" },
  { value: "blue", label: "Blue", light: "#3b82f6", dark: "#60a5fa" },
  { value: "violet", label: "Violet", light: "#7c3aed", dark: "#a78bfa" },
  { value: "amber", label: "Amber", light: "#d97706", dark: "#fbbf24" },
  { value: "rose", label: "Rose", light: "#e11d48", dark: "#fb7185" },
  { value: "slate", label: "Slate", light: "#475569", dark: "#94a3b8" },
]

const DARK_BG_OPTIONS: {
  value: DarkBg
  label: string
  description: string
  previewBg: string
  previewCard: string
}[] = [
  {
    value: "zinc",
    label: "Zinc",
    description: "Neutral dark",
    previewBg: "#171717",
    previewCard: "#262626",
  },
  {
    value: "slate",
    label: "Slate",
    description: "Cool blue tint",
    previewBg: "#0f172a",
    previewCard: "#1e293b",
  },
  {
    value: "neutral",
    label: "Warm",
    description: "Warm brown tint",
    previewBg: "#1c1917",
    previewCard: "#292524",
  },
  {
    value: "obsidian",
    label: "Obsidian",
    description: "Near-black",
    previewBg: "#0a0a0a",
    previewCard: "#141414",
  },
]

export function ThemeSelector() {
  const mounted = useIsMounted()
  const { resolvedTheme } = useTheme()
  const { colorTheme, darkBg, setColorTheme, setDarkBg } = useThemeConfig()

  if (!mounted) return <div className="size-9" />

  const isDark = resolvedTheme === "dark"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Customize theme"
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full",
            "border border-border transition-all duration-200",
            "hover:scale-110 hover:bg-primary/10 active:scale-95",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          )}
        >
          <Palette size={16} className="text-primary" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-64 space-y-4 p-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Color
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_THEMES.map((t) => {
              const isActive = colorTheme === t.value
              const color = isDark ? t.dark : t.light
              return (
                <button
                  key={t.value}
                  title={t.label}
                  onClick={() => setColorTheme(t.value)}
                  aria-pressed={isActive}
                  aria-label={t.label}
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full",
                    "transition-all duration-150 hover:scale-110 active:scale-95",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                    isActive && "ring-2 ring-offset-2 ring-offset-background"
                  )}
                  style={{
                    backgroundColor: color,
                    ...(isActive
                      ? ({ "--tw-ring-color": color } as React.CSSProperties)
                      : {}),
                  }}
                >
                  {isActive && (
                    <Check
                      size={13}
                      strokeWidth={3}
                      className="text-white drop-shadow"
                    />
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {COLOR_THEMES.find((t) => t.value === colorTheme)?.label}
          </p>
        </div>

        {isDark && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Background
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {DARK_BG_OPTIONS.map((bg) => {
                const isActive = darkBg === bg.value
                return (
                  <button
                    key={bg.value}
                    onClick={() => setDarkBg(bg.value)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left",
                      "transition-all duration-150",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/40 hover:border-primary/50"
                    )}
                  >
                    <div
                      className="flex h-7 w-full items-center gap-1 overflow-hidden rounded-md p-1.5"
                      style={{ backgroundColor: bg.previewBg }}
                    >
                      <div
                        className="h-full w-5 shrink-0 rounded-sm"
                        style={{ backgroundColor: bg.previewCard }}
                      />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div
                          className="h-1 w-full rounded-full opacity-60"
                          style={{ backgroundColor: bg.previewCard }}
                        />
                        <div
                          className="h-1 w-2/3 rounded-full opacity-40"
                          style={{ backgroundColor: bg.previewCard }}
                        />
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground">
                        {bg.label}
                      </span>
                      {isActive && (
                        <Check
                          size={10}
                          strokeWidth={3}
                          className="text-primary"
                        />
                      )}
                    </div>
                    <span className="text-[10px] leading-none text-muted-foreground">
                      {bg.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
