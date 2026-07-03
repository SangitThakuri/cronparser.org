import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { parseCurl, buildFetchCode } from "./parseCurl"
import { highlightJs } from "./highlightJs"

const EXAMPLE = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer abc123" \\
  -d '{"name":"Alice","email":"alice@example.com"}'`

export default function CurlConverter() {
  const [input, setInput] = useState("")

  const parsed = useMemo(() => parseCurl(input), [input])
  const code = useMemo(() => buildFetchCode(parsed), [parsed])
  const highlighted = useMemo(() => highlightJs(code), [code])
  const hasContent = input.trim().length > 0

  return (
    <div className="mx-auto max-w-5xl">
      <Helmet>
        <title>cURL to JavaScript Fetch Converter — Convert curl Commands Online | CronParser</title>
        <meta
          name="description"
          content="Convert any curl command into a ready-to-use JavaScript fetch() snippet instantly. Parses -X, -H, and -d flags into clean, production-ready async code — entirely client-side."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          cURL ⇄ JS Fetch Converter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Paste a curl command and get an equivalent JavaScript fetch() snippet instantly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              curl Command
            </label>
            <button
              type="button"
              onClick={() => setInput(EXAMPLE)}
              className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              Load Example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={EXAMPLE}
            spellCheck={false}
            rows={14}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              JavaScript fetch()
            </label>
            {code && <CopyButton text={code} />}
          </div>

          {!hasContent && (
            <div className="flex min-h-[280px] flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 p-8 dark:border-gray-700">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Paste a curl command to generate fetch() code
              </p>
            </div>
          )}

          {hasContent && parsed.errors.length > 0 && !code && (
            <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              {parsed.errors.map((err, i) => (
                <p key={i} className="font-mono text-sm text-red-600 dark:text-red-400">
                  {err}
                </p>
              ))}
            </div>
          )}

          {code && (
            <pre className="min-h-[280px] flex-1 overflow-x-auto rounded-lg border border-gray-800 bg-gray-900 p-4 font-mono text-sm leading-relaxed">
              <code className="text-gray-100">{highlighted}</code>
            </pre>
          )}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Paste a curl command — copied directly from a terminal, a browser's DevTools \"Copy as cURL\", or API documentation.",
          "The converter parses -X / --request, -H / --header, and -d / --data (plus --data-raw and --data-binary) flags automatically.",
          "An equivalent async JavaScript fetch() function appears on the right, complete with headers and a JSON-formatted body when applicable.",
          "Click Copy Code to grab the generated snippet and drop it straight into your project.",
        ]}
        faqs={[
          {
            q: "Which curl flags are supported?",
            a: "-X / --request for the HTTP method, -H / --header for request headers (repeatable), and -d / --data, --data-raw, and --data-binary for the request body. If -d is present without an explicit -X, the method defaults to POST, matching curl's own behavior.",
          },
          {
            q: "How is the request body handled?",
            a: "If the body is valid JSON, it's parsed and re-emitted as a pretty-printed JSON.stringify() call. If it isn't JSON, it's kept as a plain escaped string.",
          },
          {
            q: "Does this add headers that weren't in my curl command?",
            a: "No. The output is a faithful translation — only flags present in your command are reflected in the generated code, so nothing is silently added or assumed.",
          },
          {
            q: "Is my curl command sent to a server?",
            a: "No. Parsing and code generation both run entirely in your browser with plain JavaScript. Nothing is transmitted over the network.",
          },
        ]}
      />
    </div>
  )
}
