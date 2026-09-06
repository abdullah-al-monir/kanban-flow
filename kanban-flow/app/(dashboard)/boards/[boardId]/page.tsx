"use client"

import { useParams, useRouter } from "next/navigation"
import { FolderX} from "lucide-react"
import { BoardHeader } from "@/components/kanban/board-header"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { EmptyState } from "@/components/shared/empty-state"
import { useBoard, useMyBoardRole } from "@/hooks/use-board"
import { ApiClientError } from "@/lib/api/client"
import { Spinner } from "@/components/ui/spinner";

export default function BoardPage() {
  const params = useParams<{ boardId: string }>()
  const router = useRouter()
  const { data: board, isLoading, error } = useBoard(params.boardId)
  const myRole = useMyBoardRole(params.boardId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner/>
      </div>
    )
  }

  if (error || !board) {
    const notFound = error instanceof ApiClientError && error.status === 404
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          icon={FolderX}
          title={notFound ? "Project not found" : "Something went wrong"}
          description={
            notFound
              ? "This project doesn't exist, or you don't have access to it."
              : "We couldn't load this project. Please try again."
          }
          action={
            <button
              onClick={() => router.push("/boards")}
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to your projects
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <BoardHeader board={board} myRole={myRole} />
      <KanbanBoard board={board} myRole={myRole} />
    </div>
  )
}
