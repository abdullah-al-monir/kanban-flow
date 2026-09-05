import { useQuery } from "@tanstack/react-query"
import { activitiesApi } from "@/lib/api/activities"
import { queryKeys } from "@/lib/query-keys"
import type { ActivityType } from "@/lib/types"

export function useActivities(
  boardId: string,
  params: { type?: ActivityType; limit?: number; offset?: number } = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.board(boardId), "activities", params],
    queryFn: () => activitiesApi.list(boardId, params),
    enabled: options?.enabled ?? true,
    placeholderData: (prev) => prev, 
  })
}
