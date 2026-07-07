import { useMemo, useState } from "react"
import { Globe2 } from "lucide-react"
import { getNextCronRuns } from "../../lib/cronNextRuns"

interface NextRunsPanelProps {
  expression: string
  isValid: boolean
}

const TIMEZONE_OPTIONS = [
  { value: "local", label: "Local Time" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Chicago", label: "Chicago (CT)" },
  { value: "America/Denver", label: "Denver (MT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "Mumbai / Delhi (IST)" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
] as const

function buildFormatter(timeZone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: timeZone === "local" ? undefined : timeZone,
    timeZoneName: timeZone === "local" ? undefined : "short",
  })
}

export function NextRunsPanel({ expression, isValid }: NextRunsPanelProps) {
  const [timeZone, setTimeZone] = useState("local")

  const { runs, error } = useMemo(() => {
    if (!isValid || !expression.trim()) return { runs: [] as Date[], error: null as string | null }
    return getNextCronRuns(expression, 5)
  }, [expression, isValid])

  const formatter = useMemo(() => buildFormatter(timeZone), [timeZone])

  if (!isValid || !expression.trim()) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Next 5 Upcoming Execution Runs
        </p>
        <label className="flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <select
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            aria-label="Display timezone"
            className="cursor-pointer rounded-md border border-gray-200 bg-white py-1 pl-1.5 pr-6 text-xs text-gray-600 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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
        {timeZone === "local"
          ? "Calculated entirely client-side, using your browser's local system clock and timezone."
          : "Calculated using your browser's local clock, then displayed converted into the selected timezone."}
      </p>
    </div>
  )
}
