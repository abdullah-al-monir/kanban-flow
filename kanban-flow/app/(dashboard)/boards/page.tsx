"use client"

import { ArchivedBoards } from "@/components/boards/archived-boards"
import { BoardsGrid } from "@/components/boards/boards-grid"
import { CreateBoardDialog } from "@/components/boards/create-board-dialog"
import { useHeaderContent } from "@/components/shared/header-content-context"

export default function BoardsPage() {
  useHeaderContent(
    <h1 className="truncate px-2 text-[15px] font-semibold text-foreground">
      Projects
    </h1>,
    <CreateBoardDialog />
  )

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Projects you own or have been invited to.
        </h2>
      </div>
      <BoardsGrid />
      <ArchivedBoards />
    </div>
  )
}
