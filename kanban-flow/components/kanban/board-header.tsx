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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDeleteBoard, useUpdateBoard } from "@/hooks/use-board"
import { useRestoreBoard } from "@/hooks/use-boards"
import { roleSatisfies } from "@/lib/constants"
import { initials } from "@/lib/format"
import type { BoardDetail, BoardRole } from "@/lib/types"
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"
import Link from "next/link"
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

  const visibleMembers = board.members.slice(0, 5)
  const extraCount = board.members.length - visibleMembers.length

  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Link
            href="/boards"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft size={15} />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-foreground">
              {board.title}
            </h1>
            {board.description && (
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                {board.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {myRole && <RoleBadge role={myRole} />}

          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            className="flex items-center -space-x-2 rounded-full transition-opacity hover:opacity-80"
          >
            {visibleMembers.map((m) => (
              <Avatar
                key={m.userId}
                className="size-7 border-2 border-background"
              >
                <AvatarFallback className="text-[10px] font-semibold">
                  {initials(m.user.fullName)}
                </AvatarFallback>
              </Avatar>
            ))}
            {extraCount > 0 && (
              <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground">
                +{extraCount}
              </div>
            )}
          </button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setMembersOpen(true)}
          >
            <Users size={14} />
            Members
          </Button>

          {(!board.isArchived ? canManage : isOwner) && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setActivitiesOpen(true)}
            >
              <Clock size={14} />
              Activity
            </Button>
          )}

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44 p-1.5">
                <DropdownMenuItem
                  className="gap-2 py-1.5 whitespace-nowrap"
                  onClick={() => {
                    setTitle(board.title)
                    setDescription(board.description ?? "")
                    setEditOpen(true)
                  }}
                >
                  <Pencil size={14} />
                  Edit board
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 py-1.5 whitespace-nowrap"
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
                  {board.isArchived ? "Unarchive board" : "Archive board"}
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem
                    className="gap-2 py-1.5 whitespace-nowrap"
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                    Delete board
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
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
            <DialogTitle>Edit board</DialogTitle>
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
      {/* add */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{board.title}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the board, its columns, tasks, and
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
    </div>
  )
}
