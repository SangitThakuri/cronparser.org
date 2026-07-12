import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { CheckCircle2, Sparkle } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { parseCronExpression } from "../../lib/cronNextRuns"
import { optimizeFieldSet } from "./optimizeField"

interface FieldResult {
  label: string
  original: string
  optimized: string
  changed: boolean
}

function optimize(expression: string): { fields: FieldResult[]; optimizedExpression: string } | null {
  const trimmed = expression.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s+/)
  if (parts.length !== 5 && parts.length !== 6) return null

  try {
    const parsed = parseCronExpression(trimmed)
    const hasSeconds = parsed.hasSeconds

    const labels = hasSeconds
      ? ["Second", "Minute", "Hour", "Day", "Month", "Weekday"]
      : ["Minute", "Hour", "Day", "Month", "Weekday"]
    const ranges: [number, number][] = hasSeconds
      ? [
          [0, 59],
          [0, 59],
          [0, 23],
          [1, 31],
          [1, 12],
          [0, 6],
        ]
      : [
          [0, 59],
          [0, 23],
          [1, 31],
          [1, 12],
          [0, 6],
        ]
    const sets = hasSeconds
      ? [parsed.seconds.set, parsed.minutes.set, parsed.hours.set, parsed.doms.set, parsed.months.set, parsed.dows.set]
      : [parsed.minutes.set, parsed.hours.set, parsed.doms.set, parsed.months.set, parsed.dows.set]

    const fields = parts.map((original, i) => {
      const [min, max] = ranges[i]
      const optimized = optimizeFieldSet(sets[i], min, max)
      return { label: labels[i], original, optimized, changed: original !== optimized }
    })

    return { fields, optimizedExpression: fields.map((f) => f.optimized).join(" ") }
  } catch {
    return null
  }
}

export default function Optimizer() {
  const [expression, setExpression] = useState("0,15,30,45 9,10,11,12,13,14,15,16,17 * * 1,2,3,4,5")

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

  const result = useMemo(() => (description && !error ? optimize(expression) : null), [expression, description, error])
  const hasChanges = result?.fields.some((f) => f.changed) ?? false

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Schedule Optimizer — Simplify Cron Expressions | CronParser"
        description="Simplify a verbose cron expression into cleaner, equivalent syntax — turning lists like 0,15,30,45 into */15 automatically. Entirely client-side."
        path="/optimizer"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Schedule Optimizer" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Schedule Optimizer</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Turn a verbose cron expression into the cleanest equivalent syntax, field by field.
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
          placeholder="e.g. 0,15,30,45 * * * *"
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

      {result && (
        <>
          <div className="mb-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Field</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Original</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Optimized</th>
                </tr>
              </thead>
              <tbody>
                {result.fields.map((f) => (
                  <tr key={f.label} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300">{f.label}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-500 dark:text-gray-400">{f.original}</td>
                    <td
                      className={`px-4 py-2.5 font-mono font-semibold ${
                        f.changed
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {f.optimized}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-center gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                {hasChanges ? (
                  <Sparkle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </span>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-500">
                  {hasChanges ? "Optimized Expression" : "Already Optimal"}
                </p>
                <p className="font-mono text-lg font-semibold text-green-800 dark:text-green-200">
                  {result.optimizedExpression}
                </p>
              </div>
            </div>
            <CopyButton text={result.optimizedExpression} />
          </div>
        </>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Paste any cron expression, however verbose — explicit lists, wide ranges, or redundant values all work.",
          "Each field is checked independently against three cleaner equivalents: a wildcard (if it covers the full range), a step pattern (if values are evenly spaced), or a range (if values are consecutive).",
          "Fields that changed are highlighted — the combined Optimized Expression is guaranteed to match the exact same schedule as your original.",
          "Copy the optimized result directly, or paste it into the Cron Parser to double-check the translation matches.",
        ]}
        faqs={[
          {
            q: "How do I know the optimized expression really means the same thing?",
            a: "Each field is optimized independently and only replaced with syntax that produces the exact same set of matching values — 0,15,30,45 always becomes */15 because both expand to precisely the same four minutes, never an approximation.",
          },
          {
            q: "Why didn't my expression change at all?",
            a: "If every field is already written as its simplest form (a wildcard, a clean range, or an already-minimal step/list), there's nothing to optimize — the tool reports it as already optimal rather than rewriting it unnecessarily.",
          },
          {
            q: "Does this fix invalid cron syntax?",
            a: "No — the optimizer only simplifies fields that are already valid. Paste your expression into the Cron Validator first if you're not sure it's syntactically correct.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All parsing and optimization logic runs entirely in your browser. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "validator", "cheat-sheet"]} />
    </div>
  )
}
