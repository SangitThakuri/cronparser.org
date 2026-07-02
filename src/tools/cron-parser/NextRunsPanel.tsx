import { useMemo } from "react"
import { getNextCronRuns } from "../../lib/cronNextRuns"

interface NextRunsPanelProps {
  expression: string
  isValid: boolean
}

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

export function NextRunsPanel({ expression, isValid }: NextRunsPanelProps) {
  const { runs, error } = useMemo(() => {
    if (!isValid || !expression.trim()) return { runs: [] as Date[], error: null as string | null }
    return getNextCronRuns(expression, 5)
  }, [expression, isValid])

  if (!isValid || !expression.trim()) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Next 5 Upcoming Execution Runs
      </p>

      {error && <p className="text-sm text-gray-400 dark:text-gray-500">{error}</p>}

      {!error && runs.length > 0 && (
        <ol className="space-y-2">
          {runs.map((run, i) => (
            <li
              key={run.getTime()}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {i + 1}
              </span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {formatter.format(run)}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
        Calculated entirely client-side, using your browser's local system clock and timezone.
      </p>
    </div>
  )
}
