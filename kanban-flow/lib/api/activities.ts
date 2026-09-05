import { api } from "./client"
import type { ActivityListResponse, ActivityType } from "@/lib/types"

export const activitiesApi = {
  list: (
    boardId: string,
    params: { type?: ActivityType; limit?: number; offset?: number } = {}
  ) => {
    const query = new URLSearchParams()
    if (params.type) query.set("type", params.type)
    if (params.limit !== undefined) query.set("limit", String(params.limit))
    if (params.offset !== undefined) query.set("offset", String(params.offset))
    const qs = query.toString()
    return api.get<ActivityListResponse>(
      `/boards/${boardId}/activities${qs ? `?${qs}` : ""}`
    )
  },
}
