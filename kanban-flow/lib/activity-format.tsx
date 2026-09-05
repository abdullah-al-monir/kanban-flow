import type { ReactNode } from "react"
import type { Activity } from "@/lib/types"

function Actor({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-foreground">{children}</span>
}

function Entity({ children }: { children: ReactNode }) {
  return <span className="font-medium text-primary">{children}</span>
}

export function activityMessage(activity: Activity): ReactNode {
  const actor = activity.user.fullName
  const taskTitle = activity.task?.title ?? "a task"

  switch (activity.type) {
    case "TASK_CREATED":
      return (
        <>
          <Actor>{actor}</Actor> created{" "}
          <Entity>&quot;{taskTitle}&quot;</Entity>
        </>
      )
    case "TASK_MOVED": {
      const from = (activity.payload?.fromColumn as string) ?? "another column"
      const to =
        (activity.payload?.toColumn as string) ??
        activity.task?.column.title ??
        "a column"
      return (
        <>
          <Actor>{actor}</Actor> moved <Entity>&quot;{taskTitle}&quot;</Entity>{" "}
          from <Entity>{from}</Entity> to <Entity>{to}</Entity>
        </>
      )
    }
    case "TASK_UPDATED":
      return (
        <>
          <Actor>{actor}</Actor> updated{" "}
          <Entity>&quot;{taskTitle}&quot;</Entity>
        </>
      )
    case "TASK_ARCHIVED":
      return (
        <>
          <Actor>{actor}</Actor> archived{" "}
          <Entity>&quot;{taskTitle}&quot;</Entity>
        </>
      )
    case "TASK_DELETED":
      return (
        <>
          <Actor>{actor}</Actor> deleted{" "}
          <Entity>&quot;{taskTitle}&quot;</Entity>
        </>
      )
    case "MEMBER_ADDED":
      return (
        <>
          <Actor>{actor}</Actor> added a member to the board
        </>
      )
    case "MEMBER_REMOVED":
      return (
        <>
          <Actor>{actor}</Actor> removed a member from the board
        </>
      )
    case "COLUMN_CREATED": {
      const title = (activity.payload?.title as string) ?? "a column"
      return (
        <>
          <Actor>{actor}</Actor> created <Entity>&quot;{title}&quot;</Entity>
        </>
      )
    }
    case "COLUMN_UPDATED": {
      const title = (activity.payload?.title as string) ?? "a column"
      return (
        <>
          <Actor>{actor}</Actor> updated <Entity>&quot;{title}&quot;</Entity>
        </>
      )
    }
    case "COLUMN_REORDERED": {
      const title = (activity.payload?.title as string) ?? "a column"
      return (
        <>
          <Actor>{actor}</Actor> reordered <Entity>&quot;{title}&quot;</Entity>
        </>
      )
    }
    case "COLUMN_DELETED": {
      const title = (activity.payload?.title as string) ?? "a column"
      return (
        <>
          <Actor>{actor}</Actor> deleted <Entity>&quot;{title}&quot;</Entity>
        </>
      )
    }
    case "BOARD_UPDATED":
      return (
        <>
          <Actor>{actor}</Actor> updated the board settings
        </>
      )
    default:
      return (
        <>
          <Actor>{actor}</Actor> did something
        </>
      )
  }
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
