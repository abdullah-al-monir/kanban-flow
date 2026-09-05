import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksApi, type TaskInput } from "@/lib/api/tasks"
import { queryKeys } from "@/lib/query-keys"

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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    onError: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: { errorMessage: "Couldn't move task — reverted" },
  })
}
