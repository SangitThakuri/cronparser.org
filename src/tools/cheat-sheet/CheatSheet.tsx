import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { CRON_EXAMPLES } from "../../data/cronExamples"
import { PLATFORM_GUIDES } from "../../data/platformGuides"

const FIELDS = [
  { field: "Minute", values: "0–59", special: "* , - / " },
  { field: "Hour", values: "0–23", special: "* , - / " },
  { field: "Day of Month", values: "1–31", special: "* , - / " },
  { field: "Month", values: "1–12 (or JAN–DEC)", special: "* , - / " },
  { field: "Day of Week", values: "0–6, Sun=0 (or SUN–SAT)", special: "* , - / " },
]

const SPECIAL_CHARS = [
  { char: "*", meaning: "Any value", example: "* * * * * — every minute" },
  { char: ",", meaning: "List separator", example: "0 9,17 * * * — at 9 AM and 5 PM" },
  { char: "-", meaning: "Range of values", example: "0 9-17 * * * — every hour, 9 AM to 5 PM" },
  { char: "/", meaning: "Step values", example: "*/15 * * * * — every 15 minutes" },
  { char: "?", meaning: "No specific value (Quartz / AWS EventBridge only)", example: "Used in day-of-month or day-of-week when the other is set" },
  { char: "L", meaning: "Last day of month/week (Quartz only)", example: "0 0 L * ? — last day of every month" },
  { char: "W", meaning: "Nearest weekday to a date (Quartz only)", example: "0 0 15W * ? — nearest weekday to the 15th" },
  { char: "#", meaning: "Nth weekday of the month (Quartz only)", example: "0 0 ? * 2#1 — first Monday of the month" },
]

const NICKNAMES = [
  { nickname: "@yearly / @annually", equivalent: "0 0 1 1 *", meaning: "Once a year, midnight Jan 1st" },
  { nickname: "@monthly", equivalent: "0 0 1 * *", meaning: "Once a month, midnight on the 1st" },
  { nickname: "@weekly", equivalent: "0 0 * * 0", meaning: "Once a week, midnight on Sunday" },
  { nickname: "@daily / @midnight", equivalent: "0 0 * * *", meaning: "Once a day, at midnight" },
  { nickname: "@hourly", equivalent: "0 * * * *", meaning: "Once an hour, at minute 0" },
  { nickname: "@reboot", equivalent: "—", meaning: "Run once, at startup (no fixed schedule)" },
]

const QUICK_EXAMPLES = CRON_EXAMPLES.filter((_, i) => i % 4 === 0).slice(0, 10)

export default function CheatSheet() {
  return (
    <div className="mx-auto max-w-4xl">
      <SeoMeta
        title="Cron Cheat Sheet — Syntax, Special Characters & Shortcuts | CronParser"
        description="A quick-reference cron cheat sheet: field ranges, special characters (* , - / ? L W #), @nicknames like @daily and @hourly, and common expression examples."
        path="/cheat-sheet"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Cheat Sheet</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          A quick reference for cron syntax — field ranges, special characters, and shortcuts.
        </p>
      </div>

      {/* Field reference */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Field Reference
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Field</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Allowed Values</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((f) => (
                <tr key={f.field} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{f.field}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-600 dark:text-gray-400">{f.values}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          A 6-field expression adds a leading Seconds field (0–59) before Minute.
        </p>
      </section>

      {/* Special characters */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Special Characters
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="w-16 px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Char</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Meaning</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Example</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_CHARS.map((s) => (
                <tr key={s.char} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-4 py-2.5 font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                    {s.char}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{s.meaning}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">{s.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nicknames */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Shortcuts &amp; Nicknames
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Nickname</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Equivalent</th>
                <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {NICKNAMES.map((n) => (
                <tr key={n.nickname} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-gray-100">{n.nickname}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-500 dark:text-gray-400">{n.equivalent}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{n.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Nicknames are supported by most standard cron daemons (Vixie cron, systemd-cron) but not by Quartz or AWS EventBridge.
        </p>
      </section>

      {/* Quick examples */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
            Quick Examples
          </h2>
          <Link
            to="/examples"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Browse the full library
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {QUICK_EXAMPLES.map((ex) => (
            <div
              key={ex.cron}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-gray-900 dark:text-gray-100">{ex.cron}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{ex.label}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <CopyButton text={ex.cron} />
                <Link
                  to={`/?expr=${encodeURIComponent(ex.cron)}`}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
                >
                  Try it
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform guides */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Platform Guides
        </h2>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              to={`/${guide.slug}`}
              className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              {guide.h1}
            </Link>
          ))}
        </div>
      </section>

      <ToolSeoSection
        steps={[
          "Use the Field Reference table to check the allowed value range for each of the five (or six) cron fields.",
          "Check Special Characters for the meaning of *, comma, hyphen, and slash — plus Quartz/AWS EventBridge-only characters like ?, L, W, and #.",
          "Shortcuts like @daily and @hourly are supported by most Linux cron daemons as a shorthand for their full expression.",
          "Click \"Try it\" on any quick example to open it directly in the Cron Parser with a live explanation and upcoming run times.",
        ]}
        faqs={[
          {
            q: "Are ? , L, W, and # standard cron syntax?",
            a: "No. These are extensions specific to Quartz Scheduler and AWS EventBridge. Standard POSIX/Vixie cron (used on Linux and macOS) only supports *, comma, hyphen, and slash.",
          },
          {
            q: "Can I mix a range and a step, like 9-17/2?",
            a: "Yes. 9-17/2 means every 2 hours within the 9–17 range (9, 11, 13, 15, 17). This works in the hour, minute, and day fields.",
          },
          {
            q: "What happens if both day-of-month and day-of-week are set?",
            a: "In standard cron, the job runs when either field matches — it's an OR, not an AND. For example, 0 0 1 * 1 runs on the 1st of the month AND every Monday.",
          },
          {
            q: "Where can I test an expression against this reference?",
            a: "Paste it into the Cron Parser on the home page for an instant plain-English translation and the next 5 upcoming run times.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "examples"]} />
    </div>
  )
}
