"use client"

import { useState } from "react"
import {
  Loader2,
  PlusCircle,
  ArrowRightLeft,
  Pencil,
  Archive,
  UserPlus,
  UserMinus,
  History,
  Trash2,
  Settings,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { useActivities } from "@/hooks/use-activities"
import { activityMessage, timeAgo } from "@/lib/activity-format"
import { initials } from "@/lib/format"
import type { ActivityType } from "@/lib/types"

const TYPE_ICON: Record<
  ActivityType,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  TASK_CREATED: PlusCircle,
  TASK_MOVED: ArrowRightLeft,
  TASK_UPDATED: Pencil,
  TASK_ARCHIVED: Archive,
  TASK_DELETED: Trash2,
  MEMBER_ADDED: UserPlus,
  MEMBER_REMOVED: UserMinus,
  COLUMN_CREATED: PlusCircle,
  COLUMN_UPDATED: Pencil,
  COLUMN_REORDERED: ArrowRightLeft,
  COLUMN_DELETED: Trash2,
  BOARD_UPDATED: Settings,
}

const TYPE_COLOR: Record<ActivityType, string> = {
  TASK_CREATED: "bg-emerald-500/15 text-emerald-500",
  TASK_UPDATED: "bg-blue-500/15 text-blue-500",
  TASK_MOVED: "bg-amber-500/15 text-amber-500",
  TASK_ARCHIVED: "bg-red-500/15 text-red-500",
  TASK_DELETED: "bg-red-500/15 text-red-500",
  MEMBER_ADDED: "bg-violet-500/15 text-violet-500",
  MEMBER_REMOVED: "bg-violet-500/15 text-violet-500",
  COLUMN_CREATED: "bg-emerald-500/15 text-emerald-500",
  COLUMN_UPDATED: "bg-blue-500/15 text-blue-500",
  COLUMN_REORDERED: "bg-amber-500/15 text-amber-500",
  COLUMN_DELETED: "bg-red-500/15 text-red-500",
  BOARD_UPDATED: "bg-slate-500/15 text-slate-400",
}
const PAGE_SIZE = 20

export function ActivitiesDialog({
  boardId,
  open,
  onOpenChange,
}: {
  boardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [offset, setOffset] = useState(0)
  const { data, isLoading, isFetching } = useActivities(
    boardId,
    { limit: PAGE_SIZE, offset },
    { enabled: open }
  )

  const items = data?.items ?? []
  const hasMore = data ? offset + items.length < data.total : false

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setOffset(0)
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[80vh] max-w-lg overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="text-base">Activity</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2
                className="animate-spin text-muted-foreground"
                size={20}
              />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity yet"
              description="Actions on this board will show up here."
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((activity) => {
                const Icon = TYPE_ICON[activity.type]
                return (
                  <li key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[activity.type]}`}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        {activityMessage(activity)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {timeAgo(activity.createdAt)}
                      </p>
                    </div>
                    <Avatar className="size-6 shrink-0">
                      <AvatarFallback className="text-[9px] font-semibold">
                        {initials(activity.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {hasMore && (
          <div className="border-t border-border px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={isFetching}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              {isFetching ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
