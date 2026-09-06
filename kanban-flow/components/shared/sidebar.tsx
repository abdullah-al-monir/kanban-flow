"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import {
  KanbanSquare,
  PanelLeftClose,
  PanelRightClose,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useBoards } from "@/hooks/use-boards"
import { CreateBoardDialog } from "@/components/boards/create-board-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarProps {
  open: boolean
  setOpen: (v: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const params = useParams<{ boardId?: string }>()
  const { data: boards } = useBoards()

  const activeBoardId =
    params?.boardId ??
    (pathname.startsWith("/boards/") ? pathname.split("/")[2] : undefined)

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-border bg-background",
        "transition-all duration-200 ease-in-out",
        open ? "w-64" : "w-16"
      )}
    >
      <Link
        href="/boards"
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-border transition-colors hover:bg-accent/50",
          open ? "px-4" : "justify-center px-2"
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <KanbanSquare size={16} />
        </span>
        {open && (
          <>
            <span className="truncate text-[15px] font-semibold text-foreground">
              Kanban Flow
            </span>
          </>
        )}
      </Link>

      <div
        className={cn(
          "flex shrink-0 items-center py-3",
          open ? "justify-between px-4" : "justify-center px-2"
        )}
      >
        {open && (
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            ALL PROJECTS ({boards?.length ?? 0})
          </span>
        )}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          className="flex size-6 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {open ? <PanelLeftClose size={13} /> : <PanelRightClose size={13} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {(boards ?? []).map((board) => {
          const active = board.id === activeBoardId
          const link = (
            <Link
              href={`/boards/${board.id}`}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                open ? "" : "justify-center px-0 py-2.5",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  active ? "bg-primary" : "bg-muted-foreground/40"
                )}
              />
              {open && <span className="truncate">{board.title}</span>}
            </Link>
          )

          if (open) return <div key={board.id}>{link}</div>

          return (
            <Tooltip key={board.id}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{board.title}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-border py-3",
          open ? "px-4" : "px-2"
        )}
      >
        {open ? (
          <CreateBoardDialog
            trigger={
              <button className="flex w-full items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                <Plus size={15} />
                New Project
              </button>
            }
          />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <CreateBoardDialog
                trigger={
                  <button
                    aria-label="New project"
                    className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus size={16} />
                  </button>
                }
              />
            </TooltipTrigger>
            <TooltipContent side="right">New Project</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  )
}
