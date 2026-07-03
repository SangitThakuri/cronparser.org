import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { formatJSON, minifyJSON } from "../../lib/json"

type Mode = "minify" | "beautify"

export default function JsonMinifier() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<Mode>("minify")

  const { formatted, error } = useMemo(
    () => (mode === "minify" ? minifyJSON(input) : formatJSON(input)),
    [input, mode],
  )

  const savings = useMemo(() => {
    if (mode !== "minify" || !formatted || !input.trim()) return null
    const originalBytes = new TextEncoder().encode(input).length
    const minifiedBytes = new TextEncoder().encode(formatted).length
    const pct = originalBytes > 0 ? Math.round((1 - minifiedBytes / originalBytes) * 100) : 0
    return { originalBytes, minifiedBytes, pct }
  }, [mode, formatted, input])

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>JSON Minifier — Compact &amp; Compress JSON Online | CronParser</title>
        <meta
          name="description"
          content="Minify JSON instantly by stripping whitespace and line breaks for a compact, production-ready payload. Also beautifies JSON back to readable form — 100% client-side."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          JSON Minifier &amp; Compact Formatter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Strip whitespace from JSON for a compact payload, or beautify it back to readable form.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setMode("minify")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "minify"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Minify
          </button>
          <button
            type="button"
            onClick={() => setMode("beautify")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "beautify"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Beautify
          </button>
        </div>

        {savings && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400">
            {savings.pct}% smaller — {savings.originalBytes.toLocaleString()} → {savings.minifiedBytes.toLocaleString()} bytes
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"hello": "world", "nested": {"a": 1, "b": [1, 2, 3]}}'
            spellCheck={false}
            rows={14}
            className={`w-full resize-y rounded-lg border p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${
              error
                ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950 dark:focus:border-red-500 dark:focus:ring-red-900"
                : formatted
                  ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
                  : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            }`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
            {formatted && <CopyButton text={formatted} />}
          </div>
          {error ? (
            <div className="flex-1 overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 font-mono text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              value={formatted ?? ""}
              rows={14}
              placeholder="Result appears here…"
              className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          )}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Paste raw or formatted JSON into the input panel.",
          "Choose Minify to strip all whitespace and line breaks into a single compact line, or Beautify to pretty-print it with 2-space indentation.",
          "The output updates instantly on every keystroke — a green badge shows exactly how many bytes minifying saved.",
          "Copy the result with the Copy button next to the output.",
        ]}
        faqs={[
          {
            q: "Why minify JSON?",
            a: "Minifying removes whitespace and line breaks that have no effect on parsing, reducing payload size for network transfer, embedded config files, or minified API responses.",
          },
          {
            q: "Does minifying change the data?",
            a: "No. Minifying only removes insignificant whitespace between tokens — the parsed value is byte-for-byte identical to the original once re-parsed.",
          },
          {
            q: "Is my JSON data sent to a server?",
            a: "No. All minifying and beautifying runs entirely in your browser using JSON.parse and JSON.stringify. Nothing leaves your machine.",
          },
        ]}
      />
    </div>
  )
}
