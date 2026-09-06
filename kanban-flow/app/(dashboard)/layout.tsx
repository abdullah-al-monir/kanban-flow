"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/shared/sidebar"
import { Navbar } from "@/components/shared/navbar"
import { HeaderContentProvider } from "@/components/shared/header-content-context"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024)
  }, [])

  return (
    <ProtectedRoute>
      <TooltipProvider delayDuration={0}>
        <HeaderContentProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {mobileOpen && (
              <div className="fixed inset-0 z-50 flex md:hidden">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setMobileOpen(false)}
                />
                <div className="relative z-10 h-full w-60 bg-background shadow-xl">
                  <Sidebar open={true} setOpen={() => setMobileOpen(false)} />
                </div>
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-hidden bg-muted/20">
                {children}
              </main>
            </div>
          </div>
        </HeaderContentProvider>
      </TooltipProvider>
    </ProtectedRoute>
  )
}
