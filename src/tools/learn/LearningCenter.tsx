import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { AlertTriangle, ArrowLeftRight, FileCode2, ShieldCheck, Terminal } from "lucide-react"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ShareButton } from "../../components/ui/ShareButton"

const SECTIONS = [
  { id: "what-is-cron", label: "What is Cron?", icon: Terminal },
  { id: "cron-vs-crontab", label: "Cron vs Crontab", icon: ArrowLeftRight },
  { id: "cron-syntax", label: "Cron Syntax", icon: FileCode2 },
  { id: "best-practices", label: "Best Practices", icon: ShieldCheck },
  { id: "common-mistakes", label: "Common Mistakes", icon: AlertTriangle },
]

const FAQS = [
  {
    q: "Do I need to install cron?",
    a: "On Linux and macOS, cron ships pre-installed as part of the OS (occasionally omitted from minimal server images, in which case a package manager install brings it back). Windows has no native cron — see the Windows Task Scheduler comparison guide for that platform's equivalent.",
  },
  {
    q: "Is cron still relevant with modern tools like Kubernetes and GitHub Actions?",
    a: "Yes — those platforms didn't replace cron, they adopted its syntax. Kubernetes CronJob, GitHub Actions' schedule trigger, and most cloud schedulers all use standard cron expressions internally, so the syntax you learn here transfers directly.",
  },
  {
    q: "What's the best way to actually learn cron syntax?",
    a: "Start with a handful of real schedules you actually need, build them with the Cron Generator or Visual Builder, and read back the plain-English translation. Muscle memory from a few real examples sticks far better than memorizing the field table in the abstract.",
  },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

export default function LearningCenter() {
  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Learning Center — What is Cron, Syntax & Best Practices | CronParser"
        description="A complete beginner-to-practitioner guide to cron: what it is, how it differs from crontab, how the syntax works, and the best practices and common mistakes that matter in production."
        path="/learn"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Learning Center" }]} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Learning Center</h1>
          <p className="mt-2 max-w-xl text-gray-500 dark:text-gray-400">
            Everything you need to go from "what is cron" to writing production-ready schedules with
            confidence.
          </p>
        </div>
        <ShareButton getUrl={() => window.location.href} title="Cron Learning Center" />
      </div>

      {/* Table of contents */}
      <nav className="mb-10 flex flex-wrap gap-2" aria-label="Section navigation">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </a>
        ))}
      </nav>

      {/* What is Cron */}
      <section id="what-is-cron" className="mb-10 scroll-mt-20">
        <div className="mb-3 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">What is Cron?</h2>
        </div>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <p>
            Cron is a time-based job scheduler built into Unix-like operating systems. It's been part of
            Unix since the 1970s: a background daemon (traditionally called <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">crond</code>) wakes up
            once a minute, checks a list of scheduled commands, and runs any that are due — no user
            interaction required.
          </p>
          <p>
            That simple idea turned out to be foundational. Every recurring task you don't want to
            trigger by hand — nightly backups, log rotation, health checks, report generation,
            certificate renewal — is a candidate for cron. And because the concept is so useful, its
            5-field scheduling syntax has been copied (with small variations) into dozens of other
            systems: Kubernetes CronJobs, GitHub Actions schedules, AWS EventBridge, and countless
            application-level schedulers all speak some dialect of cron.
          </p>
          <p>
            Learning cron syntax once means you can read and write schedules across almost the entire
            modern infrastructure stack — which is exactly why it's still worth learning properly rather
            than treating it as a relic.
          </p>
        </div>
      </section>

      {/* Cron vs Crontab */}
      <section id="cron-vs-crontab" className="mb-10 scroll-mt-20">
        <div className="mb-3 flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cron vs Crontab</h2>
        </div>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <p>
            These two words get used interchangeably, but they mean different things, and the
            distinction clears up a lot of beginner confusion:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-gray-800 dark:text-gray-200">Cron</strong> is the system — the
              background daemon that keeps time and triggers scheduled commands. It's software running
              on the machine, not something you edit directly.
            </li>
            <li>
              <strong className="text-gray-800 dark:text-gray-200">Crontab</strong> ("cron table") is
              the configuration file that tells cron what to run and when. Each line is one schedule
              entry. You edit it with the <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">crontab -e</code> command,
              which opens your personal crontab in a text editor and reloads it into the cron daemon
              when you save.
            </li>
          </ul>
          <p>
            So "writing a cron job" really means "adding a line to your crontab" — cron itself just
            keeps reading that file and acting on it. System-wide schedules (as opposed to a single
            user's) live in <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">/etc/crontab</code> or
            drop-in files under <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">/etc/cron.d/</code>, which
            use the same syntax plus one extra field specifying which user the command should run as.
          </p>
        </div>
      </section>

      {/* Cron Syntax */}
      <section id="cron-syntax" className="mb-10 scroll-mt-20">
        <div className="mb-3 flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cron Syntax</h2>
        </div>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <p>
            A standard cron expression has five space-separated fields, each controlling one unit of
            time. In order: minute, hour, day-of-month, month, and day-of-week. A job runs when the
            current time matches every field simultaneously.
          </p>
          <div className="my-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Minute</th>
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Hour</th>
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Day</th>
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Month</th>
                  <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Weekday</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 font-mono text-gray-800 dark:text-gray-200">0–59</td>
                  <td className="px-3 py-2 font-mono text-gray-800 dark:text-gray-200">0–23</td>
                  <td className="px-3 py-2 font-mono text-gray-800 dark:text-gray-200">1–31</td>
                  <td className="px-3 py-2 font-mono text-gray-800 dark:text-gray-200">1–12</td>
                  <td className="px-3 py-2 font-mono text-gray-800 dark:text-gray-200">0–6 (Sun=0)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
            <code className="flex-1 font-mono text-sm text-gray-800 dark:text-gray-200">0 9 * * 1-5</code>
            <CopyButton text="0 9 * * 1-5" />
            <Link
              to="/?expr=0%209%20%2A%20%2A%201-5"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
            >
              Try it
            </Link>
          </div>
          <p>
            That example runs at 9:00 AM, Monday through Friday. <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">*</code> means
            "any value," and <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">1-5</code> is a
            range. Cron also supports comma lists (<code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">1,3,5</code>) and
            step values (<code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">*/15</code>).
            For the full field reference, special characters (including Quartz/AWS-only extensions like{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">L</code>,{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">W</code>, and{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-800">#</code>),
            and @nickname shortcuts, see the{" "}
            <Link to="/cheat-sheet" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Cron Cheat Sheet
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="mb-10 scroll-mt-20">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Best Practices</h2>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm">
          {[
            "Always redirect output (>> logfile.log 2>&1) rather than relying on cron's mail-based error reporting, which is often unconfigured on modern servers.",
            "Use absolute paths for every command and file your job touches — cron's environment has a minimal PATH, nothing like your interactive login shell.",
            "Guard against overlapping runs (a lock file, or your scheduler's built-in concurrency policy) for any job that might occasionally run longer than its interval.",
            "Run your server in UTC, or be explicit about timezone in your job logic — cron itself has no timezone awareness beyond the system clock it reads from.",
            "Add monitoring or alerting for anything business-critical — cron fails silently by default, and a missed nightly job can go unnoticed for a long time without it.",
            "Test the exact command cron will run, in a clean shell, before deploying it — 'it works when I run it manually' and 'it works under cron' are not the same claim.",
          ].map((tip, i) => (
            <li
              key={i}
              className="rounded-lg border border-green-100 bg-green-50/50 p-3 leading-relaxed text-gray-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-gray-300"
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Common Mistakes */}
      <section id="common-mistakes" className="mb-10 scroll-mt-20">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Common Mistakes</h2>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm">
          {[
            "Assuming day-of-month and day-of-week combine with AND logic — they actually combine with OR when both are restricted, which surprises almost everyone the first time.",
            "Editing crontab files directly with a text editor instead of crontab -e — direct edits don't automatically notify the cron daemon to reload, depending on the system.",
            "Forgetting that a script working in your shell can fail under cron purely due to PATH and environment differences — always test with an explicit, minimal environment.",
            "Mixing up 12-hour and 24-hour time — cron's hour field is always 0–23 with no AM/PM concept, so 12 means noon, not midnight.",
            "Scheduling a heavy job at midnight alongside every other 'default' midnight job, causing a resource spike instead of spreading load across quieter minutes.",
            "Not accounting for daylight saving time on servers running in local time — a job can run twice, or not at all, on the two days a year clocks change.",
          ].map((mistake, i) => (
            <li
              key={i}
              className="rounded-lg border border-red-100 bg-red-50/50 p-3 leading-relaxed text-gray-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-gray-300"
            >
              {mistake}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mb-4 border-t border-gray-100 pt-8 dark:border-gray-800">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Frequently Asked Questions
        </h2>
        <dl className="flex flex-col gap-5">
          {FAQS.map((f, i) => (
            <div key={i}>
              <dt className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">{f.q}</dt>
              <dd className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "generator"]} />
    </div>
  )
}
