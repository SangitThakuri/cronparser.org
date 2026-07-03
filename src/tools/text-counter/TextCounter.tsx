import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { computeStats, formatReadingTime } from "./textStats"

export default function TextCounter() {
  const [text, setText] = useState("")
  const stats = useMemo(() => computeStats(text), [text])

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Word Counter & Character Counter — Count Words, Lines, Bytes | CronParser</title>
        <meta
          name="description"
          content="Count words, characters, lines, sentences, paragraphs, and UTF-8 bytes in real-time. Free online word counter and character counter with reading time estimate."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Word &amp; Character Counter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Count words, characters, lines, and bytes in real-time as you type.
        </p>
      </div>

      <div className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here…"
          rows={10}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Text Statistics
          </span>
        </div>
        <div className="grid grid-cols-2 divide-y divide-gray-100 dark:divide-gray-800 sm:grid-cols-4 sm:divide-y-0 sm:[&>*:not(:nth-child(4n))]:border-r sm:[&>*:not(:nth-child(4n))]:border-gray-100 sm:dark:[&>*:not(:nth-child(4n))]:border-gray-800">
          <StatCell label="Words" value={stats.words.toLocaleString()} />
          <StatCell label="Characters" value={stats.chars.toLocaleString()} />
          <StatCell label="Without Spaces" value={stats.charsNoSpaces.toLocaleString()} />
          <StatCell label="Lines" value={stats.lines.toLocaleString()} />
          <StatCell label="Sentences" value={stats.sentences.toLocaleString()} />
          <StatCell label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
          <StatCell label="UTF-8 Bytes" value={stats.bytes.toLocaleString()} />
          <StatCell label="Reading Time" value={formatReadingTime(stats.readingTimeSec)} />
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Type or paste your text into the input area — every statistic updates live with each keystroke.",
          "Words are counted by whitespace-separated tokens; sentences are counted by terminal punctuation (. ! ?); paragraphs are counted by blank-line breaks.",
          "Reading time is estimated at an average reading speed of 200 words per minute.",
          "UTF-8 Bytes shows the actual byte size the text would occupy when saved or transmitted as UTF-8 — useful for tweet limits, database column sizes, or API payload limits.",
        ]}
        faqs={[
          {
            q: "How is word count calculated?",
            a: "The text is trimmed and split on any run of whitespace, so multiple spaces or line breaks between words don't inflate the count.",
          },
          {
            q: "Why are characters and UTF-8 bytes different numbers?",
            a: "JavaScript's string length counts UTF-16 code units, not bytes. ASCII characters are 1 byte each in UTF-8, but emoji and many non-Latin characters take 2–4 bytes, so the byte count can exceed the character count.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All counting happens entirely in your browser via plain JavaScript. Nothing you type is transmitted anywhere.",
          },
        ]}
      />
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}
