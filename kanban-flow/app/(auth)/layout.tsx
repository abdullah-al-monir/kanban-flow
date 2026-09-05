export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            K
          </span>
          <h1 className="mt-2 text-lg font-semibold text-foreground">
            Kanban Flow
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
