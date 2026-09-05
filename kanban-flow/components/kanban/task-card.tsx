"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CalendarDays, Pencil, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { useDeleteTask } from "@/hooks/use-tasks"
import { cn } from "@/lib/utils"
import { formatDueDate, initials, isOverdue } from "@/lib/format"
import type { Task } from "@/lib/types"

interface TaskCardProps {
  task: Task
  boardId: string
  onClick: () => void
  disabled?: boolean
  overlay?: boolean
}

export function TaskCard({
  task,
  boardId,
  onClick,
  disabled,
  overlay,
}: TaskCardProps) {
  const due = formatDueDate(task.dueDate)
  const overdue = isOverdue(task.dueDate) && !task.isArchived
  const deleteTask = useDeleteTask(boardId)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task" },
    disabled: disabled || overlay,
  })

  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition }

  return (
    <>
      <div
        ref={overlay ? undefined : setNodeRef}
        style={style}
        {...(overlay ? {} : attributes)}
        {...(overlay ? {} : listeners)}
        className={cn(
          "group/card relative flex w-full items-start gap-2 rounded-lg border border-border/60 bg-card p-2.5 text-left shadow-sm transition-all",
          "touch-none select-none hover:border-border hover:shadow-md",
          !disabled && "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-40",
          overlay && "rotate-2 shadow-lg"
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 flex-col gap-2 text-left"
        >
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map(({ label }) => (
                <span
                  key={label.id}
                  className="h-1.5 w-6 rounded-full"
                  style={{ backgroundColor: label.colorHex }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          <p className="text-[13px] leading-snug font-medium text-card-foreground">
            {task.title}
          </p>

          {(due || task.assignee) && (
            <div className="flex items-center justify-between pt-0.5">
              {due ? (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                    overdue
                      ? "bg-destructive/10 text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  <CalendarDays size={12} />
                  {due}
                </span>
              ) : (
                <span />
              )}

              {task.assignee && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="size-5 ring-2 ring-card">
                      <AvatarFallback className="text-[9px] font-semibold">
                        {initials(task.assignee.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {task.assignee.fullName}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </button>

        {!disabled && !overlay && (
          <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-foreground"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              aria-label="Edit task"
            >
              <Pencil size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-destructive"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setConfirmDelete(true)
              }}
              aria-label="Delete task"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        )}
      </div>

      {!overlay && (
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                onClick={() =>
                  deleteTask.mutate(task.id, {
                    onSuccess: () => setConfirmDelete(false),
                  })
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
