import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

type Mode = "format" | "minify"
type IndentSize = 2 | 4 | 8

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
])

const PRE_TAGS = new Set(["pre", "script", "style", "textarea"])

function minify(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function format(html: string, indentSize: number): string {
  const TAB = " ".repeat(indentSize)
  let depth = 0
  let inPre = false
  const lines: string[] = []

  // Tokenize into tag and text nodes
  const tokens = html
    .split(/(<[^>]*>|<!--[\s\S]*?-->)/)
    .filter((t) => t !== undefined)

  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue

    if (token.startsWith("<!--")) {
      lines.push(TAB.repeat(depth) + trimmed)
      continue
    }

    if (token.startsWith("</")) {
      const tag = token.match(/^<\/([A-Za-z][A-Za-z0-9]*)/)?.[1]?.toLowerCase() ?? ""
      if (PRE_TAGS.has(tag)) inPre = false
      if (!inPre) depth = Math.max(0, depth - 1)
      lines.push(TAB.repeat(depth) + trimmed)
      continue
    }

    if (token.startsWith("<")) {
      const tag = token.match(/^<([A-Za-z][A-Za-z0-9]*)/)?.[1]?.toLowerCase() ?? ""
      const isSelfClose = token.endsWith("/>") || VOID_TAGS.has(tag)
      const isProcessing = token.startsWith("<?") || token.startsWith("<!")

      lines.push(TAB.repeat(depth) + trimmed)

      if (!isSelfClose && !isProcessing && tag) {
        if (PRE_TAGS.has(tag)) inPre = true
        if (!inPre) depth++
      }
      continue
    }

    // Text node
    if (inPre) {
      lines.push(token)
    } else {
      const text = trimmed
      if (text) lines.push(TAB.repeat(depth) + text)
    }
  }

  return lines.join("\n")
}

export default function HtmlXmlFormatter() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<Mode>("format")
  const [indentSize, setIndentSize] = useState<IndentSize>(2)

  const output = useMemo((): string | null => {
    if (!input.trim()) return ""
    try {
      return mode === "format" ? format(input, indentSize) : minify(input)
    } catch {
      return null
    }
  }, [input, mode, indentSize])

  const hasError = output === null

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>HTML & XML Formatter / Beautifier / Minifier | DevBits</title>
        <meta
          name="description"
          content="Beautify and format HTML or XML code with configurable indentation. Also minifies HTML by removing whitespace and comments."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          HTML / XML Formatter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Beautify or minify HTML and XML markup with configurable indentation.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {(["format", "minify"] as Mode[]).map((m) => (
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

        {mode === "format" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Indent:</span>
            <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
              {([2, 4, 8] as IndentSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setIndentSize(s)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    indentSize === s
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste HTML or XML here…"
            rows={20}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
            {output && !hasError && <CopyButton text={output} />}
          </div>
          {hasError ? (
            <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              Failed to process the input. Check that the markup is valid HTML or XML.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50" style={{ minHeight: "480px" }}>
              <pre className="p-4 font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre">
                {output || (
                  <span className="text-gray-300 dark:text-gray-600">Result appears here…</span>
                )}
              </pre>
            </div>
          )}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Paste your HTML or XML into the input panel on the left.",
          "Select 'Format' to beautify with indentation, or 'Minify' to strip whitespace and comments.",
          "When formatting, choose the indent size (2, 4, or 8 spaces).",
          "Click Copy to copy the formatted output to your clipboard.",
        ]}
        faqs={[
          {
            q: "Does this handle XML as well as HTML?",
            a: "Yes. The formatter works on HTML, XHTML, SVG, and XML. Void HTML tags (br, img, input, etc.) are recognized and not given closing-tag indentation.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All formatting runs in your browser via a JavaScript tokenizer. Nothing is transmitted over the network.",
          },
          {
            q: "What does minify do?",
            a: "Minification removes HTML comments and collapses all whitespace between tags, reducing file size for content served to browsers.",
          },
        ]}
      />
    </div>
  )
}
