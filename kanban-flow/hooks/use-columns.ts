import { useMutation, useQueryClient } from "@tanstack/react-query"
import { columnsApi } from "@/lib/api/columns"
import { queryKeys } from "@/lib/query-keys"

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => columnsApi.create(boardId, title),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: {
      successMessage: "Column added",
      errorMessage: "Couldn't add column",
    },
  })
}

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      columnsApi.update(columnId, title),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: {
      successMessage: "Column renamed",
      errorMessage: "Couldn't rename column",
    },
  })
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (columnId: string) => columnsApi.remove(columnId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: {
      successMessage: "Column deleted",
      errorMessage: "Couldn't delete column",
    },
  })
}

export function useReorderColumn(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      columnId,
      beforeColumnId,
      afterColumnId,
    }: {
      columnId: string
      beforeColumnId?: string
      afterColumnId?: string
    }) => columnsApi.reorder(columnId, { beforeColumnId, afterColumnId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    onError: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) }),
    meta: { errorMessage: "Couldn't reorder column — reverted" },
  })
}
