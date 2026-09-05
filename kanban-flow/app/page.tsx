"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"

export default function RootPage() {
  const router = useRouter()
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!isHydrated) return
    router.replace(accessToken ? "/boards" : "/login")
  }, [isHydrated, accessToken, router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="animate-spin text-muted-foreground" size={22} />
    </div>
  )
}
