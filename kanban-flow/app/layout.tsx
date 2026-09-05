import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/sonner"
import { themeConfigInitScript } from "@/lib/theme-init-script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Kanban Flow",
  description: "A simple, elegant kanban board for your team.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-config-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeConfigInitScript }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
