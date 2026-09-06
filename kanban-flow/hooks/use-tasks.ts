import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksApi, type TaskInput } from "@/lib/api/tasks"
import { queryKeys } from "@/lib/query-keys"
import type { BoardDetail } from "@/lib/types"

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: TaskInput }) =>
      tasksApi.create(columnId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: {
      successMessage: "Task created",
      errorMessage: "Couldn't create task",
    },
  })
}

export function useUpdateTask(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string
      data: Partial<TaskInput> & { isArchived?: boolean }
    }) => tasksApi.update(taskId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: {
      successMessage: "Task updated",
      errorMessage: "Couldn't update task",
    },
  })
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: {
      successMessage: "Task deleted",
      errorMessage: "Couldn't delete task",
    },
  })
}

export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      targetColumnId,
      targetIndex,
    }: {
      taskId: string
      targetColumnId: string
      targetIndex: number
    }) => tasksApi.move(taskId, { targetColumnId, targetIndex }),

    onMutate: async ({ taskId, targetColumnId, targetIndex }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) })

      const previousBoard = queryClient.getQueryData<BoardDetail>(
        queryKeys.board(boardId)
      )

      queryClient.setQueryData<BoardDetail>(queryKeys.board(boardId), (old) => {
        if (!old) return old

        const columns = old.columns.map((c) => ({ ...c, tasks: [...c.tasks] }))

        const sourceCol = columns.find((c) =>
          c.tasks.some((t) => t.id === taskId)
        )
        const targetCol = columns.find((c) => c.id === targetColumnId)
        if (!sourceCol || !targetCol) return old

        const taskIdx = sourceCol.tasks.findIndex((t) => t.id === taskId)
        const [task] = sourceCol.tasks.splice(taskIdx, 1)

        const insertIdx = Math.max(
          0,
          Math.min(targetIndex, targetCol.tasks.length)
        )
        targetCol.tasks.splice(insertIdx, 0, task)

        return { ...old, columns }
      })

      return { previousBoard }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          queryKeys.board(boardId),
          context.previousBoard
        )
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },

    meta: { errorMessage: "Couldn't move task — reverted" },
  })
}
