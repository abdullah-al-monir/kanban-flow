"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users"
import { queryKeys } from "@/lib/query-keys"
import type { PublicUser } from "@/lib/types"

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Pick<PublicUser, "email" | "fullName">>) =>
      usersApi.updateMe(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.me, updated)
    },
  })
}
