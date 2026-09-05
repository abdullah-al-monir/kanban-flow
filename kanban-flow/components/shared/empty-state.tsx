import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center",
        className
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon size={20} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
