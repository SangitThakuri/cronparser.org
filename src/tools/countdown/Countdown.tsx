import { useEffect, useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { Globe2, Timer } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ShareButton } from "../../components/ui/ShareButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getNextCronRuns } from "../../lib/cronNextRuns"

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

function formatDuration(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

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

export default function Countdown() {
  const [expression, setExpression] = useState("*/15 * * * *")
  const [timeZone, setTimeZone] = useState("local")
  const [now, setNow] = useState(() => new Date())

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

  const [nextRun, setNextRun] = useState<Date | null>(null)

  useEffect(() => {
    if (!isValid) {
      setNextRun(null)
      return
    }
    const { runs } = getNextCronRuns(expression, 1, now)
    setNextRun(runs[0] ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, isValid])

  // Tick every second; auto-advance to the next run once the countdown reaches zero.
  useEffect(() => {
    const interval = setInterval(() => {
      const current = new Date()
      setNow(current)
      if (nextRun && current >= nextRun) {
        const { runs } = getNextCronRuns(expression, 1, current)
        setNextRun(runs[0] ?? null)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expression, nextRun])

  const remaining = nextRun ? formatDuration(nextRun.getTime() - now.getTime()) : null
  const formatter = useMemo(() => buildFormatter(timeZone), [timeZone])

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Next Run Countdown — Live Timer Until Next Execution | CronParser"
        description="A live, second-by-second countdown until a cron expression's next scheduled execution, with timezone support and automatic refresh — entirely client-side."
        path="/countdown"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Next Run Countdown" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Next Run Countdown</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          A live countdown until a cron expression's next scheduled execution.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
          {expression && <ClearInputButton onClear={() => setExpression("")} />}
        </div>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. */15 * * * *"
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

      {isValid && remaining && nextRun && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-950">
          <div className="mb-4 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <Timer className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Time Until Next Run</p>
          </div>
          <div className="mb-5 flex items-center justify-center gap-3 sm:gap-6">
            {[
              { value: remaining.days, label: "Days" },
              { value: remaining.hours, label: "Hours" },
              { value: remaining.minutes, label: "Min" },
              { value: remaining.seconds, label: "Sec" },
            ].map((unit) => (
              <div key={unit.label} className="flex flex-col items-center">
                <span className="font-mono text-3xl font-bold text-blue-800 tabular-nums dark:text-blue-200 sm:text-4xl">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <label className="flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                aria-label="Display timezone"
                className="cursor-pointer rounded-md border border-blue-200 bg-white py-1 pl-1.5 pr-6 text-xs text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mb-4 font-mono text-sm text-blue-700 dark:text-blue-300">{formatter.format(nextRun)}</p>

          <div className="flex items-center justify-center gap-2">
            <CopyButton text={expression} />
            <ShareButton getUrl={() => `${window.location.origin}${window.location.pathname}?expr=${encodeURIComponent(expression)}`} title="Cron Next Run Countdown" />
          </div>
        </div>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Paste a cron expression — the countdown starts immediately once it's valid.",
          "The four counters (Days, Hours, Minutes, Seconds) tick down live, updating every second.",
          "When the countdown reaches zero, it automatically recalculates and starts counting down to the following run — no refresh needed.",
          "Use the timezone dropdown to see the target run time converted into a different zone.",
        ]}
        faqs={[
          {
            q: "Does the countdown keep running if I switch browser tabs?",
            a: "Yes, as long as the tab stays open — modern browsers throttle background timers slightly, so the display may lag by a second or two when the tab isn't active, but it self-corrects immediately when you return to it since the underlying calculation is always based on the real current time, not accumulated ticks.",
          },
          {
            q: "What happens exactly at zero?",
            a: "The moment the countdown hits zero, the tool recalculates the expression's next run from the current time and starts counting down again automatically — you can leave the page open indefinitely and it will keep advancing through each scheduled run.",
          },
          {
            q: "Is this accurate enough to trigger something at the exact second?",
            a: "The countdown is accurate to the second for display purposes, but browser JavaScript timers aren't guaranteed to fire at the exact millisecond — for anything that must execute reliably at a precise time, use your actual job scheduler (cron, a cloud scheduler, etc.), not a browser tab.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "previous-run", "visualizer"]} />
    </div>
  )
}
