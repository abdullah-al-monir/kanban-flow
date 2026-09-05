export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatDueDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  const today = new Date()
  const isSameYear = date.getFullYear() === today.getFullYear()
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: isSameYear ? undefined : "numeric",
  })
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false
  const date = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function toDateInputValue(iso: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}
