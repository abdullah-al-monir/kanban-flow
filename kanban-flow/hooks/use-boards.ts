import { boardsApi } from "@/lib/api/boards";
import { queryKeys } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBoards() {
  return useQuery({
    queryKey: queryKeys.boards,
    queryFn: boardsApi.list,
  })
}

export function useArchivedBoards() {
  return useQuery({
    queryKey: queryKeys.archivedBoards,
    queryFn: boardsApi.listArchived,
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) => boardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedBoards })
    },
    meta: { successMessage: "Board created", errorMessage: "Couldn't create board" },
  })
}

export function useRestoreBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (boardId: string) => boardsApi.restore(boardId),
    onSuccess: (_board, boardId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedBoards })
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },
    meta: { successMessage: "Board restored", errorMessage: "Couldn't restore board" },
  })
}
