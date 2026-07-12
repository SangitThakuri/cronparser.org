import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getMatchingDaysInMonth, getNextCronRuns, getRunsOnDate } from "../../lib/cronNextRuns"

type View = "calendar" | "timeline"

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
const dateHeaderFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" })
const timelineDateFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" })

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export default function ScheduleVisualizer() {
  const [expression, setExpression] = useState("0 9 * * 1-5")
  const [view, setView] = useState<View>("calendar")
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

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

  const { days: matchingDays } = useMemo(() => {
    if (!isValid) return { days: [] as number[] }
    return getMatchingDaysInMonth(expression, cursor.getFullYear(), cursor.getMonth())
  }, [expression, cursor, isValid])

  const selectedDate = useMemo(
    () => (selectedDay !== null ? new Date(cursor.getFullYear(), cursor.getMonth(), selectedDay) : null),
    [selectedDay, cursor],
  )

  const { runs: dayRuns } = useMemo(() => {
    if (!isValid || !selectedDate) return { runs: [] as Date[] }
    return getRunsOnDate(expression, selectedDate)
  }, [expression, selectedDate, isValid])

  const { runs: timelineRuns } = useMemo(() => {
    if (!isValid || view !== "timeline") return { runs: [] as Date[] }
    return getNextCronRuns(expression, 100)
  }, [expression, isValid, view])

  const timelineGroups = useMemo(() => {
    const map = new Map<string, Date[]>()
    for (const run of timelineRuns) {
      const key = run.toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(run)
    }
    return [...map.entries()]
  }, [timelineRuns])

  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === cursor.getFullYear() && today.getMonth() === cursor.getMonth()

  const goToMonth = (delta: number) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
    setSelectedDay(null)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Schedule Visualizer — Calendar & Timeline View | CronParser"
        description="Visualize a cron expression on a monthly calendar or as a scrollable timeline of the next 100 runs — entirely client-side, no data leaves your browser."
        path="/visualizer"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Schedule Visualizer" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Schedule Visualizer</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          See a cron expression laid out on a calendar, or as a timeline of upcoming runs.
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
          onChange={(e) => {
            setExpression(e.target.value)
            setSelectedDay(null)
          }}
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
        <>
          {/* View toggle */}
          <div className="mb-4 flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                view === "calendar"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setView("timeline")}
              className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                view === "timeline"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              <List className="h-4 w-4" />
              Timeline (next 100)
            </button>
          </div>

          {view === "calendar" && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToMonth(-1)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </p>
                <button
                  type="button"
                  onClick={() => goToMonth(1)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAY_LABELS.map((w) => (
                  <div key={w} className="py-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {w}
                  </div>
                ))}
                {cells.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />
                  const hasRun = matchingDays.includes(day)
                  const isToday = isCurrentMonth && today.getDate() === day
                  const isSelected = selectedDay === day
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      disabled={!hasRun}
                      className={`relative aspect-square cursor-pointer rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white font-semibold"
                          : hasRun
                            ? "bg-blue-50 font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                            : "text-gray-400 dark:text-gray-600"
                      } ${isToday && !isSelected ? "ring-1 ring-inset ring-blue-400" : ""}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              {selectedDay !== null && selectedDate && (
                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {dateHeaderFormatter.format(selectedDate)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dayRuns.map((r) => (
                      <span
                        key={r.getTime()}
                        className="rounded-md bg-white px-2 py-1 font-mono text-xs text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300"
                      >
                        {timeFormatter.format(r)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "timeline" && (
            <div className="mb-6 max-h-[28rem] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col gap-4">
                {timelineGroups.map(([dateKey, runs]) => (
                  <div key={dateKey}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {timelineDateFormatter.format(runs[0])}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {runs.map((r) => (
                        <span
                          key={r.getTime()}
                          className="rounded-md bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {timeFormatter.format(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Paste a cron expression — Calendar view highlights every day this month with at least one scheduled run.",
          "Click a highlighted day to see the exact run times on that date.",
          "Switch to Timeline view to scroll through the next 100 upcoming runs, grouped by date.",
          "Use the arrows to navigate between months in Calendar view.",
        ]}
        faqs={[
          {
            q: "How does Calendar view decide which days are highlighted?",
            a: "A day is highlighted if the expression's day-of-month, month, and day-of-week fields match that date — independent of the hour/minute fields, since those only affect what time on that day the job runs, not which days qualify.",
          },
          {
            q: "Why does Timeline view cap at 100 runs?",
            a: "It's a practical limit that covers weeks of even high-frequency schedules (like every 5 minutes) while staying fast to compute and easy to scroll through. For a shorter, focused view, use the Cron Parser's Next 5 Runs panel instead.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All date matching and run calculation happens entirely in your browser using local JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "frequency-calculator", "compare"]} />
    </div>
  )
}
