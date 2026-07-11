export interface GeneratedCron {
  cron: string
  explanation: string
}

const DAY_NAMES: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
}

const TIME_RE = /[\d: apm]+/

function parseTime(text: string): { hour: number; minute: number } | null {
  const t = text.trim().toLowerCase()
  if (t === "midnight") return { hour: 0, minute: 0 }
  if (t === "noon") return { hour: 12, minute: 0 }

  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/)
  if (!m) return null

  let hour = Number(m[1])
  const minute = m[2] ? Number(m[2]) : 0
  const meridiem = m[3]

  if (meridiem === "pm" && hour < 12) hour += 12
  if (meridiem === "am" && hour === 12) hour = 0
  if (hour > 23 || minute > 59) return null

  return { hour, minute }
}

export function generateCron(phrase: string): GeneratedCron | null {
  const text = phrase.trim().toLowerCase()
  if (!text) return null

  let m = text.match(/every\s+(\d+)\s+minutes?/)
  if (m) return { cron: `*/${m[1]} * * * *`, explanation: `Every ${m[1]} minutes` }

  if (/every\s+minute/.test(text)) return { cron: "* * * * *", explanation: "Every minute" }

  m = text.match(/every\s+(\d+)\s+hours?/)
  if (m) return { cron: `0 */${m[1]} * * *`, explanation: `Every ${m[1]} hours` }

  if (/every\s+hour/.test(text)) return { cron: "0 * * * *", explanation: "Every hour, on the hour" }

  m = text.match(new RegExp(`every\\s+weekday(?:s)?(?:\\s+at\\s+(${TIME_RE.source}))?`))
  if (m) {
    const time = m[1] ? parseTime(m[1]) : { hour: 0, minute: 0 }
    if (time) {
      return {
        cron: `${time.minute} ${time.hour} * * 1-5`,
        explanation: `Every weekday at ${m[1] ? m[1].trim() : "midnight"}`,
      }
    }
  }

  m = text.match(new RegExp(`every\\s+weekend(?:s)?(?:\\s+at\\s+(${TIME_RE.source}))?`))
  if (m) {
    const time = m[1] ? parseTime(m[1]) : { hour: 0, minute: 0 }
    if (time) {
      return {
        cron: `${time.minute} ${time.hour} * * 0,6`,
        explanation: `Every weekend at ${m[1] ? m[1].trim() : "midnight"}`,
      }
    }
  }

  for (const [name, num] of Object.entries(DAY_NAMES)) {
    const re = new RegExp(`every\\s+${name}(?:s)?(?:\\s+at\\s+(${TIME_RE.source}))?`)
    m = text.match(re)
    if (m) {
      const time = m[1] ? parseTime(m[1]) : { hour: 0, minute: 0 }
      if (time) {
        return {
          cron: `${time.minute} ${time.hour} * * ${num}`,
          explanation: `Every ${name} at ${m[1] ? m[1].trim() : "midnight"}`,
        }
      }
    }
  }

  m = text.match(new RegExp(`every\\s+day(?:\\s+at\\s+(${TIME_RE.source}))?`))
  if (m) {
    const time = m[1] ? parseTime(m[1]) : { hour: 0, minute: 0 }
    if (time) {
      return {
        cron: `${time.minute} ${time.hour} * * *`,
        explanation: `Every day at ${m[1] ? m[1].trim() : "midnight"}`,
      }
    }
  }

  if (/^daily$/.test(text)) return { cron: "0 0 * * *", explanation: "Every day at midnight" }

  m = text.match(new RegExp(`^at\\s+(${TIME_RE.source})\\s+every\\s+day`))
  if (m) {
    const time = parseTime(m[1])
    if (time) return { cron: `${time.minute} ${time.hour} * * *`, explanation: `Every day at ${m[1].trim()}` }
  }

  m = text.match(/every\s+month\s+on\s+the\s+(\d{1,2})(?:st|nd|rd|th)?/)
  if (m) {
    const day = Number(m[1])
    if (day >= 1 && day <= 31) {
      return { cron: `0 0 ${day} * *`, explanation: `Monthly on day ${day} at midnight` }
    }
  }

  if (/every\s+month/.test(text)) {
    return { cron: "0 0 1 * *", explanation: "Every month on the 1st at midnight" }
  }

  return null
}

export const EXAMPLE_PHRASES = [
  "Run every weekday at 9 AM",
  "Run every Sunday at midnight",
  "Run every 15 minutes",
  "Every day at 6:30pm",
  "Every hour",
  "Every weekend at noon",
  "Every month on the 15th",
]
