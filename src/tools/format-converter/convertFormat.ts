export type CronFormat = "standard5" | "quartz6" | "quartz7" | "aws6"

export const FORMAT_LABELS: Record<CronFormat, string> = {
  standard5: "Standard (5-field)",
  quartz6: "Quartz (6-field)",
  quartz7: "Quartz (7-field)",
  aws6: "AWS EventBridge (6-field)",
}

export const FORMAT_FIELD_COUNT: Record<CronFormat, number> = {
  standard5: 5,
  quartz6: 6,
  quartz7: 7,
  aws6: 6,
}

interface NormalizedFields {
  second: string | null
  minute: string
  hour: string
  dom: string
  month: string
  dow: string
  year: string | null
}

function parseByFormat(expression: string, format: CronFormat): NormalizedFields | { error: string } {
  const parts = expression.trim().split(/\s+/)
  const expected = FORMAT_FIELD_COUNT[format]
  if (parts.length !== expected) {
    return { error: `${FORMAT_LABELS[format]} expects ${expected} fields, got ${parts.length}` }
  }

  switch (format) {
    case "standard5": {
      const [minute, hour, dom, month, dow] = parts
      return { second: null, minute, hour, dom, month, dow, year: null }
    }
    case "quartz6": {
      const [second, minute, hour, dom, month, dow] = parts
      return { second, minute, hour, dom, month, dow, year: null }
    }
    case "quartz7": {
      const [second, minute, hour, dom, month, dow, year] = parts
      return { second, minute, hour, dom, month, dow, year }
    }
    case "aws6": {
      const [minute, hour, dom, month, dow, year] = parts
      return { second: null, minute, hour, dom, month, dow, year }
    }
  }
}

function convertDowToken(token: string, direction: "toQuartz" | "toStandard"): string {
  if (token === "*" || token === "?") return direction === "toQuartz" ? "?" : "*"

  return token
    .split(",")
    .map((segment) => {
      const [rangePart, step] = segment.split("/")
      const convertedRange = rangePart
        .split("-")
        .map((part) => {
          const n = Number(part)
          if (!Number.isInteger(n)) return part // named days (MON, FRI, ...) are identical in both dialects
          return direction === "toQuartz" ? String((((n % 7) + 7) % 7) + 1) : String((n - 1 + 7) % 7)
        })
        .join("-")
      return step !== undefined ? `${convertedRange}/${step}` : convertedRange
    })
    .join(",")
}

function reconcileForStandard(dom: string, dow: string): { dom: string; dow: string } {
  return {
    dom: dom === "?" ? "*" : dom,
    dow: dow === "?" ? "*" : convertDowToken(dow, "toStandard"),
  }
}

function reconcileForQuartz(dom: string, dow: string): { dom: string; dow: string; warning?: string } {
  const domWild = dom === "*"
  const dowWild = dow === "*"

  if (domWild && dowWild) return { dom: "*", dow: "?" }
  if (dowWild) return { dom, dow: "?" }
  if (domWild) return { dom: "?", dow: convertDowToken(dow, "toQuartz") }

  return {
    dom,
    dow: convertDowToken(dow, "toQuartz"),
    warning:
      "Both day-of-month and day-of-week are restricted in the source, which uses OR logic in standard cron. Quartz-style formats require one of them to be '?' and combine the rest with AND — this conversion keeps day-of-month as specified; double-check the result matches your intent.",
  }
}

export interface ConversionResult {
  format: CronFormat
  expression: string
  notes: string[]
}

export interface ConvertFormatResult {
  results: ConversionResult[]
  standardEquivalent: string | null
  error: string | null
}

export function convertCronFormat(expression: string, sourceFormat: CronFormat): ConvertFormatResult {
  const parsed = parseByFormat(expression, sourceFormat)
  if ("error" in parsed) return { results: [], standardEquivalent: null, error: parsed.error }

  const usesQuartzDow = sourceFormat !== "standard5"
  const { dom, dow } = usesQuartzDow ? reconcileForStandard(parsed.dom, parsed.dow) : { dom: parsed.dom, dow: parsed.dow }

  const hasSecondsInSource = parsed.second !== null
  const second = hasSecondsInSource ? parsed.second! : "0"

  const baseNotes: string[] = []
  if (hasSecondsInSource && second !== "0" && second !== "*") {
    baseNotes.push(
      `The source seconds field "${second}" can't be represented in formats without sub-minute precision (Standard, AWS EventBridge) — those outputs run at second :00 instead.`,
    )
  }

  const standardExpression = `${parsed.minute} ${parsed.hour} ${dom} ${parsed.month} ${dow}`

  const targets: CronFormat[] = ["standard5", "quartz6", "quartz7", "aws6"]
  const results: ConversionResult[] = []

  for (const target of targets) {
    if (target === sourceFormat) continue
    const notes = [...baseNotes]

    if (target === "standard5") {
      results.push({ format: target, expression: standardExpression, notes })
      continue
    }

    const q = reconcileForQuartz(dom, dow)
    if (q.warning) notes.push(q.warning)

    if (target === "aws6") {
      results.push({ format: target, expression: `${parsed.minute} ${parsed.hour} ${q.dom} ${parsed.month} ${q.dow} *`, notes })
    } else if (target === "quartz6") {
      results.push({ format: target, expression: `${second} ${parsed.minute} ${parsed.hour} ${q.dom} ${parsed.month} ${q.dow}`, notes })
    } else if (target === "quartz7") {
      const year = parsed.year ?? "*"
      results.push({
        format: target,
        expression: `${second} ${parsed.minute} ${parsed.hour} ${q.dom} ${parsed.month} ${q.dow} ${year}`,
        notes,
      })
    }
  }

  return { results, standardEquivalent: standardExpression, error: null }
}
