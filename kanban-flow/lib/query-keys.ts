export const queryKeys = {
  me: ["me"] as const,
  boards: ["boards"] as const,
  archivedBoards: ["boards", "archived"] as const,
  board: (boardId: string) => ["boards", boardId] as const,
  members: (boardId: string) => ["boards", boardId, "members"] as const,
  userSearch: (query: string) => ["users", "search", query] as const,
}
