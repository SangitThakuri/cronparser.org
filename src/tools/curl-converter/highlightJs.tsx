import type { ReactNode } from "react"

const TOKEN_RE =
  /(?<string>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(?<keyword>\b(?:async|function|const|let|var|await|return)\b)|(?<key>[A-Za-z_$][\w$]*(?=\s*:))|(?<punct>[{}()[\],;])/g

export function highlightJs(code: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0

  for (const match of code.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      nodes.push(<span key={key++}>{code.slice(lastIndex, index)}</span>)
    }

    const groups = match.groups ?? {}
    const className = groups.string
      ? "text-emerald-400"
      : groups.keyword
        ? "text-purple-400"
        : groups.key
          ? "text-sky-400"
          : "text-gray-500"

    nodes.push(
      <span key={key++} className={className}>
        {match[0]}
      </span>,
    )
    lastIndex = index + match[0].length
  }

  if (lastIndex < code.length) {
    nodes.push(<span key={key++}>{code.slice(lastIndex)}</span>)
  }

  return nodes
}
