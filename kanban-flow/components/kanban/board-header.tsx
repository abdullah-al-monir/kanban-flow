"use client"

import { MembersDialog } from "@/components/kanban/members-dialog"
import { RoleBadge } from "@/components/kanban/role-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useHeaderContent } from "@/components/shared/header-content-context"
import { useDeleteBoard, useUpdateBoard } from "@/hooks/use-board"
import { useRestoreBoard } from "@/hooks/use-boards"
import { roleSatisfies } from "@/lib/constants"
import { initials } from "@/lib/format"
import type { BoardDetail, BoardRole } from "@/lib/types"
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  Clock,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ActivitiesDialog } from "./activities-dialog"

export function BoardHeader({
  board,
  myRole,
}: {
  board: BoardDetail
  myRole: BoardRole | null
}) {
  const router = useRouter()
  const updateBoard = useUpdateBoard(board.id)
  const restoreBoard = useRestoreBoard()
  const deleteBoard = useDeleteBoard()

  const canManage = roleSatisfies(myRole, "ADMIN")
  const isOwner = myRole === "OWNER"

  const [editOpen, setEditOpen] = useState(false)
  const [title, setTitle] = useState(board.title)
  const [description, setDescription] = useState(board.description ?? "")
  const [membersOpen, setMembersOpen] = useState(false)
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const saveEdits = () => {
    const trimmed = title.trim()
    if (
      trimmed &&
      (trimmed !== board.title || description !== (board.description ?? ""))
    ) {
      updateBoard.mutate(
        {
          title: trimmed,
          description: description.trim() || undefined,
        },
        { onSuccess: () => setEditOpen(false) }
      )
    } else {
      setEditOpen(false)
    }
  }

  const visibleMembers = board.members.slice(0, 4)
  const extraCount = board.members.length - visibleMembers.length

  useHeaderContent(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex max-w-full min-w-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent">
          <span className="truncate text-[15px] font-semibold text-foreground">
            #{board.title}
          </span>
          {myRole && (
            <RoleBadge
              role={myRole}
              className="ml-1 hidden shrink-0 text-[10px] sm:block"
            />
          )}
          <ChevronDown size={15} className="shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52 p-1.5">
        <DropdownMenuItem
          className="gap-2 py-1.5"
          onClick={() => setMembersOpen(true)}
        >
          <Users size={14} />
          Members
        </DropdownMenuItem>
        {(!board.isArchived ? canManage : isOwner) && (
          <DropdownMenuItem
            className="gap-2 py-1.5"
            onClick={() => setActivitiesOpen(true)}
          >
            <Clock size={14} />
            Activity
          </DropdownMenuItem>
        )}
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 py-1.5"
              onClick={() => {
                setTitle(board.title)
                setDescription(board.description ?? "")
                setEditOpen(true)
              }}
            >
              <Pencil size={14} />
              Edit project
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 py-1.5"
              disabled={updateBoard.isPending || restoreBoard.isPending}
              onClick={() => {
                if (board.isArchived) {
                  restoreBoard.mutate(board.id)
                } else {
                  updateBoard.mutate({ isArchived: true })
                }
              }}
            >
              {board.isArchived ? (
                <ArchiveRestore size={14} />
              ) : (
                <Archive size={14} />
              )}
              {board.isArchived ? "Unarchive project" : "Archive project"}
            </DropdownMenuItem>
            {isOwner && (
              <DropdownMenuItem
                className="gap-2 py-1.5"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={14} />
                Delete project
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>,
    <div className="flex items-center gap-1 sm:gap-2.5">
      {canManage && (
        <Button
          size="sm"
          className="h-8 gap-1.5 px-2.5 sm:px-3"
          onClick={() => setMembersOpen(true)}
          aria-label="Invite members"
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Invite members</span>
        </Button>
      )}

      <button
        type="button"
        onClick={() => setMembersOpen(true)}
        className="flex shrink-0 items-center gap-2 rounded-full transition-opacity hover:opacity-80"
        aria-label={`${board.members.length} ${board.members.length === 1 ? "member" : "members"}`}
      >
        <AvatarGroup className="sm:hidden">
          {visibleMembers.slice(0, 2).map((m) => (
            <Avatar key={m.userId} size="sm">
              <AvatarFallback className="text-[10px] font-semibold">
                {initials(m.user.fullName)}
              </AvatarFallback>
            </Avatar>
          ))}
          {board.members.length > 2 && (
            <AvatarGroupCount className="size-6 text-[10px]">
              +{board.members.length - 2}
            </AvatarGroupCount>
          )}
        </AvatarGroup>

        <AvatarGroup className="hidden sm:flex">
          {visibleMembers.map((m) => (
            <Avatar key={m.userId} size="sm">
              <AvatarFallback className="text-[10px] font-semibold">
                {initials(m.user.fullName)}
              </AvatarFallback>
            </Avatar>
          ))}
          {extraCount > 0 && (
            <AvatarGroupCount className="size-6 text-[10px]">
              +{extraCount}
            </AvatarGroupCount>
          )}
        </AvatarGroup>

        <span className="hidden text-xs text-muted-foreground lg:inline">
          {board.members.length}{" "}
          {board.members.length === 1 ? "member" : "members"}
        </span>
      </button>
    </div>
  )

  return (
    <>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setTitle(board.title)
            setDescription(board.description ?? "")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-board-title">Title</Label>
              <Input
                id="edit-board-title"
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-board-description">Description</Label>
              <Textarea
                id="edit-board-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a description (optional)"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdits}
              disabled={!title.trim() || updateBoard.isPending}
            >
              {updateBoard.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MembersDialog
        board={board}
        myRole={myRole}
        open={membersOpen}
        onOpenChange={setMembersOpen}
      />
      <ActivitiesDialog
        boardId={board.id}
        open={activitiesOpen}
        onOpenChange={setActivitiesOpen}
      />
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{board.title}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project, its columns, tasks, and
              activity. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={() =>
                deleteBoard.mutate(board.id, {
                  onSuccess: () => router.push("/boards"),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
