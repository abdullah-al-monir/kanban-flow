import { boardsApi } from "@/lib/api/boards";
import { queryKeys } from "@/lib/query-keys";
import type { BoardRole } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: queryKeys.board(boardId),
    queryFn: () => boardsApi.get(boardId),
    enabled: !!boardId,
  })
}


export function useMyBoardRole(boardId: string): BoardRole | null {
  const { data } = useBoard(boardId)
  const userId = useAuthStore((s) => s.user?.id)
  if (!data || !userId) return null
  return data.members.find((m) => m.userId === userId)?.role ?? null
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title?: string; description?: string; isArchived?: boolean }) =>
      boardsApi.update(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.boards })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedBoards })
    },
    meta: { successMessage: "Board updated", errorMessage: "Couldn't update board" },
  })
}

export function useDeleteBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (boardId: string) => boardsApi.remove(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedBoards })
    },
    meta: { successMessage: "Board deleted", errorMessage: "Couldn't delete board" },
  })
}
