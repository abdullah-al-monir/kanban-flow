"use client"

import { useEffect, useState } from "react"
import { Search, UserMinus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RoleBadge } from "@/components/kanban/role-badge"
import {
  useBoardMembers,
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
  useUserSearch,
} from "@/hooks/use-members"
import { useAuthStore } from "@/store/auth-store"
import { ASSIGNABLE_ROLES, ROLE_LABELS, roleSatisfies } from "@/lib/constants"
import { initials } from "@/lib/format"
import type { BoardDetail, BoardRole } from "@/lib/types"

interface MembersDialogProps {
  board: BoardDetail
  myRole: BoardRole | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MembersDialog({
  board,
  myRole,
  open,
  onOpenChange,
}: MembersDialogProps) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const canManage = roleSatisfies(myRole, "ADMIN")

  const { data: members = board.members } = useBoardMembers(board.id)
  const inviteMember = useInviteMember(board.id)
  const updateRole = useUpdateMemberRole(board.id)
  const removeMember = useRemoveMember(board.id)

  const [emailInput, setEmailInput] = useState("")
  const [debouncedEmail, setDebouncedEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<BoardRole>("EDITOR")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(emailInput), 300)
    return () => clearTimeout(t)
  }, [emailInput])

  const { data: results = [] } = useUserSearch(debouncedEmail)
  const existingIds = new Set(members.map((m) => m.userId))
  const candidates = results.filter((u) => !existingIds.has(u.id))

  const invite = (email: string) => {
    inviteMember.mutate(
      { email, role: inviteRole },
      {
        onSuccess: () => {
          setEmailInput("")
          setDebouncedEmail("")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Board members</DialogTitle>
        </DialogHeader>

        {canManage && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={13}
                  className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Invite by email"
                  className="h-8 pl-8 text-[13px]"
                />
              </div>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as BoardRole)}
              >
                <SelectTrigger className="h-8 w-28 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {debouncedEmail.length >= 2 && (
              <div className="flex flex-col gap-1">
                {candidates.length === 0 ? (
                  <p className="px-1 py-1 text-xs text-muted-foreground">
                    No matching user to invite.
                  </p>
                ) : (
                  candidates.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => invite(u.email)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent"
                    >
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {initials(u.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 truncate">
                        {u.fullName}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {members.map((member) => {
            const isSelf = member.userId === currentUserId
            const canChangeThis =
              canManage && member.role !== "OWNER" && !isSelf

            return (
              <div
                key={member.id}
                className="flex items-center gap-2.5 rounded-md px-1.5 py-2"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-[11px] font-semibold">
                    {initials(member.user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    {member.user.fullName}
                    {isSelf && (
                      <span className="text-muted-foreground"> (you)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>

                {canChangeThis ? (
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      updateRole.mutate({
                        memberUserId: member.userId,
                        role: v as BoardRole,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-24 shrink-0 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <RoleBadge role={member.role} className="shrink-0" />
                )}

                {canChangeThis && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeMember.mutate(member.userId)}
                  >
                    <UserMinus size={14} />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
