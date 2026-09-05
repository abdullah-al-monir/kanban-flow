"use client"

import { useQuery } from "@tanstack/react-query"
import { Check, Moon, Sun, Monitor, Pencil } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { usersApi } from "@/lib/api/users"
import { queryKeys } from "@/lib/query-keys"
import { useUpdateMe } from "@/hooks/use-users"
import {
  useThemeConfig,
  type ColorTheme,
  type DarkBg,
} from "@/hooks/useThemeConfig"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const MODE_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

const COLOR_THEMES: {
  value: ColorTheme
  label: string
  light: string
  dark: string
}[] = [
  { value: "green", label: "Green", light: "#10b981", dark: "#34d399" },
  { value: "blue", label: "Blue", light: "#3b82f6", dark: "#60a5fa" },
  { value: "violet", label: "Violet", light: "#7c3aed", dark: "#a78bfa" },
  { value: "amber", label: "Amber", light: "#d97706", dark: "#fbbf24" },
  { value: "rose", label: "Rose", light: "#e11d48", dark: "#fb7185" },
  { value: "slate", label: "Slate", light: "#475569", dark: "#94a3b8" },
]

const DARK_BG_OPTIONS: {
  value: DarkBg
  label: string
  description: string
  preview: string
}[] = [
  {
    value: "zinc",
    label: "Zinc",
    description: "Neutral dark",
    preview: "#171717",
  },
  {
    value: "slate",
    label: "Slate",
    description: "Cool blue tint",
    preview: "#0f172a",
  },
  {
    value: "neutral",
    label: "Warm",
    description: "Warm brown tint",
    preview: "#1c1917",
  },
  {
    value: "obsidian",
    label: "Obsidian",
    description: "Near-black",
    preview: "#0a0a0a",
  },
]

export default function SettingsPage() {
  const { data: me } = useQuery({
    queryKey: queryKeys.me,
    queryFn: usersApi.me,
  })
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { colorTheme, darkBg, setColorTheme, setDarkBg } = useThemeConfig()
  const isDark = resolvedTheme === "dark"

  const updateMe = useUpdateMe()
  const [editingProfile, setEditingProfile] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (me) {
      setFullName(me.fullName)
      setEmail(me.email)
    }
  }, [me])

  const startEditing = () => {
    updateMe.reset()
    setEditingProfile(true)
  }

  const cancelEditing = () => {
    if (me) {
      setFullName(me.fullName)
      setEmail(me.email)
    }
    updateMe.reset()
    setEditingProfile(false)
  }

  const saveProfile = () => {
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail || !me) return

    const payload: { fullName?: string; email?: string } = {}
    if (trimmedName !== me.fullName) payload.fullName = trimmedName
    if (trimmedEmail !== me.email) payload.email = trimmedEmail

    if (Object.keys(payload).length === 0) {
      setEditingProfile(false)
      return
    }

    updateMe.mutate(payload, {
      onSuccess: () => {
        setEditingProfile(false)
        toast.success("Profile updated successfully")
      },
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your profile and appearance.
        </p>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            {!editingProfile && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={startEditing}
              >
                <Pencil size={12} />
                Edit
              </Button>
            )}
          </div>

          <div className="mt-3 rounded-xl border border-border p-4">
            {editingProfile ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Avatar className="mt-1 size-11 shrink-0">
                    <AvatarFallback className="text-sm font-semibold">
                      {initials(fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor="profile-name"
                        className="text-xs text-muted-foreground"
                      >
                        Full name
                      </Label>
                      <Input
                        id="profile-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor="profile-email"
                        className="text-xs text-muted-foreground"
                      >
                        Email
                      </Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {updateMe.isError && (
                  <p className="text-xs text-destructive">
                    {(
                      updateMe.error as {
                        response?: { data?: { message?: string } }
                      }
                    )?.response?.data?.message ??
                      "Couldn't update your profile. Please try again."}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={saveProfile}
                    disabled={
                      !fullName.trim() || !email.trim() || updateMe.isPending
                    }
                  >
                    {updateMe.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    disabled={updateMe.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="text-sm font-semibold">
                    {initials(me?.fullName ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {me?.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">{me?.email}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a mode, an accent color, and (in dark mode) a background
            tint.
          </p>

          <div className="mt-3 flex gap-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                  theme === opt.value
                    ? "border-foreground/20 bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Accent color
            </p>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_THEMES.map((t) => {
                const isActive = colorTheme === t.value
                const color = isDark ? t.dark : t.light
                return (
                  <button
                    key={t.value}
                    onClick={() => setColorTheme(t.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "border-foreground/20 bg-muted"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <span
                      className="flex size-4 items-center justify-center rounded-full"
                      style={{ backgroundColor: color }}
                    >
                      {isActive && (
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {isDark && (
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Dark background
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DARK_BG_OPTIONS.map((bg) => {
                  const isActive = darkBg === bg.value
                  return (
                    <button
                      key={bg.value}
                      onClick={() => setDarkBg(bg.value)}
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition-colors",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div
                        className="h-7 w-full rounded-md"
                        style={{ backgroundColor: bg.preview }}
                      />
                      <div className="flex w-full items-center justify-between">
                        <span className="text-[11px] font-medium text-foreground">
                          {bg.label}
                        </span>
                        {isActive && (
                          <Check
                            size={10}
                            strokeWidth={3}
                            className="text-primary"
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {bg.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
