"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-9" />

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 text-muted-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}
