import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

type Mode = "escape" | "unescape"

function escapeJson(text: string): string {
  return JSON.stringify(text).slice(1, -1)
}

function unescapeJson(text: string): string {
  return JSON.parse('"' + text + '"')
}

export default function JsonEscaper() {
  const [mode, setMode] = useState<Mode>("escape")
  const [input, setInput] = useState("")

  const output = (() => {
    if (!input) return ""
    try {
      return mode === "escape" ? escapeJson(input) : unescapeJson(input)
    } catch {
      return null
    }
  })()

  const hasError = output === null

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>JSON String Escape / Unescape Tool | DevBits</title>
        <meta
          name="description"
          content="Escape or unescape JSON strings instantly. Handles all special characters including quotes, backslashes, and control characters."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JSON Escaper</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Escape or unescape JSON string values — handles all special characters instantly.
        </p>
      </div>

      <div className="mb-6 flex">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {(["escape", "unescape"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === "escape" ? "Raw Text" : "Escaped String"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "escape"
                ? 'e.g. She said "hello"\nNew line here'
                : 'e.g. She said \\"hello\\"\\nNew line here'
            }
            rows={12}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "escape" ? "Escaped String" : "Raw Text"}
            </label>
            {output && !hasError && <CopyButton text={output} />}
          </div>
          {hasError ? (
            <div className="flex-1 overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              Invalid escaped string — check for unmatched escape sequences.
            </div>
          ) : (
            <textarea
              readOnly
              value={output ?? ""}
              rows={12}
              placeholder="Result appears here…"
              className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-600"
            />
          )}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Select 'Escape' to convert raw text into a JSON-safe string, or 'Unescape' to decode a JSON-escaped string back to plain text.",
          "Type or paste your input in the left panel. The result appears instantly in the right panel.",
          "Click Copy to copy the output to your clipboard.",
        ]}
        faqs={[
          {
            q: "What characters does escaping handle?",
            a: 'The JSON escape format handles double quotes (\\"), backslashes (\\\\), newlines (\\n), carriage returns (\\r), tabs (\\t), and all other control characters as Unicode escape sequences (\\uXXXX).',
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All escaping uses the browser's built-in JSON.stringify and JSON.parse functions. Nothing leaves your machine.",
          },
          {
            q: "Why do I get an error when unescaping?",
            a: "The input contains an invalid escape sequence. Common mistakes include a trailing backslash or an unrecognized escape like \\q.",
          },
        ]}
      />
    </div>
  )
}
