export interface DotenvLine {
  line: number
  raw: string
  kind: "blank" | "comment" | "entry"
  key: string | null
  value: string | null
  errors: string[]
}

function isQuoted(value: string): boolean {
  return (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  )
}

export function parseDotenv(text: string): DotenvLine[] {
  const lines = text.split("\n")
  const firstSeenAt = new Map<string, number>()
  const results: DotenvLine[] = []

  lines.forEach((raw, i) => {
    const lineNo = i + 1
    const trimmed = raw.trim()

    if (trimmed === "") {
      results.push({ line: lineNo, raw, kind: "blank", key: null, value: null, errors: [] })
      return
    }
    if (trimmed.startsWith("#")) {
      results.push({ line: lineNo, raw, kind: "comment", key: null, value: null, errors: [] })
      return
    }

    const errors: string[] = []
    const eqIndex = raw.indexOf("=")

    if (eqIndex === -1) {
      results.push({
        line: lineNo,
        raw,
        kind: "entry",
        key: null,
        value: null,
        errors: ["Missing '=' — expected KEY=value syntax"],
      })
      return
    }

    const rawKeyPart = raw.slice(0, eqIndex)
    const rawValuePart = raw.slice(eqIndex + 1)
    const key = rawKeyPart.trim()
    const value = rawValuePart.trim()

    if (/\s$/.test(rawKeyPart) || /^\s/.test(rawValuePart)) {
      errors.push("Spaces around '=' — use KEY=value, not KEY = value")
    }

    if (!key) {
      errors.push("Missing key name before '='")
    } else if (/^[0-9]/.test(key)) {
      errors.push(`Key "${key}" cannot start with a number`)
    } else if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      errors.push(`Key "${key}" contains invalid characters — use only letters, numbers, and underscores`)
    }

    if (key) {
      const firstLine = firstSeenAt.get(key)
      if (firstLine !== undefined) {
        errors.push(`Duplicate key "${key}" (first defined on line ${firstLine})`)
      } else {
        firstSeenAt.set(key, lineNo)
      }
    }

    if (value && !isQuoted(value) && /\s/.test(value)) {
      errors.push("Unquoted value contains spaces — wrap it in quotes")
    }

    results.push({ line: lineNo, raw, kind: "entry", key: key || null, value: value || null, errors })
  })

  return results
}

export function formatDotenv(lines: DotenvLine[]): string {
  return lines
    .map((l) => {
      if (l.kind === "blank") return ""
      if (l.kind === "comment") return l.raw.trim()
      if (!l.key) return l.raw
      return `${l.key}=${l.value ?? ""}`
    })
    .join("\n")
}
