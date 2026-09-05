import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ROLE_LABELS } from "@/lib/constants"
import type { BoardRole } from "@/lib/types"

const ROLE_STYLES: Record<BoardRole, string> = {
  OWNER: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  ADMIN: "bg-primary/10 text-primary border-primary/20",
  EDITOR: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  VIEWER: "bg-muted text-muted-foreground border-border",
}

export function RoleBadge({ role, className }: { role: BoardRole; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", ROLE_STYLES[role], className)}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}
