import { api } from "./client"
import type {
  BoardDetail,
  BoardMember,
  BoardRole,
  BoardSummary,
} from "@/lib/types"

export const boardsApi = {
  list: () => api.get<BoardSummary[]>("/boards"),

  listArchived: () => api.get<BoardSummary[]>("/boards/archived"),

  get: (boardId: string) => api.get<BoardDetail>(`/boards/${boardId}`),

  create: (data: { title: string; description?: string }) =>
    api.post<BoardSummary>("/boards", data),

  update: (
    boardId: string,
    data: { title?: string; description?: string; isArchived?: boolean }
  ) => api.patch<BoardSummary>(`/boards/${boardId}`, data),

  restore: (boardId: string) =>
    api.patch<BoardSummary>(`/boards/${boardId}/restore`),

  remove: (boardId: string) =>
    api.delete<{ success: true }>(`/boards/${boardId}`),

  listMembers: (boardId: string) =>
    api.get<BoardMember[]>(`/boards/${boardId}/members`),

  addMember: (boardId: string, data: { email: string; role?: BoardRole }) =>
    api.post<BoardMember>(`/boards/${boardId}/members`, data),

  updateMemberRole: (boardId: string, memberUserId: string, role: BoardRole) =>
    api.patch<BoardMember>(`/boards/${boardId}/members/${memberUserId}`, {
      role,
    }),

  removeMember: (boardId: string, memberUserId: string) =>
    api.delete<{ success: true }>(`/boards/${boardId}/members/${memberUserId}`),
}
