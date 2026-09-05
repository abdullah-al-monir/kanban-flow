"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { ThemeSelector } from "@/components/shared/theme-selector"

export function Navbar({
  title,
  onMenuToggle,
}: {
  title?: string
  onMenuToggle: () => void
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 md:hidden"
          onClick={onMenuToggle}
        >
          <Menu size={18} />
        </Button>
        {title && (
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeSelector />
        <ThemeToggle />
      </div>
    </header>
  )
}
