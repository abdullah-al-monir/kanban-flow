import { ArchivedBoards } from "@/components/boards/archived-boards"
import { BoardsGrid } from "@/components/boards/boards-grid"
import { CreateBoardDialog } from "@/components/boards/create-board-dialog"

export default function BoardsPage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Your boards</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Boards you own or have been invited to.
          </p>
        </div>
        <CreateBoardDialog />
      </div>
      <BoardsGrid />
      <ArchivedBoards />
    </div>
  )
}
