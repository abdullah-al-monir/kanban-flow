"use client"

import { useEffect, useState } from "react"
import { Maximize, Minimize, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { ThemeSelector } from "@/components/shared/theme-selector"
import { ProfileMenu } from "@/components/shared/profile-menu"
import { useHeaderContentValue } from "@/components/shared/header-content-context"

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", handleChange)
    return () => document.removeEventListener("fullscreenchange", handleChange)
  }, [])

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  return { isFullscreen, toggle }
}

function FullscreenToggle() {
  const { isFullscreen, toggle } = useFullscreen()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground"
      onClick={toggle}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
    </Button>
  )
}

function OverflowMenu() {
  const { isFullscreen, toggle } = useFullscreen()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground md:hidden"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48 p-1.5">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeSelector />
        </div>
        <DropdownMenuItem className="gap-2 py-1.5" onClick={toggle}>
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const { left, right } = useHeaderContentValue()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">{left}</div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {right}

        <div className="mx-1 hidden h-5 w-px bg-border md:block" />

        <div className="hidden items-center gap-1 md:flex">
          <ThemeSelector />
          <ThemeToggle />
          <FullscreenToggle />
        </div>

        <div className="flex shrink-0 items-center md:hidden">
          <ThemeToggle />
          <OverflowMenu />
        </div>

        <ProfileMenu />
      </div>
    </header>
  )
}
