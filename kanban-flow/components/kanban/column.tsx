"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Dices, MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { TaskCard } from "@/components/kanban/task-card"
import { useDeleteColumn, useUpdateColumn } from "@/hooks/use-columns"
import { cn } from "@/lib/utils"
import type { Column as ColumnType, Task } from "@/lib/types"

export const COLUMN_DROPZONE_SUFFIX = "::dropzone"

export function columnDropzoneId(columnId: string) {
  return `${columnId}${COLUMN_DROPZONE_SUFFIX}`
}

export function resolveColumnId(id: string) {
  return id.endsWith(COLUMN_DROPZONE_SUFFIX)
    ? id.slice(0, -COLUMN_DROPZONE_SUFFIX.length)
    : id
}

interface KanbanColumnProps {
  boardId: string
  column: ColumnType
  canEdit: boolean
  accentColor: string
  onOpenTask: (task: Task) => void
  onAddTask: (columnId: string) => void
}

export function KanbanColumn({
  boardId,
  column,
  canEdit,
  accentColor,
  onOpenTask,
  onAddTask,
}: KanbanColumnProps) {
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateColumn = useUpdateColumn(boardId)
  const deleteColumn = useDeleteColumn(boardId)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" },
    disabled: !canEdit,
  })

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: columnDropzoneId(column.id),
    disabled: !canEdit,
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  const commitRename = () => {
    setRenaming(false)
    const trimmed = title.trim()
    if (trimmed && trimmed !== column.title) {
      updateColumn.mutate({ columnId: column.id, title: trimmed })
    } else {
      setTitle(column.title)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderTopColor: accentColor }}
      className={cn(
        "flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-xl border-t-2 bg-muted/40",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {canEdit && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            aria-label="Drag column"
          >
            <Dices size={14} />
          </button>
        )}

        {renaming ? (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") {
                setTitle(column.title)
                setRenaming(false)
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-7 flex-1 px-1.5 text-[13px] font-semibold"
          />
        ) : (
          <button
            type="button"
            disabled={!canEdit}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => canEdit && setRenaming(true)}
            className="flex-1 truncate text-left text-[13px] font-semibold text-foreground"
          >
            {column.title}
          </button>
        )}

        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {column.tasks.length}
        </span>

        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 text-muted-foreground"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenaming(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div
        ref={setDroppableRef}
        className="relative flex-1 touch-none overflow-y-auto px-2 pb-2"
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex min-h-full flex-col gap-2">
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                boardId={boardId}
                disabled={!canEdit}
                onClick={() => onOpenTask(task)}
              />
            ))}
          </div>
        </SortableContext>

        {column.tasks.length === 0 && canEdit && (
          <div className="pointer-events-none absolute inset-x-0 top-0 rounded-lg border border-dashed border-border/70 px-3 py-6 text-center text-[11px] text-muted-foreground">
            No tasks yet — drop one here or add below
          </div>
        )}
      </div>

      {canEdit && (
        <div className="p-2 pt-0">
          <Button
            size="sm"
            className="w-full justify-start gap-1.5 hover:opacity-80"
            style={{
              backgroundColor: `color-mix(in oklab, ${accentColor} 12%, transparent)`,
              color: accentColor,
            }}
            onClick={() => onAddTask(column.id)}
          >
            <Plus size={14} />
            Add task
          </Button>
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{column.title}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the column and every task inside it. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={() => deleteColumn.mutate(column.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
