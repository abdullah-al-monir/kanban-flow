"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth-store"
import { initials } from "@/lib/format"

export function ProfileMenu() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)

  const handleLogout = () => {
    clearSession()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        >
          <Avatar className="size-8">
            <AvatarFallback className="text-[11px] font-semibold">
              {initials(user?.fullName ?? "Guest")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-56 p-1.5">
        <DropdownMenuLabel className="flex flex-col gap-0 px-2 py-1.5 font-normal">
          <span className="truncate text-[13px] font-semibold text-foreground">
            {user?.fullName ?? "Guest"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 py-1.5">
          <Link href="/settings">
            <Settings size={14} />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2 py-1.5"
          onClick={handleLogout}
        >
          <LogOut size={14} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
