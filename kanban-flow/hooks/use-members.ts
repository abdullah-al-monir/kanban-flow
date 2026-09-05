import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { boardsApi } from "@/lib/api/boards"
import { usersApi } from "@/lib/api/users"
import { queryKeys } from "@/lib/query-keys"
import type { BoardRole } from "@/lib/types"

export function useBoardMembers(boardId: string) {
  return useQuery({
    queryKey: queryKeys.members(boardId),
    queryFn: () => boardsApi.listMembers(boardId),
    enabled: !!boardId,
  })
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.userSearch(query),
    queryFn: () => usersApi.search(query),
    enabled: query.trim().length >= 2,
  })
}

export function useInviteMember(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; role?: BoardRole }) => boardsApi.addMember(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(boardId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },
    meta: { successMessage: "Member invited", errorMessage: "Couldn't invite member" },
  })
}

export function useUpdateMemberRole(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberUserId, role }: { memberUserId: string; role: BoardRole }) =>
      boardsApi.updateMemberRole(boardId, memberUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(boardId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },
    meta: { successMessage: "Role updated", errorMessage: "Couldn't update role" },
  })
}

export function useRemoveMember(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberUserId: string) => boardsApi.removeMember(boardId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(boardId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) })
    },
    meta: { successMessage: "Member removed", errorMessage: "Couldn't remove member" },
  })
}
