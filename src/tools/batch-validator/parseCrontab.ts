import cronstrue from "cronstrue"
import { validateCron, type CronValidationResult } from "../cron-validator/validateCron"

export type CrontabLineKind = "schedule" | "nickname" | "comment" | "blank" | "env"

export interface CrontabLineResult {
  lineNumber: number
  raw: string
  kind: CrontabLineKind
  schedule?: string
  command?: string
  validation?: CronValidationResult
  description?: string
}

const NICKNAME_DESCRIPTIONS: Record<string, string> = {
  "@yearly": "Once a year, at midnight on January 1st (same as 0 0 1 1 *)",
  "@annually": "Once a year, at midnight on January 1st (same as 0 0 1 1 *)",
  "@monthly": "Once a month, at midnight on the 1st (same as 0 0 1 * *)",
  "@weekly": "Once a week, at midnight on Sunday (same as 0 0 * * 0)",
  "@daily": "Once a day, at midnight (same as 0 0 * * *)",
  "@midnight": "Once a day, at midnight (same as 0 0 * * *)",
  "@hourly": "Once an hour, at minute 0 (same as 0 * * * *)",
  "@reboot": "Once, at system startup — not a recurring schedule",
}

function parseNicknameLine(trimmed: string, lineNumber: number, raw: string): CrontabLineResult {
  const [nickname, ...rest] = trimmed.split(/\s+/)
  const valid = nickname.toLowerCase() in NICKNAME_DESCRIPTIONS
  return {
    lineNumber,
    raw,
    kind: "nickname",
    schedule: nickname,
    command: rest.join(" "),
    validation: {
      fields: [],
      overallValid: valid,
      errorCount: valid ? 0 : 1,
      normalized: valid ? nickname : null,
    },
    description: valid ? NICKNAME_DESCRIPTIONS[nickname.toLowerCase()] : `Unrecognized nickname "${nickname}"`,
  }
}

/**
 * Parses one line of a crontab. Assumes the standard 5-field schedule form
 * (the overwhelming majority of real crontabs) — a 6-field seconds-based
 * entry is indistinguishable from "schedule + first word of the command"
 * without more context, so those should be checked with the single-expression
 * Validator instead.
 */
export function parseCrontabLine(raw: string, lineNumber: number): CrontabLineResult {
  const trimmed = raw.trim()

  if (!trimmed) return { lineNumber, raw, kind: "blank" }
  if (trimmed.startsWith("#")) return { lineNumber, raw, kind: "comment" }
  if (/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(trimmed)) return { lineNumber, raw, kind: "env" }
  if (trimmed.startsWith("@")) return parseNicknameLine(trimmed, lineNumber, raw)

  const tokens = trimmed.split(/\s+/)
  const schedule = tokens.slice(0, 5).join(" ")
  const command = tokens.slice(5).join(" ")
  const validation = validateCron(schedule)

  let description: string | undefined
  if (validation.overallValid) {
    try {
      description = cronstrue.toString(schedule, { use24HourTimeFormat: false, verbose: true })
    } catch {
      description = undefined
    }
  }

  return { lineNumber, raw, kind: "schedule", schedule, command, validation, description }
}

export function parseCrontab(text: string): CrontabLineResult[] {
  return text.split("\n").map((line, i) => parseCrontabLine(line, i + 1))
}
