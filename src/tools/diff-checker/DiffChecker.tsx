import { Fragment, useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

// ── LCS-based line diff ───────────────────────────────────────────────────────

type Op = { type: "equal" | "delete" | "insert"; text: string }

function lineDiff(a: string[], b: string[]): Op[] {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])

  const ops: Op[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: "equal", text: a[i - 1] }); i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "insert", text: b[j - 1] }); j--
    } else {
      ops.push({ type: "delete", text: a[i - 1] }); i--
    }
  }
  return ops.reverse()
}

type RowKind = "equal" | "delete" | "insert" | "change"

interface DiffRow {
  kind: RowKind
  leftNo: number | null
  rightNo: number | null
  leftText: string | null
  rightText: string | null
}

function buildRows(ops: Op[]): DiffRow[] {
  const rows: DiffRow[] = []
  let ln = 1, rn = 1, i = 0
  while (i < ops.length) {
    if (ops[i].type === "equal") {
      rows.push({ kind: "equal", leftNo: ln++, rightNo: rn++, leftText: ops[i].text, rightText: ops[i].text })
      i++
    } else {
      const dels: string[] = []
      const ins: string[] = []
      while (i < ops.length && ops[i].type === "delete") { dels.push(ops[i].text); i++ }
      while (i < ops.length && ops[i].type === "insert") { ins.push(ops[i].text); i++ }
      const len = Math.max(dels.length, ins.length)
      for (let k = 0; k < len; k++) {
        const hasDel = k < dels.length, hasIns = k < ins.length
        rows.push({
          kind: hasDel && hasIns ? "change" : hasDel ? "delete" : "insert",
          leftNo: hasDel ? ln++ : null,
          rightNo: hasIns ? rn++ : null,
          leftText: hasDel ? dels[k] : null,
          rightText: hasIns ? ins[k] : null,
        })
      }
    }
  }
  return rows
}

// ── Styling helpers ───────────────────────────────────────────────────────────

const bgLeft: Record<RowKind, string> = {
  equal:  "",
  delete: "bg-red-50 dark:bg-red-950/70",
  insert: "bg-gray-50 dark:bg-gray-800/50",
  change: "bg-red-50 dark:bg-red-950/70",
}
const bgRight: Record<RowKind, string> = {
  equal:  "",
  delete: "bg-gray-50 dark:bg-gray-800/50",
  insert: "bg-green-50 dark:bg-green-950/70",
  change: "bg-green-50 dark:bg-green-950/70",
}
const textLeft: Record<RowKind, string> = {
  equal:  "text-gray-800 dark:text-gray-200",
  delete: "text-red-700 dark:text-red-300",
  insert: "text-gray-400 dark:text-gray-600",
  change: "text-red-700 dark:text-red-300",
}
const textRight: Record<RowKind, string> = {
  equal:  "text-gray-800 dark:text-gray-200",
  delete: "text-gray-400 dark:text-gray-600",
  insert: "text-green-700 dark:text-green-300",
  change: "text-green-700 dark:text-green-300",
}

// ── Component ─────────────────────────────────────────────────────────────────

const MAX_LINES = 500

export default function DiffChecker() {
  const [textA, setTextA] = useState("")
  const [textB, setTextB] = useState("")

  const result = useMemo(() => {
    if (!textA && !textB) return null
    const linesA = textA.split("\n")
    const linesB = textB.split("\n")
    if (linesA.length > MAX_LINES || linesB.length > MAX_LINES)
      return { tooLarge: true } as const
    const rows = buildRows(lineDiff(linesA, linesB))
    return {
      tooLarge: false,
      rows,
      added:   rows.filter(r => r.kind === "insert").length,
      removed: rows.filter(r => r.kind === "delete").length,
      changed: rows.filter(r => r.kind === "change").length,
      equal:   rows.filter(r => r.kind === "equal").length,
    }
  }, [textA, textB])

  const identical = result && !result.tooLarge && result.rows.every(r => r.kind === "equal")

  return (
    <div className="mx-auto max-w-6xl">
      <Helmet>
        <title>Online Side-by-Side Text Diff Checker Tool | DevBits</title>
        <meta
          name="description"
          content="Compare two code structures or texts side-by-side. View insertions, deletions, and line changes instantly with clean color highlights."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Text Diff Checker</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Paste two texts to compare them line-by-line. Differences are highlighted instantly.
        </p>
      </div>

      {/* Input panels */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Text A{" "}
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(original)</span>
          </label>
          <textarea
            value={textA}
            onChange={e => setTextA(e.target.value)}
            placeholder="Paste original text here…"
            rows={10}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Text B{" "}
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(modified)</span>
          </label>
          <textarea
            value={textB}
            onChange={e => setTextB(e.target.value)}
            placeholder="Paste modified text here…"
            rows={10}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>
      </div>

      {/* Stats bar */}
      {result && !result.tooLarge && (
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
          {identical ? (
            <span className="font-medium text-green-600 dark:text-green-400">✓ Texts are identical</span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-300 dark:bg-green-700" />
                {result.added} added
              </span>
              <span className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-300 dark:bg-red-700" />
                {result.removed} removed
              </span>
              {result.changed > 0 && (
                <span className="text-gray-600 dark:text-gray-400">{result.changed} changed</span>
              )}
              <span className="text-gray-400 dark:text-gray-500">{result.equal} unchanged</span>
            </>
          )}
        </div>
      )}

      {/* Too-large warning */}
      {result?.tooLarge && (
        <div className="mb-4 overflow-x-auto rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          Input exceeds {MAX_LINES} lines per side. Reduce the text length to run the diff.
        </div>
      )}

      {/* Diff table */}
      {result && !result.tooLarge && result.rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid min-w-[640px] grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
            {/* Column headers */}
            <div className="bg-gray-50 px-3 py-2 dark:bg-gray-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Text A — Original
              </span>
            </div>
            <div className="bg-gray-50 px-3 py-2 dark:bg-gray-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Text B — Modified
              </span>
            </div>

            {/* Diff rows */}
            {result.rows.map((row, idx) => (
              <Fragment key={idx}>
                {/* Left cell */}
                <div
                  className={`flex min-h-[1.625rem] items-start gap-2 px-2 py-px ${bgLeft[row.kind]}`}
                >
                  <span className="w-8 shrink-0 select-none text-right font-mono text-xs leading-[1.625rem] text-gray-300 dark:text-gray-700">
                    {row.leftNo ?? ""}
                  </span>
                  <span className={`flex-1 whitespace-pre font-mono text-sm leading-[1.625rem] ${textLeft[row.kind]}`}>
                    {row.leftText ?? ""}
                  </span>
                </div>
                {/* Right cell */}
                <div
                  className={`flex min-h-[1.625rem] items-start gap-2 px-2 py-px ${bgRight[row.kind]}`}
                >
                  <span className="w-8 shrink-0 select-none text-right font-mono text-xs leading-[1.625rem] text-gray-300 dark:text-gray-700">
                    {row.rightNo ?? ""}
                  </span>
                  <span className={`flex-1 whitespace-pre font-mono text-sm leading-[1.625rem] ${textRight[row.kind]}`}>
                    {row.rightText ?? ""}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 p-12 dark:border-gray-700">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Paste text into both panels above to see the diff
          </p>
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Paste the original version of your text or code into the 'Text A' panel on the left.",
          "Paste the modified version into the 'Text B' panel on the right — the diff updates on every keystroke.",
          "Removed lines are highlighted in red on the left; added lines appear in green on the right. Modified lines show red on the left and green on the right.",
          "The summary bar above the diff table shows the total count of added, removed, and changed lines.",
        ]}
        faqs={[
          {
            q: "Is my text sent to any server?",
            a: "No. All diffing runs entirely in your browser using a client-side LCS (Longest Common Subsequence) algorithm. Nothing is transmitted over the network.",
          },
          {
            q: "What diffing algorithm is used?",
            a: "The tool uses a classic LCS dynamic-programming algorithm on a line-by-line basis, similar to the Unix diff command. It finds the minimal set of insertions and deletions to transform Text A into Text B.",
          },
          {
            q: "What is the maximum input size?",
            a: `Up to ${MAX_LINES} lines per side. Beyond that, the LCS table grows large enough to cause noticeable lag in the browser, so the tool prompts you to reduce the input size.`,
          },
          {
            q: "Can I compare source code files?",
            a: "Yes. The tool treats each line as an atomic unit and compares them exactly, including indentation and whitespace, making it suitable for source code, JSON, YAML, configuration files, or any line-oriented text.",
          },
        ]}
      />
    </div>
  )
}
