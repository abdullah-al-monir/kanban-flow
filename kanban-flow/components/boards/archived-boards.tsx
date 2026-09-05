"use client"

import { ArchivedBoardCard } from "@/components/boards/archived-board-card"
import { useArchivedBoards } from "@/hooks/use-boards"
import { Archive } from "lucide-react"

export function ArchivedBoards() {
  const { data: boards, isLoading } = useArchivedBoards()

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Archive size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Archived boards
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="h-52 animate-pulse rounded-xl bg-muted/60" />
        </div>
      </section>
    )
  }

  if (!boards || boards.length === 0) return null

  return (
    <section className="mt-10 border-t border-border pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Archive size={16} className="text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Archived boards
          </h2>
          <p className="text-xs text-muted-foreground">
            Restore a board or delete it permanently.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {boards.map((board) => (
          <ArchivedBoardCard key={board.id} board={board} />
        ))}
      </div>
    </section>
  )
}
