import type { BoardRole } from "@/lib/types"

export const ROLE_RANK: Record<BoardRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
}

export function roleSatisfies(actual: BoardRole | null, minimum: BoardRole): boolean {
  if (!actual) return false
  return ROLE_RANK[actual] >= ROLE_RANK[minimum]
}

export const ROLE_LABELS: Record<BoardRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
}

export const ASSIGNABLE_ROLES: BoardRole[] = ["ADMIN", "EDITOR", "VIEWER"]


export const COLUMN_ACCENTS = [
  "var(--column-accent-1)",
  "var(--column-accent-2)",
  "var(--column-accent-3)",
  "var(--column-accent-4)",
  "var(--column-accent-5)",
]
