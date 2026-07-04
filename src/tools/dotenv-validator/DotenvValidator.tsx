import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { CheckCircle2, XCircle } from "lucide-react"
import { CopyButton } from "../../components/ui/CopyButton"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { parseDotenv, formatDotenv } from "./parseDotenv"

const PLACEHOLDER = `# Example .env file
DATABASE_URL="postgres://user:pass@localhost:5432/db"
API_KEY=sk_live_51H8x9
DEBUG = true
1INVALID_KEY=oops
PORT=unquoted value with spaces
API_KEY=duplicate`

export default function DotenvValidator() {
  const [input, setInput] = useState("")

  const lines = useMemo(() => parseDotenv(input), [input])
  const entries = useMemo(() => lines.filter((l) => l.kind !== "blank"), [lines])
  const errorCount = useMemo(
    () => entries.reduce((sum, l) => sum + l.errors.length, 0),
    [entries],
  )
  const formatted = useMemo(() => formatDotenv(lines), [lines])
  const hasContent = input.trim().length > 0

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>.env File Validator &amp; Formatter — Check Dotenv Syntax | CronParser</title>
        <meta
          name="description"
          content="Validate and format .env / dotenv configuration files instantly. Detects duplicate keys, unquoted values with spaces, spacing errors around '=', and invalid key names — entirely client-side."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          .env File Validator &amp; Formatter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Paste a dotenv configuration to check syntax and generate a clean, normalized version.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            .env Contents
          </label>
          {input && <ClearInputButton onClear={() => setInput("")} />}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          rows={10}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      {hasContent && (
        <>
          {/* Status badge */}
          <div className="mb-5">
            {errorCount === 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Valid Syntax
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                {errorCount} Issue{errorCount !== 1 ? "s" : ""} Found
              </div>
            )}
          </div>

          {/* Verification grid */}
          <div className="mb-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <th className="w-14 px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Line</th>
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Key</th>
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Value</th>
                  <th className="w-10 px-3 py-2 font-medium text-gray-500 dark:text-gray-400" />
                </tr>
              </thead>
              <tbody>
                {entries.map((l) => (
                  <tr
                    key={l.line}
                    className={`border-b border-gray-100 align-top last:border-0 dark:border-gray-800 ${
                      l.errors.length > 0
                        ? "bg-red-50/50 dark:bg-red-950/20"
                        : l.kind === "comment"
                          ? "bg-gray-50/50 dark:bg-gray-900/40"
                          : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-gray-400">{l.line}</td>
                    {l.kind === "comment" ? (
                      <td colSpan={3} className="px-3 py-2 font-mono text-xs text-gray-400 italic">
                        {l.raw.trim()}
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                          {l.key ?? <span className="text-gray-400 italic">—</span>}
                        </td>
                        <td className="max-w-xs truncate px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                          {l.value ?? <span className="text-gray-400 italic">—</span>}
                        </td>
                        <td className="px-3 py-2">
                          {l.errors.length > 0 ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </td>
                      </>
                    )}
                    {l.errors.length > 0 && (
                      <td colSpan={4} className="px-3 pb-2 pt-0">
                        <ul className="space-y-0.5">
                          {l.errors.map((err, i) => (
                            <li key={i} className="font-mono text-xs text-red-600 dark:text-red-400">
                              ⚠ {err}
                            </li>
                          ))}
                        </ul>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Formatted output */}
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Formatted Output
              </label>
              <CopyButton text={formatted} />
            </div>
            <textarea
              readOnly
              value={formatted}
              rows={8}
              className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100"
            />
          </div>
        </>
      )}

      <ToolSeoSection
        steps={[
          "Paste your .env file contents into the input box.",
          "Each key=value pair is checked for common dotenv syntax mistakes: spaces around '=', unquoted values containing spaces, duplicate keys, and keys starting with a number.",
          "A green 'Valid Syntax' badge appears when every line passes; otherwise each problem line is flagged inline with a red error message.",
          "Copy the normalized Formatted Output — spacing around '=' is cleaned up automatically.",
        ]}
        faqs={[
          {
            q: "What counts as valid dotenv syntax?",
            a: "Each non-comment, non-blank line should follow KEY=value with no spaces around the '=' sign. Keys should contain only letters, numbers, and underscores, and must not start with a digit. Values containing spaces should be wrapped in single or double quotes.",
          },
          {
            q: "Why are duplicate keys flagged?",
            a: "Most dotenv parsers (including Node's dotenv package) silently let the last occurrence of a duplicate key win, which can hide configuration bugs. This tool flags every repeat so you can catch it before deployment.",
          },
          {
            q: "Does the formatter fix everything automatically?",
            a: "The formatter normalizes spacing around '=' and comment lines, but it will not deduplicate keys or guess correct values — those need to be fixed manually since they represent real ambiguity in your configuration.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. Parsing and validation run entirely in your browser. Your environment variables and secrets never leave your machine.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["regex-tester", "curl-converter", "home"]} />
    </div>
  )
}
