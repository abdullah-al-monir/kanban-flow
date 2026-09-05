"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  closestCorners,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KanbanColumn, resolveColumnId } from "@/components/kanban/column"
import { TaskCard } from "@/components/kanban/task-card"
import { TaskDialog } from "@/components/kanban/task-dialog"
import { useCreateColumn, useReorderColumn } from "@/hooks/use-columns"
import { useMoveTask } from "@/hooks/use-tasks"
import { COLUMN_ACCENTS, roleSatisfies } from "@/lib/constants"
import type { BoardDetail, BoardRole, Column, Task } from "@/lib/types"

const collisionDetectionStrategy: CollisionDetection = (args) => {
  if (args.active.data.current?.type === "column") {
    const columnContainers = args.droppableContainers.filter(
      (container) => container.data.current?.type === "column"
    )
    return closestCenter({ ...args, droppableContainers: columnContainers })
  }
  return closestCorners(args)
}

interface KanbanBoardProps {
  board: BoardDetail
  myRole: BoardRole | null
}

export function KanbanBoard({ board, myRole }: KanbanBoardProps) {
  const canEdit = roleSatisfies(myRole, "EDITOR")

  const moveTask = useMoveTask(board.id)
  const reorderColumn = useReorderColumn(board.id)
  const createColumn = useCreateColumn(board.id)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskDialogColumnId, setTaskDialogColumnId] = useState<string | null>(
    null
  )
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")

  const [columns, setColumns] = useState<Column[]>(board.columns)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)

  useEffect(() => {
    if (activeTask || activeColumn) return
    setColumns(board.columns)
  }, [board.columns, activeTask, activeColumn])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === "column") {
      setActiveColumn(columns.find((c) => c.id === active.id) ?? null)
      return
    }
    const column = columns.find((c) => c.tasks.some((t) => t.id === active.id))
    setActiveTask(column?.tasks.find((t) => t.id === active.id) ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.data.current?.type === "column") return

    const activeId = active.id as string
    const overId = resolveColumnId(over.id as string)
    if (activeId === overId) return

    const sourceColIdx = columns.findIndex((c) =>
      c.tasks.some((t) => t.id === activeId)
    )
    const overIsColumn = columns.some((c) => c.id === overId)
    const targetColIdx = overIsColumn
      ? columns.findIndex((c) => c.id === overId)
      : columns.findIndex((c) => c.tasks.some((t) => t.id === overId))
    if (sourceColIdx === -1 || targetColIdx === -1) return

    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, tasks: [...c.tasks] }))
      const sourceCol = next[sourceColIdx]
      const targetCol = next[targetColIdx]
      const taskIdx = sourceCol.tasks.findIndex((t) => t.id === activeId)
      const [moved] = sourceCol.tasks.splice(taskIdx, 1)
      const overIdx = overIsColumn
        ? targetCol.tasks.length
        : targetCol.tasks.findIndex((t) => t.id === overId)
      targetCol.tasks.splice(
        overIdx === -1 ? targetCol.tasks.length : overIdx,
        0,
        moved
      )
      return next
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveColumn(null)
    if (!over) return

    if (active.data.current?.type === "column") {
      const oldIdx = columns.findIndex((c) => c.id === active.id)
      const newIdx = columns.findIndex((c) => c.id === over.id)
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return
      const reordered = arrayMove(columns, oldIdx, newIdx)
      setColumns(reordered)
      const ids = reordered.map((c) => c.id)
      const idx = ids.indexOf(active.id as string)
      reorderColumn.mutate({
        columnId: active.id as string,
        beforeColumnId: idx > 0 ? ids[idx - 1] : undefined,
        afterColumnId: idx < ids.length - 1 ? ids[idx + 1] : undefined,
      })
      return
    }

    const taskId = active.id as string
    const targetColumn = columns.find((c) =>
      c.tasks.some((t) => t.id === taskId)
    )
    if (!targetColumn) return
    const targetIndex = targetColumn.tasks.findIndex((t) => t.id === taskId)
    const task = targetColumn.tasks[targetIndex]
    const sourceColumn = board.columns.find((c) =>
      c.tasks.some((t) => t.id === taskId)
    )

    moveTask.mutate(
      { taskId, targetColumnId: targetColumn.id, targetIndex },
      {
        onSuccess: () => {
          if (task && sourceColumn && sourceColumn.id !== targetColumn.id) {
            toast.success(`${task.title} moved to ${targetColumn.title}`)
          }
        },
        onError: () => toast.error("Couldn't move the task. Please try again."),
      }
    )
  }

  const submitNewColumn = () => {
    const trimmed = newColumnTitle.trim()
    if (trimmed) createColumn.mutate(trimmed)
    setNewColumnTitle("")
    setAddingColumn(false)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full min-h-0 flex-1 gap-4 overflow-x-auto p-4">
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column, i) => (
            <KanbanColumn
              key={column.id}
              boardId={board.id}
              column={column}
              canEdit={canEdit}
              accentColor={COLUMN_ACCENTS[i % COLUMN_ACCENTS.length]}
              onOpenTask={setSelectedTask}
              onAddTask={setTaskDialogColumnId}
            />
          ))}
        </SortableContext>

        {canEdit && (
          <div className="w-72 shrink-0">
            {addingColumn ? (
              <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-2.5">
                <Input
                  autoFocus
                  placeholder="Column name"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitNewColumn()
                    if (e.key === "Escape") {
                      setNewColumnTitle("")
                      setAddingColumn(false)
                    }
                  }}
                  className="h-8 text-[13px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={submitNewColumn}
                  >
                    Add column
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 text-xs"
                    onClick={() => {
                      setNewColumnTitle("")
                      setAddingColumn(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="h-10 w-full justify-start gap-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                onClick={() => setAddingColumn(true)}
              >
                <Plus size={15} />
                Add column
              </Button>
            )}
          </div>
        )}

        <TaskDialog
          board={board}
          canEdit={canEdit}
          task={selectedTask}
          createInColumnId={taskDialogColumnId}
          onClose={() => {
            setSelectedTask(null)
            setTaskDialogColumnId(null)
          }}
        />
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            boardId={board.id}
            onClick={() => {}}
            overlay
          />
        )}
        {activeColumn && (
          <div className="flex h-20 w-72 shrink-0 items-center rounded-xl border-t-2 bg-muted/60 px-3 text-sm font-semibold shadow-lg">
            {activeColumn.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
