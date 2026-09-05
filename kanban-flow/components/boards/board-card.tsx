"use client"

import Link from "next/link"
import { Columns3, Users } from "lucide-react"
import { RoleBadge } from "@/components/kanban/role-badge"
import type { BoardSummary } from "@/lib/types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)
export function BoardCard({ board }: { board: BoardSummary }) {
  return (
    <Link
      href={`/boards/${board.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-[15px] font-semibold text-card-foreground">
          {board.title}
        </h3>
        <RoleBadge role={board.myRole} className="shrink-0 text-[10px]" />
      </div>

      {board.description ? (
        <p className="line-clamp-2 flex-1 text-[13px] text-muted-foreground">
          {board.description}
        </p>
      ) : (
        <p className="flex-1 text-[13px] text-muted-foreground/60 italic">
          No description
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Columns3 size={13} />
          {board._count.columns}{" "}
          {board._count.columns === 1 ? "column" : "columns"}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {board._count.members}{" "}
          {board._count.members === 1 ? "member" : "members"}
        </span>

        <span
          className="ml-auto tabular-nums"
          title={dayjs(board.updatedAt).format("MMM D, YYYY h:mm A")}
        >
          {dayjs(board.updatedAt).fromNow()}
        </span>
      </div>
    </Link>
  )
}
