import { api } from "./client"
import type { Column } from "@/lib/types"

export const columnsApi = {
  create: (boardId: string, title: string) =>
    api.post<Column>(`/boards/${boardId}/columns`, { title }),

  update: (columnId: string, title: string) =>
    api.patch<Column>(`/columns/${columnId}`, { title }),

  remove: (columnId: string) =>
    api.delete<{ success: true }>(`/columns/${columnId}`),

  reorder: (
    columnId: string,
    data: { beforeColumnId?: string; afterColumnId?: string }
  ) => api.post<Column>(`/columns/${columnId}/reorder`, data),
}
