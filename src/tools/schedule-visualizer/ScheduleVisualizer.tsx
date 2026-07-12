import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { CalendarDays, ChevronLeft, ChevronRight, Download, List } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getMatchingDaysInMonth, getNextCronRuns, getRunsOnDate } from "../../lib/cronNextRuns"

type View = "calendar" | "timeline"
type CalendarGranularity = "month" | "week" | "day"
type TimelineWindow = "24h" | "week" | "month" | "all"

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const TIMELINE_WINDOWS: { value: TimelineWindow; label: string }[] = [
  { value: "24h", label: "Next 24h" },
  { value: "week", label: "Next Week" },
  { value: "month", label: "Next Month" },
  { value: "all", label: "All (100)" },
]

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
const dateHeaderFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" })
const timelineDateFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" })
const weekDayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric" })
const weekRangeFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function sameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function downloadCsv(filename: string, runs: Date[]) {
  const rows = [
    ["Date", "Time", "ISO Timestamp"],
    ...runs.map((r) => [r.toLocaleDateString(), r.toLocaleTimeString(), r.toISOString()]),
  ]
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ScheduleVisualizer() {
  const [expression, setExpression] = useState("0 9 * * 1-5")
  const [view, setView] = useState<View>("calendar")
  const [granularity, setGranularity] = useState<CalendarGranularity>("month")
  const [timelineWindow, setTimelineWindow] = useState<TimelineWindow>("all")
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
    if (!isValid || granularity !== "month") return { days: [] as number[] }
    return getMatchingDaysInMonth(expression, cursor.getFullYear(), cursor.getMonth())
  }, [expression, cursor, isValid, granularity])

  const selectedDate = useMemo(
    () => (selectedDay !== null ? new Date(cursor.getFullYear(), cursor.getMonth(), selectedDay) : null),
    [selectedDay, cursor],
  )

  const { runs: dayRuns } = useMemo(() => {
    if (!isValid || !selectedDate) return { runs: [] as Date[] }
    return getRunsOnDate(expression, selectedDate)
  }, [expression, selectedDate, isValid])

  const weekStart = useMemo(() => {
    const d = new Date(cursor)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  }, [cursor])

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)),
    [weekStart],
  )

  const weekRuns = useMemo(() => {
    if (!isValid || granularity !== "week") return [] as Date[][]
    return weekDays.map((d) => getRunsOnDate(expression, d).runs)
  }, [expression, weekDays, isValid, granularity])

  const { runs: dayViewRuns } = useMemo(() => {
    if (!isValid || granularity !== "day") return { runs: [] as Date[] }
    return getRunsOnDate(expression, cursor)
  }, [expression, cursor, isValid, granularity])

  const { runs: timelineRuns } = useMemo(() => {
    if (!isValid || view !== "timeline") return { runs: [] as Date[] }
    return getNextCronRuns(expression, 100)
  }, [expression, isValid, view])

  const filteredTimelineRuns = useMemo(() => {
    if (timelineWindow === "all") return timelineRuns
    const cutoff = new Date()
    if (timelineWindow === "24h") cutoff.setHours(cutoff.getHours() + 24)
    else if (timelineWindow === "week") cutoff.setDate(cutoff.getDate() + 7)
    else cutoff.setMonth(cutoff.getMonth() + 1)
    return timelineRuns.filter((r) => r <= cutoff)
  }, [timelineRuns, timelineWindow])

  const timelineGroups = useMemo(() => {
    const map = new Map<string, Date[]>()
    for (const run of filteredTimelineRuns) {
      const key = run.toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(run)
    }
    return [...map.entries()]
  }, [filteredTimelineRuns])

  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === cursor.getFullYear() && today.getMonth() === cursor.getMonth()

  const goToPeriod = (delta: number) => {
    if (granularity === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
    else if (granularity === "week") setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + delta * 7))
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + delta))
    setSelectedDay(null)
  }

  const periodLabel =
    granularity === "month"
      ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : granularity === "week"
        ? `${weekRangeFormatter.format(weekDays[0])} – ${weekRangeFormatter.format(weekDays[6])}, ${weekDays[6].getFullYear()}`
        : dateHeaderFormatter.format(cursor)

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Schedule Visualizer — Calendar & Timeline View | CronParser"
        description="Visualize a cron expression on a day, week, or month calendar, or as a filterable timeline of upcoming runs with CSV export — entirely client-side."
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
              Timeline
            </button>
          </div>

          {view === "calendar" && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              {/* Granularity toggle */}
              <div className="mb-3 flex justify-center gap-1 rounded-lg bg-gray-50 p-1 dark:bg-gray-800">
                {(["day", "week", "month"] as CalendarGranularity[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGranularity(g)
                      setSelectedDay(null)
                    }}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      granularity === g
                        ? "bg-white text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToPeriod(-1)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label={`Previous ${granularity}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{periodLabel}</p>
                <button
                  type="button"
                  onClick={() => goToPeriod(1)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label={`Next ${granularity}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {granularity === "month" && (
                <>
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
                </>
              )}

              {granularity === "week" && (
                <div className="flex flex-col gap-2">
                  {weekDays.map((d, i) => {
                    const isToday = sameDate(d, today)
                    const runs = weekRuns[i] ?? []
                    return (
                      <div
                        key={d.toISOString()}
                        className={`rounded-lg border p-2.5 ${
                          isToday
                            ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950"
                            : "border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <p className="mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {weekDayFormatter.format(d)}
                        </p>
                        {runs.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {runs.map((r) => (
                              <span
                                key={r.getTime()}
                                className="rounded-md bg-white px-2 py-1 font-mono text-xs text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300"
                              >
                                {timeFormatter.format(r)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-600">No runs</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {granularity === "day" && (
                <div>
                  {dayViewRuns.length > 0 ? (
                    <ol className="flex flex-col gap-1.5">
                      {dayViewRuns.map((r, i) => (
                        <li
                          key={r.getTime()}
                          className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {i + 1}
                          </span>
                          <span className="font-mono text-gray-700 dark:text-gray-300">{timeFormatter.format(r)}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-600">
                      No runs scheduled on this day.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {view === "timeline" && (
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {TIMELINE_WINDOWS.map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => setTimelineWindow(w.value)}
                      className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        timelineWindow === w.value
                          ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv(`cron-schedule-${Date.now()}.csv`, filteredTimelineRuns)}
                  disabled={filteredTimelineRuns.length === 0}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>

              <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                {timelineGroups.length > 0 ? (
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
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-600">
                    No runs in this window.
                  </p>
                )}
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
          "Paste a cron expression — Calendar view highlights every matching day; switch between Day, Week, and Month using the toggle above the calendar.",
          "Click a highlighted day in Month view to see the exact run times on that date.",
          "Switch to Timeline view and filter by Next 24h, Next Week, Next Month, or All (up to 100 runs).",
          "Click Export CSV in Timeline view to download the currently filtered runs as a spreadsheet-ready file.",
        ]}
        faqs={[
          {
            q: "How does Calendar view decide which days are highlighted?",
            a: "A day is highlighted if the expression's day-of-month, month, and day-of-week fields match that date — independent of the hour/minute fields, since those only affect what time on that day the job runs, not which days qualify.",
          },
          {
            q: "What's the difference between Day, Week, and Month view?",
            a: "Month view shows a full calendar grid with highlighted days you click to inspect. Week view lists all seven days of the current week with run times shown inline. Day view shows a single day's full run list as an ordered agenda.",
          },
          {
            q: "What does the CSV export contain?",
            a: "One row per run in the currently selected timeline window, with columns for the local date, local time, and full ISO 8601 timestamp — ready to open in Excel, Google Sheets, or import into another tool.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All date matching, run calculation, and CSV generation happen entirely in your browser using local JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "frequency-calculator", "compare"]} />
    </div>
  )
}
