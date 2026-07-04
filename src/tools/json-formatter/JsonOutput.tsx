import { CopyButton } from "../../components/ui/CopyButton"
import { ErrorBadge } from "../../components/ui/ErrorBadge"

interface JsonOutputProps {
  formatted: string | null
  error: string | null
}

export function JsonOutput({ formatted, error }: JsonOutputProps) {
  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Output
          </label>
          <ErrorBadge message="Invalid JSON syntax" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-mono text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!formatted) {
    return (
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Output
        </label>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 p-8 dark:border-gray-700">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Paste JSON and click Format
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Output
        </label>
        <CopyButton text={formatted} />
      </div>
      <pre className="overflow-x-auto rounded-lg border border-green-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 dark:border-green-800 dark:bg-gray-900 dark:text-gray-100">
        <code>{formatted}</code>
      </pre>
    </div>
  )
}
