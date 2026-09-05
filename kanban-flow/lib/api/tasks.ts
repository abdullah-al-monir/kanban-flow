import { api } from "./client"
import type { Task } from "@/lib/types"

export interface TaskInput {
  title: string
  description?: string
  assigneeId?: string | null
  dueDate?: string | null
  labelIds?: string[]
}

export const tasksApi = {
  get: (taskId: string) => api.get<Task>(`/tasks/${taskId}`),

  create: (columnId: string, data: TaskInput) =>
    api.post<Task>(`/columns/${columnId}/tasks`, data),

  update: (
    taskId: string,
    data: Partial<TaskInput> & { isArchived?: boolean }
  ) => api.patch<Task>(`/tasks/${taskId}`, data),

  remove: (taskId: string) => api.delete<{ success: true }>(`/tasks/${taskId}`),

  move: (
    taskId: string,
    data: { targetColumnId: string; targetIndex: number }
  ) => api.post<Task>(`/tasks/${taskId}/move`, data),
}
