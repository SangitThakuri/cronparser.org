import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { AlertOctagon, CheckCircle2, Plus, X } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getNextCronRuns } from "../../lib/cronNextRuns"

interface JobEntry {
  id: number
  label: string
  cron: string
}

const CHECK_COUNT = 50
const runFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

let nextId = 3

export default function ConflictDetector() {
  const [jobs, setJobs] = useState<JobEntry[]>([
    { id: 1, label: "Nightly backup", cron: "0 2 * * *" },
    { id: 2, label: "Log rotation", cron: "0 2 * * *" },
  ])

  const addJob = () => {
    setJobs((prev) => [...prev, { id: nextId++, label: `Job ${prev.length + 1}`, cron: "" }])
  }

  const removeJob = (id: number) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  const updateJob = (id: number, patch: Partial<JobEntry>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }

  const parsedJobs = useMemo(
    () =>
      jobs.map((job) => {
        if (!job.cron.trim()) return { ...job, description: null, error: null }
        try {
          return {
            ...job,
            description: cronstrue.toString(job.cron.trim(), { use24HourTimeFormat: false, verbose: true }),
            error: null as string | null,
          }
        } catch (e) {
          return { ...job, description: null, error: String(e).replace(/^Error:\s*/i, "") }
        }
      }),
    [jobs],
  )

  const validJobs = parsedJobs.filter((j) => j.description && !j.error)

  const conflicts = useMemo(() => {
    if (validJobs.length < 2) return []

    const timeMap = new Map<number, JobEntry[]>()
    for (const job of validJobs) {
      const { runs } = getNextCronRuns(job.cron.trim(), CHECK_COUNT)
      for (const run of runs) {
        const t = run.getTime()
        if (!timeMap.has(t)) timeMap.set(t, [])
        timeMap.get(t)!.push(job)
      }
    }

    return [...timeMap.entries()]
      .filter(([, matchingJobs]) => matchingJobs.length >= 2)
      .sort(([a], [b]) => a - b)
      .slice(0, 25)
  }, [validJobs])

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Conflict Detector — Find Overlapping Cron Jobs | CronParser"
        description="Check whether multiple cron jobs are scheduled to execute at the same time. Add expressions and instantly see any overlapping run times — entirely client-side."
        path="/conflict-detector"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Conflict Detector" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Conflict Detector</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Check whether multiple cron jobs are scheduled to run at the same time.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        {parsedJobs.map((job, i) => (
          <div key={job.id} className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center">
            <input
              type="text"
              value={job.label}
              onChange={(e) => updateJob(job.id, { label: e.target.value })}
              placeholder={`Job ${i + 1}`}
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:w-40"
            />
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={job.cron}
                onChange={(e) => updateJob(job.id, { cron: e.target.value })}
                placeholder="e.g. 0 2 * * *"
                spellCheck={false}
                className={`w-full rounded-md border px-2.5 py-1.5 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 ${
                  job.error
                    ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950"
                    : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                }`}
              />
              {job.error && <p className="mt-1 font-mono text-xs text-red-500">{job.error}</p>}
            </div>
            <button
              type="button"
              onClick={() => removeJob(job.id)}
              disabled={jobs.length <= 2}
              className="shrink-0 cursor-pointer self-end rounded-md p-1.5 text-gray-300 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-600 sm:self-auto"
              aria-label="Remove job"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addJob}
        className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
      >
        <Plus className="h-4 w-4" />
        Add Job
      </button>

      {validJobs.length >= 2 && (
        <div className="mb-6">
          {conflicts.length === 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              No conflicts found in the next {CHECK_COUNT} runs of each job
            </div>
          ) : (
            <>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400">
                <AlertOctagon className="h-4 w-4" />
                {conflicts.length} overlapping run{conflicts.length !== 1 ? "s" : ""} found
              </div>
              <div className="flex flex-col gap-2">
                {conflicts.map(([time, matchingJobs]) => (
                  <div
                    key={time}
                    className="rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900/50 dark:bg-red-950/20"
                  >
                    <p className="mb-1.5 font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
                      {runFormatter.format(new Date(time))}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingJobs.map((j) => (
                        <span
                          key={j.id}
                          className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-900 dark:text-gray-300"
                        >
                          {j.label || j.cron}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Enter two or more cron expressions, with an optional label for each job.",
          `The tool computes the next ${CHECK_COUNT} runs for every valid job and checks for any exact timestamp shared by two or more of them.`,
          "Any overlapping run times are listed with the exact timestamp and which jobs collide.",
          "Add or remove job rows as needed — at least two valid expressions are required to check for conflicts.",
        ]}
        faqs={[
          {
            q: "What counts as a conflict?",
            a: "Two or more jobs scheduled to fire at the exact same second. Jobs that run close together but not simultaneously (like one at 2:00 AM and another at 2:05 AM) aren't flagged, since they don't actually execute at the same instant.",
          },
          {
            q: "Why does it only check the next 50 runs per job?",
            a: "It's a practical limit that catches recurring conflicts (which repeat on a predictable cycle) without unbounded computation — if two jobs conflict at all, the pattern almost always shows up well within the first 50 runs of each.",
          },
          {
            q: "Should I actually avoid all conflicts?",
            a: "Not necessarily — simultaneous jobs are only a problem if they compete for the same resource (CPU, database locks, a rate-limited API). Two independent, lightweight jobs firing at the same second is often completely fine.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All parsing and conflict checking happens entirely in your browser using local JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "compare", "visualizer"]} />
    </div>
  )
}
