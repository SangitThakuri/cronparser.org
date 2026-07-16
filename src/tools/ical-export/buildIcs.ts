function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

function toIcsUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

interface BuildIcsParams {
  runs: Date[]
  title: string
  cronExpression: string
}

/**
 * Builds a minimal RFC 5545 .ics file with one VEVENT per upcoming run time.
 * Deliberately uses discrete events instead of a single RRULE — most cron
 * expressions (arbitrary step values, DOM-or-DOW combinations) don't map
 * cleanly onto iCalendar's recurrence rules, while a flat list of computed
 * instants is always correct regardless of how the expression is built.
 * Timestamps are written in UTC (Z suffix) so every calendar app displays
 * them correctly converted to the viewer's own local timezone.
 */
export function buildIcs({ runs, title, cronExpression }: BuildIcsParams): string {
  const now = toIcsUtcStamp(new Date())
  const safeTitle = escapeIcsText(title || "Cron Job")
  const description = escapeIcsText(`Cron expression: ${cronExpression}`)

  const events = runs
    .map((run, i) => {
      const start = toIcsUtcStamp(run)
      return [
        "BEGIN:VEVENT",
        `UID:cronparser-${run.getTime()}-${i}@cronparser.org`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        "DURATION:PT1M",
        `SUMMARY:${safeTitle}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
      ].join("\r\n")
    })
    .join("\r\n")

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CronParser//Cron to iCal Export//EN",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n")
}
