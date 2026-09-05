"use client"

import { useState } from "react"
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { toast } from "sonner"
import { ThemeConfigApplier } from "@/components/shared/theme-config-applier"
import { ApiClientError } from "@/lib/api/client"

function resolveErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
        mutationCache: new MutationCache({
          onSuccess: (_data, _variables, _context, mutation) => {
            const message = mutation.options.meta?.successMessage as string | undefined
            if (message) toast.success(message)
          },
          onError: (error, _variables, _context, mutation) => {
            const fallback = (mutation.options.meta?.errorMessage as string | undefined) ?? "Something went wrong."
            toast.error(resolveErrorMessage(error, fallback))
          },
        }),
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.data === undefined) {
              toast.error(resolveErrorMessage(error, "Couldn't load data. Please try again."))
            }
          },
        }),
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ThemeConfigApplier />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
