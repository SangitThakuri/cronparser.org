import { useState } from "react"
import { ChevronDown, GraduationCap } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { buildTechArticleJsonLd } from "../../lib/seoSchema"
import { Helmet } from "react-helmet-async"

interface Question {
  q: string
  a: string
}

type Level = "Beginner" | "Intermediate" | "Advanced"

const QUESTIONS: Record<Level, Question[]> = {
  Beginner: [
    {
      q: "What is cron, and what problem does it solve?",
      a: "Cron is a time-based job scheduler built into Unix-like operating systems. A background daemon checks a configuration file (the crontab) once a minute and runs any commands that are due. It solves the problem of automating recurring tasks — backups, reports, cleanup jobs — without needing a human (or a running application) to trigger them manually.",
    },
    {
      q: "What are the five fields in a standard cron expression, in order?",
      a: "Minute (0-59), hour (0-23), day-of-month (1-31), month (1-12), and day-of-week (0-6, where 0 is Sunday). A job runs when the current time matches all five fields at once.",
    },
    {
      q: "Write a cron expression that runs a job every day at 3:30 AM.",
      a: "30 3 * * * — minute 30, hour 3, every day-of-month, every month, every day-of-week.",
    },
    {
      q: "What does the asterisk (*) mean in a cron field?",
      a: "It means 'any value' — the field imposes no restriction, so it matches every possible value for that unit of time.",
    },
    {
      q: "How do you edit your personal crontab?",
      a: "With the command crontab -e, which opens your crontab in a text editor (vi by default on most systems) and installs the updated schedule for the cron daemon to pick up when you save.",
    },
    {
      q: "What's the difference between */15 and 15 in the minute field?",
      a: "*/15 is a step value meaning 'every 15 minutes' (0, 15, 30, 45). A bare 15 means the job runs only once per hour, at exactly minute 15.",
    },
  ],
  Intermediate: [
    {
      q: "How do day-of-month and day-of-week interact when both are restricted?",
      a: "They combine with OR logic, not AND — a common trip-up. 0 0 1 * MON runs at midnight on both the 1st of the month AND every Monday, not only when the 1st happens to fall on a Monday. If only one field is restricted, the other (left as *) is effectively ignored.",
    },
    {
      q: "Why might a cron job that works when run manually fail when run by cron?",
      a: "Cron executes commands with a minimal environment — a bare-bones PATH, no login shell profile sourced, and a different working directory than your interactive session. Scripts that rely on tools or environment variables available only in your shell's profile often fail silently under cron. The fix is to use absolute paths and explicitly set any required environment variables in the crontab or script itself.",
    },
    {
      q: "What's the difference between @daily and 0 0 * * *?",
      a: "None functionally — @daily is a nickname supported by most standard cron daemons that expands to exactly 0 0 * * *. Nicknames are shorthand, not a different scheduling mechanism.",
    },
    {
      q: "How would you debug a cron job that isn't running?",
      a: "Check the cron daemon is running (systemctl status cron), check the crontab syntax is valid, check the system log (grep CRON /var/log/syslog or journalctl -u cron) for evidence the job was even attempted, and test the exact command in a clean, minimal shell to rule out an environment/PATH issue. Redirecting the job's own output to a log file for the next run also helps catch a silent failure.",
    },
    {
      q: "How do you schedule a job to run every 2 hours, only on weekdays?",
      a: "0 */2 * * 1-5 — minute 0, every 2nd hour, every day-of-month, every month, Monday through Friday (1-5 in the day-of-week field).",
    },
    {
      q: "What happens if a cron job is still running when its next scheduled invocation comes around?",
      a: "Standard cron doesn't check — it starts the new invocation regardless, potentially running two instances of the same job concurrently. Preventing this requires your own overlap protection, such as a lock file or a flag checked at the start of the script.",
    },
  ],
  Advanced: [
    {
      q: "How does Quartz Scheduler's cron syntax differ from standard cron, and why?",
      a: "Quartz uses 6 or 7 fields (adding a leading seconds field and an optional trailing year field) and requires exactly one of day-of-month/day-of-week to be '?' rather than allowing both to be '*' with OR-logic resolution. This removes the ambiguity standard cron accepts, at the cost of stricter, more verbose syntax. Quartz also supports L (last), W (nearest weekday), and # (nth weekday of month), none of which exist in POSIX cron.",
    },
    {
      q: "Why can't standard cron express 'the last day of the month' directly?",
      a: "Cron's day-of-month field only accepts fixed numbers, ranges, steps, and lists — none of which can express a relative concept like 'whatever the final day happens to be,' since that value (28, 29, 30, or 31) changes month to month. The common workaround is scheduling on days 28-31 and checking programmatically whether tomorrow rolls into a new month.",
    },
    {
      q: "How would you design a distributed system to avoid duplicate execution of a scheduled job across multiple replicas?",
      a: "Either centralize scheduling (run the cron trigger on exactly one designated instance or a dedicated scheduler service) or decentralize it with a distributed lock (a Redis-based lock or a database row with a short TTL) that only lets one replica's invocation actually execute the job body — every replica's cron fires, but only the lock-holder proceeds.",
    },
    {
      q: "What's the correct way to handle daylight saving time transitions for a cron job running in local time?",
      a: "The cleanest fix is running the cron daemon itself in UTC and converting to local time only where a user-facing time actually matters. If the system genuinely must run in local time, be aware that a job scheduled during the 'spring forward' hour may not run at all that day, and a job during 'fall back' may run twice, since that clock hour occurs zero or two times respectively.",
    },
    {
      q: "How does AWS EventBridge's cron() expression differ from Quartz's, despite both using 6 fields?",
      a: "This is a common trap: Quartz's 6-field format is second-minute-hour-day-month-weekday, while AWS EventBridge's 6-field format is minute-hour-day-month-weekday-year — no seconds, but with a year field. Same field count, different composition. Both share Quartz's day-of-week numbering (1-7, Sunday=1) and the requirement that one of day-of-month/day-of-week be '?'.",
    },
    {
      q: "What's the risk of an unbounded polling job scheduled with * * * * * (every minute), and how would you mitigate it?",
      a: "If the job's work occasionally takes longer than a minute, invocations can stack up faster than they complete, exhausting resources (connections, memory, file handles) over time. Mitigate with explicit overlap protection (a lock or PID check), monitoring of actual run duration versus the schedule interval, and considering whether a longer interval or an event-driven trigger would better fit the actual latency requirement.",
    },
  ],
}

const LEVEL_STYLES: Record<Level, string> = {
  Beginner: "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400",
  Intermediate: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Advanced: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: (Object.entries(QUESTIONS) as [Level, Question[]][]).flatMap(([, questions]) =>
    questions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
}

const articleJsonLd = buildTechArticleJsonLd({
  headline: "Cron Interview Questions",
  description:
    "18 cron interview questions and detailed answers across Beginner, Intermediate, and Advanced levels — covering syntax, debugging, distributed scheduling, and platform-specific gotchas.",
  path: "/interview-questions",
})

export default function InterviewQuestions() {
  const [openKey, setOpenKey] = useState<string | null>("Beginner-0")

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Interview Questions — Beginner to Advanced with Answers | CronParser"
        description="18 cron interview questions with detailed answers, from basic syntax to distributed scheduling and platform-specific gotchas. Prepare for DevOps and backend interviews."
        path="/interview-questions"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Interview Questions" }]} />

      <div className="mb-6 flex items-start gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Interview Questions</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            18 questions across Beginner, Intermediate, and Advanced levels — for interview prep or a
            quick self-check.
          </p>
        </div>
      </div>

      {(Object.entries(QUESTIONS) as [Level, Question[]][]).map(([level, questions]) => (
        <section key={level} className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLES[level]}`}>
              {level}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{questions.length} questions</span>
          </div>
          <div className="flex flex-col gap-2">
            {questions.map((item, i) => {
              const key = `${level}-${i}`
              const isOpen = openKey === key
              return (
                <div
                  key={key}
                  className={`rounded-xl border bg-white transition-colors dark:bg-gray-900 ${
                    isOpen
                      ? "border-blue-300 dark:border-blue-700"
                      : "border-gray-200 hover:border-blue-200 dark:border-gray-800 dark:hover:border-blue-800/60"
                  }`}
                >
                  <h3 className="text-sm">
                    <button
                      type="button"
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-blue-500 dark:text-blue-400" : ""
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <div className="mb-8">
        <AdSlot />
      </div>

      <RelatedToolsFooter toolIds={["home", "learn", "cheat-sheet"]} />
    </div>
  )
}
