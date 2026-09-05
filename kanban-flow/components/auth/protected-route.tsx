"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (isHydrated && !accessToken) {
      router.replace("/login")
    }
  }, [isHydrated, accessToken, router])

  if (!isHydrated || !accessToken) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      </div>
    )
  }

  return <>{children}</>
}
