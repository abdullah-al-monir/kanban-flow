"use client"

import { useEffect, useState } from "react"
import { Trash2, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { BoardDetail, Task } from "@/lib/types"

interface TaskDialogProps {
  board: BoardDetail
  canEdit: boolean
  task: Task | null
  createInColumnId: string | null
  onClose: () => void
}

const UNASSIGNED = "__unassigned__"

export function TaskDialog({
  board,
  canEdit,
  task,
  createInColumnId,
  onClose,
}: TaskDialogProps) {
  const isCreate = !task && !!createInColumnId
  const open = !!task || isCreate

  const createTask = useCreateTask(board.id)
  const updateTask = useUpdateTask(board.id)
  const deleteTask = useDeleteTask(board.id)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>(UNASSIGNED)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [dueDateOpen, setDueDateOpen] = useState(false)
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? "")
      setAssigneeId(task.assigneeId ?? UNASSIGNED)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setLabelIds(task.labels.map((l) => l.label.id))
    } else {
      setTitle("")
      setDescription("")
      setAssigneeId(UNASSIGNED)
      setDueDate(undefined)
      setLabelIds([])
    }
  }, [task, createInColumnId])

  const handleSave = () => {
    const trimmed = title.trim()
    if (!trimmed) return

    const payload = {
      title: trimmed,
      description: description.trim() || undefined,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
      dueDate: dueDate ? dueDate.toISOString() : null,
      labelIds,
    }

    if (task) {
      updateTask.mutate(
        { taskId: task.id, data: payload },
        { onSuccess: onClose }
      )
    } else if (createInColumnId) {
      createTask.mutate(
        { columnId: createInColumnId, data: payload },
        { onSuccess: onClose }
      )
    }
  }

  const toggleLabel = (labelId: string) => {
    setLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreate ? "New task" : "Task details"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                disabled={!canEdit}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={description}
                disabled={!canEdit}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more detail (optional)"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Assignee</Label>
                <Select
                  value={assigneeId}
                  disabled={!canEdit}
                  onValueChange={setAssigneeId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {board.members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        <span className="flex items-center gap-2">
                          <Avatar className="size-5">
                            <AvatarFallback className="text-[9px]">
                              {initials(m.user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          {m.user.fullName}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-due">Due date</Label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="task-due"
                      type="button"
                      variant="outline"
                      disabled={!canEdit}
                      className={cn(
                        "w-full justify-start gap-2 font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon size={14} className="shrink-0 opacity-70" />
                      {dueDate
                        ? format(dueDate, "dd MMM yyyy")
                        : "Set due date"}
                      {dueDate && canEdit && (
                        <span
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDueDate(undefined)
                          }}
                          className="ml-auto rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <X size={12} />
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date)
                        setDueDateOpen(false)
                      }}
                    />
                    <div className="flex items-center justify-between border-t border-border px-3 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setDueDate(undefined)
                          setDueDateOpen(false)
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setDueDate(new Date())
                          setDueDateOpen(false)
                        }}
                      >
                        Today
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {board.labels.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Labels</Label>
                <div className="flex flex-wrap gap-1.5">
                  {board.labels.map((label) => {
                    const active = labelIds.includes(label.id)
                    return (
                      <button
                        key={label.id}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => toggleLabel(label.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          active
                            ? "border-transparent text-white"
                            : "border-border text-muted-foreground"
                        )}
                        style={
                          active
                            ? { backgroundColor: label.colorHex }
                            : undefined
                        }
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{
                            backgroundColor: active ? "white" : label.colorHex,
                          }}
                        />
                        {label.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 flex items-center sm:justify-between">
            {task && canEdit ? (
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={14} />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                {canEdit ? "Cancel" : "Close"}
              </Button>
              {canEdit && (
                <Button onClick={handleSave} disabled={!title.trim()}>
                  {isCreate ? "Create task" : "Save changes"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={() => {
                if (task) {
                  deleteTask.mutate(task.id, {
                    onSuccess: () => {
                      setConfirmDelete(false)
                      onClose()
                    },
                  })
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
