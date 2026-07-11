export interface TzConversionResult {
  cron: string | null
  error: string | null
  warning: string | null
}

export const TIMEZONE_OPTIONS = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const

function getOffsetMinutes(timeZone: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const parts = dtf.formatToParts(at).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value
    return acc
  }, {})
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return (asUTC - at.getTime()) / 60000
}

export function convertCronTimezone(
  cron: string,
  fromTz: string,
  toTz: string,
  reference: Date = new Date(),
): TzConversionResult {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) {
    return { cron: null, error: "Only standard 5-field expressions are supported.", warning: null }
  }

  const [minute, hour, dom, month, dow] = parts

  if (!/^\d+$/.test(minute) || !/^\d+(,\d+)*$/.test(hour)) {
    return {
      cron: null,
      error:
        "Timezone conversion requires a fixed minute and fixed hour(s) — wildcards, ranges, and steps in the minute/hour fields aren't supported.",
      warning: null,
    }
  }

  if (Number(minute) > 59 || hour.split(",").some((h) => Number(h) > 23)) {
    return { cron: null, error: "Minute or hour value out of range.", warning: null }
  }

  const fromOffset = getOffsetMinutes(fromTz, reference)
  const toOffset = getOffsetMinutes(toTz, reference)
  const diffMinutes = toOffset - fromOffset

  let dayShifted = false
  const newHours = hour.split(",").map((h) => {
    const totalMinutes = Number(h) * 60 + Number(minute) + diffMinutes
    if (totalMinutes < 0 || totalMinutes >= 1440) dayShifted = true
    const normalized = ((totalMinutes % 1440) + 1440) % 1440
    return Math.floor(normalized / 60)
  })
  const newMinute = (((Number(minute) + diffMinutes) % 60) + 60) % 60
  const uniqueHours = [...new Set(newHours)].sort((a, b) => a - b)

  return {
    cron: `${newMinute} ${uniqueHours.join(",")} ${dom} ${month} ${dow}`,
    error: null,
    warning: dayShifted
      ? "This conversion crosses midnight — the day-of-month/day-of-week fields were not adjusted. Double-check this schedule manually if the exact day matters."
      : null,
  }
}
