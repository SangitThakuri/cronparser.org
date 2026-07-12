import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { Globe2, Rewind } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getPreviousCronRuns } from "../../lib/cronNextRuns"

const TIMEZONE_OPTIONS = [
  { value: "local", label: "Local Time" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { value: "Europe/London", label: "London" },
  { value: "Asia/Kolkata", label: "Mumbai / Delhi (IST)" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
] as const

const COUNT_OPTIONS = [1, 5, 10] as const

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

export default function PreviousRun() {
  const [expression, setExpression] = useState("0 9 * * 1-5")
  const [count, setCount] = useState<(typeof COUNT_OPTIONS)[number]>(5)
  const [timeZone, setTimeZone] = useState("local")

  const { description, error } = useMemo(() => {
    if (!expression.trim()) return { description: null, error: null }
    try {
      return {
        description: cronstrue.toString(expression.trim(), { use24HourTimeFormat: false, verbose: true }),
        error: null,
      }
    } catch (e) {
      return { description: null, error: String(e).replace(/^Error:\s*/i, "") }
    }
  }, [expression])

  const isValid = !!description && !error

  const { runs, error: runError } = useMemo(() => {
    if (!isValid) return { runs: [] as Date[], error: null as string | null }
    return getPreviousCronRuns(expression, count)
  }, [expression, count, isValid])

  const formatter = useMemo(() => buildFormatter(timeZone), [timeZone])

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Previous Cron Run Calculator — Find the Last Execution Time | CronParser"
        description="Calculate when a cron expression last ran — the previous 1, 5, or 10 execution times, walked backward from now, with timezone support. Entirely client-side."
        path="/previous-run"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Previous Run Calculator" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Previous Run Calculator</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Find out when a cron expression last ran — walking backward from right now.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
          {expression && <ClearInputButton onClear={() => setExpression("")} />}
        </div>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. 0 9 * * 1-5"
          spellCheck={false}
          className={`w-full rounded-lg border p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950"
              : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          }`}
        />
        {description && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        {error && <p className="mt-2 font-mono text-xs text-red-500">{error}</p>}
      </div>

      {isValid && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  count === n
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                Last {n}
              </button>
            ))}
          </div>
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
      )}

      {isValid && runError && <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">{runError}</p>}

      {isValid && runs.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <Rewind className="h-3.5 w-3.5" />
            <p className="text-xs font-semibold uppercase tracking-wider">Most Recent Runs</p>
          </div>
          <ol className="flex flex-col gap-2">
            {runs.map((run, i) => (
              <li
                key={run.getTime()}
                className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {i + 1}
                  </span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">{formatter.format(run)}</span>
                </div>
                <CopyButton text={run.toISOString()} />
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Paste a cron expression — the tool walks backward from the current moment to find its most recent matching runs.",
          "Choose Last 1, 5, or 10 to control how many past runs are shown.",
          "Use the timezone dropdown to view those same instants converted into another timezone.",
          "Copy any timestamp as an ISO 8601 string with the Copy button.",
        ]}
        faqs={[
          {
            q: "How is this different from the Next Run Calculator?",
            a: "This walks backward in time from now to find when a schedule last fired, instead of forward to find when it will fire next — useful for auditing whether a job actually ran when expected, or diagnosing a gap in job history.",
          },
          {
            q: "Can I calculate previous runs from a specific point in time, not just now?",
            a: "This tool always calculates from the current moment. For a specific date, use the Schedule Visualizer's Calendar view and click any day to see that date's exact run times.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All calculation happens entirely in your browser using local JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "countdown", "visualizer"]} />
    </div>
  )
}
