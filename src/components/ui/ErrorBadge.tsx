import { AlertTriangle } from "lucide-react"

interface ErrorBadgeProps {
  message: string
}

export function ErrorBadge({ message }: ErrorBadgeProps) {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  )
}
