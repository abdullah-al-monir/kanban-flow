import { cn } from "cn"
import { Kanban } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Kanban
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-pulse text-primary", className)}
      {...props}
    />
  )
}

export { Spinner }
