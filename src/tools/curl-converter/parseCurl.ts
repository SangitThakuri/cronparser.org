export interface ParsedCurl {
  method: string
  url: string | null
  headers: [string, string][]
  body: string | null
  errors: string[]
}

function tokenizeCommand(input: string): string[] {
  const joined = input.replace(/\\\r?\n/g, " ")
  const tokens: string[] = []
  let current = ""
  let quote: '"' | "'" | null = null
  let hasToken = false

  for (let i = 0; i < joined.length; i++) {
    const ch = joined[i]

    if (quote) {
      if (ch === quote) {
        quote = null
      } else if (ch === "\\" && quote === '"' && i + 1 < joined.length) {
        current += joined[++i]
      } else {
        current += ch
      }
      continue
    }

    if (ch === '"' || ch === "'") {
      quote = ch
      hasToken = true
    } else if (/\s/.test(ch)) {
      if (hasToken) {
        tokens.push(current)
        current = ""
        hasToken = false
      }
    } else if (ch === "\\" && i + 1 < joined.length) {
      current += joined[++i]
      hasToken = true
    } else {
      current += ch
      hasToken = true
    }
  }
  if (hasToken) tokens.push(current)

  return tokens
}

const DATA_FLAGS = new Set(["-d", "--data", "--data-raw", "--data-binary", "--data-ascii"])

export function parseCurl(command: string): ParsedCurl {
  const trimmed = command.trim()
  const errors: string[] = []

  if (!trimmed) {
    return { method: "GET", url: null, headers: [], body: null, errors: [] }
  }

  const tokens = tokenizeCommand(trimmed)
  let explicitMethod: string | null = null
  let url: string | null = null
  const headers: [string, string][] = []
  let body: string | null = null

  let i = tokens[0] === "curl" ? 1 : 0

  for (; i < tokens.length; i++) {
    const tok = tokens[i]

    if (tok === "-X" || tok === "--request") {
      explicitMethod = tokens[++i] ?? explicitMethod
    } else if (tok === "-H" || tok === "--header") {
      const header = tokens[++i]
      if (header) {
        const idx = header.indexOf(":")
        if (idx === -1) {
          errors.push(`Malformed header: "${header}"`)
        } else {
          headers.push([header.slice(0, idx).trim(), header.slice(idx + 1).trim()])
        }
      }
    } else if (DATA_FLAGS.has(tok)) {
      body = tokens[++i] ?? body
    } else if (!tok.startsWith("-") && !url) {
      url = tok
    }
  }

  if (!url) errors.push("No URL found in the command")

  return {
    method: explicitMethod ?? (body ? "POST" : "GET"),
    url,
    headers,
    body,
    errors,
  }
}

function indentContinuationLines(text: string, spaces: number): string {
  const pad = " ".repeat(spaces)
  return text
    .split("\n")
    .map((line, i) => (i === 0 ? line : pad + line))
    .join("\n")
}

export function buildFetchCode(parsed: ParsedCurl): string {
  if (!parsed.url) return ""

  const optionLines: string[] = [`    method: ${JSON.stringify(parsed.method)},`]

  if (parsed.headers.length > 0) {
    const headerLines = parsed.headers.map(
      ([k, v]) => `      ${JSON.stringify(k)}: ${JSON.stringify(v)},`,
    )
    headerLines[headerLines.length - 1] = headerLines[headerLines.length - 1].replace(/,$/, "")
    optionLines.push(`    headers: {\n${headerLines.join("\n")}\n    },`)
  }

  if (parsed.body) {
    let bodyExpr: string
    try {
      const parsedBody = JSON.parse(parsed.body)
      const pretty = JSON.stringify(parsedBody, null, 2)
      bodyExpr = `JSON.stringify(${indentContinuationLines(pretty, 4)})`
    } catch {
      bodyExpr = JSON.stringify(parsed.body)
    }
    optionLines.push(`    body: ${bodyExpr},`)
  }

  optionLines[optionLines.length - 1] = optionLines[optionLines.length - 1].replace(/,$/, "")

  return `async function fetchData() {
  const response = await fetch(${JSON.stringify(parsed.url)}, {
${optionLines.join("\n")}
  })

  const data = await response.json()
  console.log(data)
}

fetchData()`
}
