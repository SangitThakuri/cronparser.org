import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { CheckCircle2, GitCompareArrows, XCircle } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getNextCronRuns } from "../../lib/cronNextRuns"

const COMPARE_COUNT = 50

const runFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

function parse(expression: string): { description: string | null; error: string | null } {
  const trimmed = expression.trim()
  if (!trimmed) return { description: null, error: null }
  try {
    return {
      description: cronstrue.toString(trimmed, { use24HourTimeFormat: false, verbose: true }),
      error: null,
    }
  } catch (e) {
    return { description: null, error: String(e).replace(/^Error:\s*/i, "") }
  }
}

function ExpressionField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const { description, error } = useMemo(() => parse(value), [value])

  return (
    <div className="flex-1">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {value && <ClearInputButton onClear={() => onChange("")} />}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 0 0 * * 0"
        spellCheck={false}
        className={`w-full rounded-lg border p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950"
            : description
              ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800"
              : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
        }`}
      />
      <p className="mt-1.5 min-h-[1.25rem] text-xs text-gray-500 dark:text-gray-400">
        {error ? <span className="text-red-500">{error}</span> : description}
      </p>
    </div>
  )
}

export default function CompareExpressions() {
  const [exprA, setExprA] = useState("0 0 * * 0")
  const [exprB, setExprB] = useState("@weekly")

  const resultA = useMemo(() => parse(exprA), [exprA])
  const resultB = useMemo(() => parse(exprB), [exprB])
  const bothValid = !!resultA.description && !!resultB.description

  const comparison = useMemo(() => {
    if (!bothValid) return null

    // cronstrue accepts nickname strings too, but our run-calculator only understands
    // 5/6-field expressions — expand common nicknames before comparing run times.
    const NICKNAMES: Record<string, string> = {
      "@yearly": "0 0 1 1 *",
      "@annually": "0 0 1 1 *",
      "@monthly": "0 0 1 * *",
      "@weekly": "0 0 * * 0",
      "@daily": "0 0 * * *",
      "@midnight": "0 0 * * *",
      "@hourly": "0 * * * *",
    }
    const normalize = (s: string) => NICKNAMES[s.trim().toLowerCase()] ?? s.trim()

    const a = getNextCronRuns(normalize(exprA), COMPARE_COUNT)
    const b = getNextCronRuns(normalize(exprB), COMPARE_COUNT)

    if (a.error || b.error) return { comparable: false as const }

    let firstDivergenceIndex = -1
    const len = Math.min(a.runs.length, b.runs.length)
    for (let i = 0; i < len; i++) {
      if (a.runs[i].getTime() !== b.runs[i].getTime()) {
        firstDivergenceIndex = i
        break
      }
    }
    const matchCount = firstDivergenceIndex === -1 ? len : firstDivergenceIndex
    const equivalent = firstDivergenceIndex === -1 && a.runs.length === b.runs.length

    return { comparable: true as const, equivalent, matchCount, runsA: a.runs, runsB: b.runs, firstDivergenceIndex }
  }, [exprA, exprB, bothValid])

  return (
    <div className="mx-auto max-w-4xl">
      <SeoMeta
        title="Cron Expression Comparison Tool — Are Two Schedules the Same? | CronParser"
        description="Compare two cron expressions side-by-side to see if they produce the same schedule, including support for @daily/@weekly-style nicknames — entirely client-side."
        path="/compare"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Compare Expressions" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Expression Comparison</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Check whether two cron expressions produce the same schedule, and see exactly where they diverge.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <ExpressionField label="Expression A" value={exprA} onChange={setExprA} />
        <div className="hidden items-end pb-3 sm:flex">
          <GitCompareArrows className="h-5 w-5 text-gray-300 dark:text-gray-600" />
        </div>
        <ExpressionField label="Expression B" value={exprB} onChange={setExprB} />
      </div>

      {comparison?.comparable === false && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Couldn't compute run times for one or both expressions.
        </div>
      )}

      {comparison?.comparable && (
        <>
          <div className="mb-6">
            {comparison.equivalent ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Equivalent — same schedule for the next {COMPARE_COUNT} runs
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                Different — first {comparison.matchCount} run{comparison.matchCount !== 1 ? "s" : ""} match, then diverge
              </div>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Expression A", runs: comparison.runsA },
              { label: "Expression B", runs: comparison.runsB },
            ].map(({ label, runs }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {label} — next {Math.min(10, runs.length)} runs
                </p>
                <ol className="flex flex-col gap-1.5">
                  {runs.slice(0, 10).map((r, i) => (
                    <li
                      key={r.getTime()}
                      className={`rounded-md px-2 py-1 font-mono text-xs ${
                        !comparison.equivalent && i === comparison.firstDivergenceIndex
                          ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {runFormatter.format(r)}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Enter two cron expressions — standard 5/6-field syntax or an @nickname like @weekly or @daily.",
          `The tool computes the next ${COMPARE_COUNT} run times for each and compares them directly, rather than just comparing the field syntax.`,
          "If they match for all compared runs, they're reported as equivalent. Otherwise, the first differing run is highlighted in both columns.",
          "Use this to verify a refactored or migrated expression still behaves identically to the original.",
        ]}
        faqs={[
          {
            q: "Why compare actual run times instead of just the expression text?",
            a: "Two syntactically different expressions can produce an identical schedule — 0 0 * * 0 and @weekly, for example. Comparing real computed run times catches this kind of equivalence that a plain text diff would miss.",
          },
          {
            q: `Does "equivalent" mean the schedules match forever?`,
            a: `It means they match for the ${COMPARE_COUNT} runs compared, which for most schedules covers weeks to months ahead. Expressions with rare edge cases (like leap-year-only dates) could theoretically diverge beyond that window.`,
          },
          {
            q: "Is my data sent to a server?",
            a: "No. Parsing and comparison run entirely in your browser using local JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "validator", "visualizer"]} />
    </div>
  )
}
