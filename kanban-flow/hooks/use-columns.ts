import { useMutation, useQueryClient } from "@tanstack/react-query"
import { columnsApi } from "@/lib/api/columns"
import { queryKeys } from "@/lib/query-keys"
import type { BoardDetail } from "@/lib/types"

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

    onMutate: async ({ columnId, beforeColumnId, afterColumnId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) })

      const previousBoard = queryClient.getQueryData<BoardDetail>(
        queryKeys.board(boardId)
      )

      queryClient.setQueryData<BoardDetail>(queryKeys.board(boardId), (old) => {
        if (!old) return old

        const columns = [...old.columns]
        const fromIdx = columns.findIndex((c) => c.id === columnId)
        if (fromIdx === -1) return old

        const [moved] = columns.splice(fromIdx, 1)

        let insertIdx = columns.length
        if (afterColumnId) {
          const afterIdx = columns.findIndex((c) => c.id === afterColumnId)
          insertIdx = afterIdx === -1 ? columns.length : afterIdx + 1
        } else if (beforeColumnId) {
          const beforeIdx = columns.findIndex((c) => c.id === beforeColumnId)
          insertIdx = beforeIdx === -1 ? 0 : beforeIdx
        } else {
          insertIdx = 0
        }

        columns.splice(insertIdx, 0, moved)

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

    meta: { errorMessage: "Couldn't reorder column — reverted" },
  })
}
