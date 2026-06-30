import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function inline(text: string): string {
  return (
    text
      // Inline code (process first to avoid nested replacements)
      .replace(
        /`([^`]+)`/g,
        '<code class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">$1</code>',
      )
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
      .replace(/_([^_\n]+)_/g, "<em>$1</em>")
      // Strikethrough
      .replace(/~~([^~]+)~~/g, '<del class="opacity-60">$1</del>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">$1</a>',
      )
  )
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n")
  const out: string[] = []
  let i = 0
  let inUl = false
  let inOl = false

  function flushLists() {
    if (inUl) { out.push("</ul>"); inUl = false }
    if (inOl) { out.push("</ol>"); inOl = false }
  }

  const H_CLASSES: Record<number, string> = {
    1: "mt-8 mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100",
    2: "mt-6 mb-2 border-b border-gray-200 pb-1 text-2xl font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100",
    3: "mt-5 mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100",
    4: "mt-4 mb-1.5 text-lg font-semibold text-gray-900 dark:text-gray-100",
    5: "mt-3 mb-1 text-base font-semibold text-gray-900 dark:text-gray-100",
    6: "mt-3 mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100",
  }

  while (i < lines.length) {
    const raw = lines[i]

    // Fenced code block
    if (raw.startsWith("```")) {
      flushLists()
      i++
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      out.push(
        `<pre class="my-4 overflow-x-auto rounded-lg bg-gray-100 p-4 font-mono text-sm leading-relaxed text-gray-800 dark:bg-gray-800 dark:text-gray-200"><code>${esc(codeLines.join("\n"))}</code></pre>`,
      )
      i++
      continue
    }

    // Heading
    const hm = raw.match(/^(#{1,6})\s(.+)$/)
    if (hm) {
      flushLists()
      const lvl = hm[1].length as 1 | 2 | 3 | 4 | 5 | 6
      out.push(`<h${lvl} class="${H_CLASSES[lvl]}">${inline(hm[2])}</h${lvl}>`)
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(raw) || /^\*\*\*+$/.test(raw)) {
      flushLists()
      out.push('<hr class="my-6 border-gray-200 dark:border-gray-700" />')
      i++
      continue
    }

    // Blockquote
    const bqm = raw.match(/^>\s?(.*)$/)
    if (bqm) {
      flushLists()
      out.push(
        `<blockquote class="my-3 border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400">${inline(bqm[1])}</blockquote>`,
      )
      i++
      continue
    }

    // Unordered list item
    const ulm = raw.match(/^[-*+]\s(.+)$/)
    if (ulm) {
      if (inOl) { out.push("</ol>"); inOl = false }
      if (!inUl) {
        out.push(
          '<ul class="my-3 list-disc space-y-1 pl-6 text-gray-800 dark:text-gray-200">',
        )
        inUl = true
      }
      out.push(`<li>${inline(ulm[1])}</li>`)
      i++
      continue
    }

    // Ordered list item
    const olm = raw.match(/^\d+\.\s(.+)$/)
    if (olm) {
      if (inUl) { out.push("</ul>"); inUl = false }
      if (!inOl) {
        out.push(
          '<ol class="my-3 list-decimal space-y-1 pl-6 text-gray-800 dark:text-gray-200">',
        )
        inOl = true
      }
      out.push(`<li>${inline(olm[1])}</li>`)
      i++
      continue
    }

    // Empty line
    if (!raw.trim()) {
      flushLists()
      i++
      continue
    }

    // Paragraph
    flushLists()
    out.push(
      `<p class="my-3 leading-relaxed text-gray-800 dark:text-gray-200">${inline(raw)}</p>`,
    )
    i++
  }

  flushLists()
  return out.join("\n")
}

// ── Sample ────────────────────────────────────────────────────────────────────

const SAMPLE = `# Hello, DevBits!

## Features

This is a **live** markdown preview tool. Changes appear *instantly* as you type.

### Supported syntax

- **Bold** and *italic* text
- \`inline code\` snippets
- [Links](https://example.com)
- ~~Strikethrough~~ text

### Code blocks

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet("DevBits"))
\`\`\`

### Blockquotes

> The best tool is the one you actually use.

### Lists

1. Write some markdown
2. See the live preview on the right
3. Copy or use your output

---

Everything runs entirely in your browser — no server, no uploads.
`

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarkdownPreview() {
  const [md, setMd] = useState(SAMPLE)
  const html = useMemo(() => markdownToHtml(md), [md])

  return (
    <div className="mx-auto max-w-6xl">
      <Helmet>
        <title>Live Markdown Preview Editor | DevBits</title>
        <meta
          name="description"
          content="Write markdown and see a live preview side-by-side. Supports headings, code blocks, lists, links, bold, italic, and more — all in your browser."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Markdown Preview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Write markdown on the left — the rendered preview updates on the right in real time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Markdown
          </label>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
            className="h-[600px] w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </label>
          <div
            className="h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900"
            // The content is generated from the user's own markdown input in this client-side tool
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Type or paste markdown in the left editor panel. The preview on the right updates on every keystroke.",
          "Supported elements: headings (# through ######), **bold**, *italic*, ~~strikethrough~~, `inline code`, fenced code blocks, unordered lists, ordered lists, blockquotes, horizontal rules, and [links](url).",
          "Clear the editor and start fresh, or modify the sample markdown to explore different features.",
        ]}
        faqs={[
          {
            q: "Is any data sent to a server?",
            a: "No. The markdown parser is a pure JavaScript function running in your browser. Nothing is transmitted over the network.",
          },
          {
            q: "What markdown features are supported?",
            a: "Headings (h1–h6), bold, italic, strikethrough, inline code, fenced code blocks, unordered and ordered lists, blockquotes, horizontal rules, and links. Tables and footnotes are not yet supported.",
          },
          {
            q: "Can I use this to render untrusted user content?",
            a: "No. The preview renders HTML using dangerouslySetInnerHTML. This tool is for previewing your own markdown. Do not use it to render untrusted input in a production application without a dedicated HTML sanitizer.",
          },
        ]}
      />
    </div>
  )
}
