"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth"
import { ApiClientError } from "@/lib/api/client"
import { useAuthStore } from "@/store/auth-store"

export function RegisterForm() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setLoading(true)
    try {
      const data = await authApi.register({ email, password, fullName })
      setSession(data)
      router.push("/boards")
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          required
          autoFocus
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>

      {error && <p className="text-[13px] text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="mt-1">
        {loading ? (
          <Loader2 className="animate-spin" size={15} />
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
