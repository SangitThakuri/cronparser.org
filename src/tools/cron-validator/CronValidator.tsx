import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import cronstrue from "cronstrue"
import { CheckCircle2, XCircle } from "lucide-react"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { validateCron } from "./validateCron"

export default function CronValidator() {
  const [input, setInput] = useState("")
  const result = useMemo(() => validateCron(input), [input])
  const hasContent = input.trim().length > 0

  const description = useMemo(() => {
    if (!result.normalized) return null
    try {
      return cronstrue.toString(result.normalized, { use24HourTimeFormat: false, verbose: true })
    } catch {
      return null
    }
  }, [result.normalized])

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Cron Validator — Validate &amp; Normalize Cron Expressions | CronParser</title>
        <meta
          name="description"
          content="Validate a cron expression field-by-field, catch out-of-range values and malformed steps, and get a clean normalized version — entirely client-side."
        />
      </Helmet>

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Cron Validator" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Validator</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Validate a cron expression field-by-field and get a clean, normalized version.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
          {input && <ClearInputButton onClear={() => setInput("")} />}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. */15 9-18 * * 1-5"
          spellCheck={false}
          className={`w-full rounded-lg border p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${
            !hasContent
              ? "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
              : result.overallValid
                ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
                : "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950 dark:focus:border-red-500 dark:focus:ring-red-900"
          }`}
        />
      </div>

      {hasContent && (
        <>
          <div className="mb-5">
            {result.overallValid ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Valid Cron Expression
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                {result.errorCount} Issue{result.errorCount !== 1 ? "s" : ""} Found
              </div>
            )}
          </div>

          <div className="mb-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Field</th>
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Value</th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {result.fields.map((f, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 align-top last:border-0 dark:border-gray-800 ${
                      !f.valid ? "bg-red-50/50 dark:bg-red-950/20" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{f.name}</td>
                    <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">{f.value || "—"}</td>
                    <td className="px-3 py-2">
                      {f.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </td>
                  </tr>
                ))}
                {result.fields.some((f) => !f.valid) && (
                  <tr className="dark:border-gray-800">
                    <td colSpan={3} className="px-3 pb-3">
                      <ul className="space-y-0.5">
                        {result.fields
                          .filter((f) => !f.valid)
                          .map((f, i) => (
                            <li key={i} className="font-mono text-xs text-red-600 dark:text-red-400">
                              ⚠ {f.name}: {f.message}
                            </li>
                          ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {result.overallValid && result.normalized && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-lg font-semibold text-green-800 dark:text-green-200">
                  {result.normalized}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyButton text={result.normalized} />
                  <Link
                    to={`/?expr=${encodeURIComponent(result.normalized)}`}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Try it
                  </Link>
                </div>
              </div>
              {description && (
                <p className="text-sm text-green-700 dark:text-green-300">{description}</p>
              )}
            </div>
          )}
        </>
      )}

      <ToolSeoSection
        steps={[
          "Paste a cron expression — 5 or 6 space-separated fields.",
          "Each field is validated independently against its allowed range, catching out-of-range values, malformed steps, and invalid ranges.",
          "When every field passes, a normalized expression (extra whitespace collapsed) appears with its plain-English description.",
          "Click Try it to open a valid expression directly in the Cron Parser for next-run previews.",
        ]}
        faqs={[
          {
            q: "How is this different from the Cron Parser on the home page?",
            a: "The Cron Parser focuses on translating a valid expression into plain English. The Validator focuses on diagnosing exactly which field is wrong and why, with a field-by-field breakdown — useful when an expression is failing and you need to find the specific mistake.",
          },
          {
            q: "Does the validator check day-of-month and day-of-week logic?",
            a: "It validates each field's range and syntax independently. It doesn't flag the OR-semantics interaction between day-of-month and day-of-week as an error, since that's valid (if sometimes surprising) standard cron behavior.",
          },
          {
            q: "Is my expression sent to a server?",
            a: "No. All validation runs entirely in your browser with plain JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "examples"]} />
    </div>
  )
}
