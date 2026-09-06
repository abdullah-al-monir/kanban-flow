"use client"

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
import { Button } from "@/components/ui/button"
import { useDeleteBoard } from "@/hooks/use-board"
import { useRestoreBoard } from "@/hooks/use-boards"
import type { BoardSummary } from "@/lib/types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ArchiveRestore, Columns3, Trash2, Users } from "lucide-react"
import { useState } from "react"

dayjs.extend(relativeTime)

export function ArchivedBoardCard({ board }: { board: BoardSummary }) {
  const restoreBoard = useRestoreBoard()
  const deleteBoard = useDeleteBoard()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-card/60 p-4">
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-card-foreground">
          {board.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Archived {dayjs(board.updatedAt).fromNow()}
        </p>
      </div>

      {board.description ? (
        <p className="line-clamp-2 min-h-10 text-[13px] text-muted-foreground">
          {board.description}
        </p>
      ) : (
        <p className="min-h-10 text-[13px] text-muted-foreground/60 italic">
          No description
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Columns3 size={13} />
          {board._count.columns}{" "}
          {board._count.columns === 1 ? "column" : "columns"}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {board._count.members}{" "}
          {board._count.members === 1 ? "member" : "members"}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1.5"
          disabled={restoreBoard.isPending || deleteBoard.isPending}
          onClick={() => restoreBoard.mutate(board.id)}
        >
          <ArchiveRestore size={14} />
          {restoreBoard.isPending ? "Restoring..." : "Restore"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="gap-1.5"
          disabled={restoreBoard.isPending || deleteBoard.isPending}
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={14} />
          Delete
        </Button>
      </div>

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
              onClick={() => deleteBoard.mutate(board.id)}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
