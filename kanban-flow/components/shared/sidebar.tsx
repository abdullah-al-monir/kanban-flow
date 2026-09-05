"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutGrid,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { initials } from "@/lib/format"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const NAV_ITEMS = [
  { label: "Boards", href: "/boards", icon: LayoutGrid },
  { label: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  open: boolean
  setOpen: (v: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)

  const handleLogout = () => {
    clearSession()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-border bg-background",
        "transition-all duration-200 ease-in-out",
        open ? "w-56" : "w-16"
      )}
    >
      <div
        className={cn(
          "relative flex h-14 shrink-0 items-center border-b border-border",
          open ? "px-4" : "justify-center px-2"
        )}
      >
        {open ? (
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Kanban Flow
          </span>
        ) : (
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            K
          </span>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="absolute top-1/2 -right-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <PanelLeftClose size={13} /> : <PanelRightClose size={13} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          const link = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                open ? "" : "justify-center px-0 py-2.5",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon size={16} className="shrink-0" />
              {open && <span className="truncate">{item.label}</span>}
            </Link>
          )

          if (open) return <div key={item.label}>{link}</div>

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-border px-2 py-3">
        {open && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/50 px-2.5 py-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
              {initials(user?.fullName ?? "Guest")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-tight font-semibold text-foreground">
                {user?.fullName ?? "Guest"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        )}

        {open ? (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut size={14} />
            Sign out
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                aria-label="Sign out"
                className="flex w-full items-center justify-center rounded-md border border-border p-2.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
              >
                <LogOut size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  )
}
