import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

type Mode = "encode" | "decode"

function encode(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function decode(text: string): string {
  const el = document.createElement("textarea")
  el.innerHTML = text
  return el.value
}

const REFERENCE = [
  { char: "&",  entity: "&amp;" },
  { char: "<",  entity: "&lt;" },
  { char: ">",  entity: "&gt;" },
  { char: '"',  entity: "&quot;" },
  { char: "'",  entity: "&#39;" },
  { char: "©",  entity: "&copy;" },
  { char: "®",  entity: "&reg;" },
  { char: "™",  entity: "&trade;" },
  { char: "€",  entity: "&euro;" },
  { char: "£",  entity: "&pound;" },
  { char: " ", entity: "&nbsp;" },
  { char: "—",  entity: "&mdash;" },
  { char: "–",  entity: "&ndash;" },
  { char: "…",  entity: "&hellip;" },
  { char: "«",  entity: "&laquo;" },
  { char: "»",  entity: "&raquo;" },
]

export default function HtmlEntities() {
  const [mode, setMode] = useState<Mode>("encode")
  const [input, setInput] = useState("")

  const output = useMemo((): string | null => {
    if (!input) return ""
    try {
      return mode === "encode" ? encode(input) : decode(input)
    } catch {
      return null
    }
  }, [input, mode])

  const hasError = output === null

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>HTML Entity Encoder / Decoder | DevBits</title>
        <meta
          name="description"
          content="Encode text to HTML entities (&amp;amp;, &amp;lt;, &amp;gt;) or decode HTML entities back to plain text instantly in your browser."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          HTML Entity Encoder
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Encode text to HTML entities or decode them back to plain text.
        </p>
      </div>

      <div className="mb-6 flex">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {(["encode", "decode"] as Mode[]).map((m) => (
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
            {mode === "encode" ? "Plain Text" : "HTML with Entities"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? '<div class="hello">World & More</div>'
                : "&lt;div class=&quot;hello&quot;&gt;"
            }
            rows={12}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "HTML with Entities" : "Plain Text"}
            </label>
            {output && !hasError && <CopyButton text={output} />}
          </div>
          <textarea
            readOnly
            value={hasError ? "" : (output ?? "")}
            rows={12}
            placeholder="Result appears here…"
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Reference table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Common Entities
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {REFERENCE.map(({ char, entity }) => (
            <div
              key={entity}
              className="flex items-center gap-2 border-b border-r border-gray-100 px-3 py-2 last:border-b-0 dark:border-gray-800"
            >
              <span className="w-6 shrink-0 text-center font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
                {char === " " ? "·" : char}
              </span>
              <span className="min-w-0 truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                {entity}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Choose 'Encode' to convert special characters to HTML entities, or 'Decode' to reverse the process.",
          "Paste or type your text in the left panel. The converted output appears instantly in the right panel.",
          "Click Copy to copy the output to your clipboard.",
          "The reference table at the bottom lists common HTML entities for quick lookup.",
        ]}
        faqs={[
          {
            q: "Which characters are encoded?",
            a: "The five mandatory HTML special characters are encoded: & → &amp;amp;, < → &amp;lt;, > → &amp;gt;, \" → &amp;quot;, and ' → &amp;#39;. Other characters are left unchanged.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. Encoding uses simple string replacements; decoding uses a sandboxed DOM textarea element. Everything runs in your browser.",
          },
          {
            q: "Why do I need to encode HTML entities?",
            a: "Without encoding, characters like < and & in content can break HTML parsing or enable XSS (cross-site scripting) vulnerabilities. Always encode user-supplied content before inserting it into HTML.",
          },
        ]}
      />
    </div>
  )
}
