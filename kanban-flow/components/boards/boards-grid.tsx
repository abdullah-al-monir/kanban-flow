"use client"

import { LayoutGrid } from "lucide-react"
import { BoardCard } from "@/components/boards/board-card"
import { CreateBoardDialog } from "@/components/boards/create-board-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { useBoards } from "@/hooks/use-boards"

export function BoardsGrid() {
  const { data: boards, isLoading } = useBoards()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    )
  }

  if (!boards || boards.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No boards yet"
        description="Create your first board to start organizing work into columns and tasks."
        action={<CreateBoardDialog />}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  )
}
