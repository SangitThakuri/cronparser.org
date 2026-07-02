const MONTH_ALIASES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

const DOW_ALIASES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

const MAX_LOOKAHEAD_YEARS = 8
const MAX_ITERATIONS = 200_000

interface ParsedField {
  set: Set<number>
  wildcard: boolean
}

function resolveToken(
  token: string,
  min: number,
  max: number,
  aliases?: Record<string, number>,
): number {
  const lower = token.toLowerCase()
  if (aliases && lower in aliases) return aliases[lower]
  const n = Number(token)
  if (!Number.isInteger(n)) throw new Error(`Invalid value "${token}"`)
  if (n < min || n > max) {
    throw new Error(`Value ${n} is out of range [${min}-${max}]`)
  }
  return n
}

function parseField(
  raw: string,
  min: number,
  max: number,
  aliases?: Record<string, number>,
  normalize?: (v: number) => number,
): ParsedField {
  const set = new Set<number>()
  let wildcard = false
  const segments = raw.split(",").map((s) => s.trim()).filter(Boolean)
  if (segments.length === 0) throw new Error("Empty field")

  for (const segment of segments) {
    const [rangePart, stepPart] = segment.split("/")
    const step = stepPart !== undefined ? Number(stepPart) : 1
    if (!Number.isInteger(step) || step <= 0) {
      throw new Error(`Invalid step value in "${segment}"`)
    }

    let start: number
    let end: number

    if (rangePart === "*" || rangePart === "?") {
      start = min
      end = max
      if (stepPart === undefined) wildcard = true
    } else if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-")
      start = resolveToken(a, min, max, aliases)
      end = resolveToken(b, min, max, aliases)
    } else {
      start = resolveToken(rangePart, min, max, aliases)
      end = stepPart !== undefined ? max : start
    }

    if (start > end) throw new Error(`Invalid range "${segment}"`)

    for (let v = start; v <= end; v += step) {
      set.add(normalize ? normalize(v) : v)
    }
  }

  return { set, wildcard }
}

export interface CronNextRunsResult {
  runs: Date[]
  error: string | null
}

export function getNextCronRuns(
  expression: string,
  count: number,
  from: Date = new Date(),
): CronNextRunsResult {
  const trimmed = expression.trim()
  if (!trimmed) return { runs: [], error: null }

  const parts = trimmed.split(/\s+/)
  if (parts.length !== 5 && parts.length !== 6) {
    return { runs: [], error: "Expression must have 5 or 6 space-separated fields" }
  }

  try {
    const hasSeconds = parts.length === 6
    const [secStr, minStr, hourStr, domStr, monthStr, dowStr] = hasSeconds
      ? parts
      : ["0", ...parts]

    const seconds = parseField(secStr, 0, 59)
    const minutes = parseField(minStr, 0, 59)
    const hours = parseField(hourStr, 0, 23)
    const doms = parseField(domStr, 1, 31)
    const months = parseField(monthStr, 1, 12, MONTH_ALIASES)
    const dows = parseField(dowStr, 0, 7, DOW_ALIASES, (v) => (v === 7 ? 0 : v))

    const dayMatches = (d: Date): boolean => {
      const domMatch = doms.set.has(d.getDate())
      const dowMatch = dows.set.has(d.getDay())
      if (doms.wildcard && dows.wildcard) return true
      if (doms.wildcard) return dowMatch
      if (dows.wildcard) return domMatch
      return domMatch || dowMatch
    }

    const t = new Date(from.getTime())
    t.setMilliseconds(0)
    if (hasSeconds) {
      t.setSeconds(t.getSeconds() + 1)
    } else {
      t.setSeconds(0)
      t.setMinutes(t.getMinutes() + 1)
    }

    const maxYear = t.getFullYear() + MAX_LOOKAHEAD_YEARS
    const runs: Date[] = []
    let iterations = 0

    while (runs.length < count && iterations < MAX_ITERATIONS) {
      iterations++
      if (t.getFullYear() > maxYear) break

      if (!months.set.has(t.getMonth() + 1)) {
        t.setFullYear(t.getFullYear(), t.getMonth() + 1, 1)
        t.setHours(0, 0, 0, 0)
        continue
      }
      if (!dayMatches(t)) {
        t.setDate(t.getDate() + 1)
        t.setHours(0, 0, 0, 0)
        continue
      }
      if (!hours.set.has(t.getHours())) {
        t.setHours(t.getHours() + 1, 0, 0, 0)
        continue
      }
      if (!minutes.set.has(t.getMinutes())) {
        t.setMinutes(t.getMinutes() + 1, 0, 0)
        continue
      }
      if (hasSeconds && !seconds.set.has(t.getSeconds())) {
        t.setSeconds(t.getSeconds() + 1, 0)
        continue
      }

      runs.push(new Date(t.getTime()))
      if (hasSeconds) {
        t.setSeconds(t.getSeconds() + 1)
      } else {
        t.setMinutes(t.getMinutes() + 1)
      }
    }

    if (runs.length === 0) {
      return {
        runs: [],
        error: `No matching run found within the next ${MAX_LOOKAHEAD_YEARS} years`,
      }
    }

    return { runs, error: null }
  } catch (e) {
    return { runs: [], error: e instanceof Error ? e.message : String(e) }
  }
}
