import { useState, type ReactNode } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"

interface FaqItem {
  id: string
  question: string
  answer: ReactNode
  plainAnswer: string
}

const FAQS: FaqItem[] = [
  {
    id: "what-is-a-cron-expression",
    question: "What is a Cron Expression and how do you parse it?",
    answer: (
      <>
        A <strong className="text-gray-800 dark:text-gray-200">cron expression</strong> is a
        compact string of five or six space-separated fields — minute, hour, day-of-month, month,
        and day-of-week — that defines a recurring schedule for background jobs, CI/CD pipelines,
        and server tasks. This standard <strong className="text-gray-800 dark:text-gray-200">crontab syntax</strong> can
        be hard to read at a glance, which is exactly what CronParser solves: it works as both a
        cron expression explainer and a{" "}
        <strong className="text-gray-800 dark:text-gray-200">schedule generator</strong> — paste
        any expression above for an instant plain-English translation, or use the quick-template
        buttons to build one from scratch without memorizing the syntax.
      </>
    ),
    plainAnswer:
      "A cron expression is a compact string of five or six space-separated fields — minute, hour, day-of-month, month, and day-of-week — that defines a recurring schedule for background jobs, CI/CD pipelines, and server tasks. This standard crontab syntax can be hard to read at a glance, which is exactly what CronParser solves: it works as both a cron expression explainer and a schedule generator — paste any expression for an instant plain-English translation, or use the quick-template buttons to build one from scratch without memorizing the syntax.",
  },
  {
    id: "are-these-tools-secure",
    question: "Are these developer utilities secure to use?",
    answer: (
      <>
        Yes. Every tool on CronParser — including the cron parser itself — runs{" "}
        <strong className="text-gray-800 dark:text-gray-200">100% client-side, entirely in your browser</strong>.
        Nothing you type is ever uploaded to a remote backend server: API keys,{" "}
        <strong className="text-gray-800 dark:text-gray-200">.env configuration values</strong>,
        JWTs, and raw strings are parsed, validated, and transformed locally with native
        JavaScript, then discarded the moment you close or refresh the tab. There's no server
        round-trip to intercept and no database quietly storing your input.
      </>
    ),
    plainAnswer:
      "Yes. Every tool on CronParser — including the cron parser itself — runs 100% client-side, entirely in your browser. Nothing you type is ever uploaded to a remote backend server: API keys, .env configuration values, JWTs, and raw strings are parsed, validated, and transformed locally with native JavaScript, then discarded the moment you close or refresh the tab. There's no server round-trip to intercept and no database quietly storing your input.",
  },
  {
    id: "other-devops-tools",
    question: "What other DevOps tools are available on CronParser?",
    answer: (
      <>
        Beyond cron scheduling, CronParser bundles a full DevOps toolkit: convert between formats
        with the <Link to="/json-formatter" className="font-medium text-blue-600 hover:underline dark:text-blue-400">JSON Formatter</Link>{" "}
        and <Link to="/yaml-json" className="font-medium text-blue-600 hover:underline dark:text-blue-400">YAML ⇄ JSON converter</Link>,
        debug patterns with the{" "}
        <Link to="/regex-tester" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Regex Tester</Link>,
        or turn any terminal command into ready-to-use code with the{" "}
        <Link to="/curl-converter" className="font-medium text-blue-600 hover:underline dark:text-blue-400">cURL ⇄ JS Fetch Converter</Link>.
        See the full lineup on the{" "}
        <Link to="/all-tools" className="font-medium text-blue-600 hover:underline dark:text-blue-400">All Tools page</Link>.
      </>
    ),
    plainAnswer:
      "Beyond cron scheduling, CronParser bundles a full DevOps toolkit: convert between formats with the JSON Formatter and YAML ⇄ JSON converter, debug patterns with the Regex Tester, or turn any terminal command into ready-to-use code with the cURL ⇄ JS Fetch Converter. See the full lineup on the All Tools page.",
  },
]

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.plainAnswer,
    },
  })),
}

export function HomeFaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id)

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <section aria-labelledby="home-faq-heading" className="mx-auto mt-14 max-w-3xl">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(FAQ_JSON_LD)}</script>
      </Helmet>

      <div className="mb-6 text-center">
        <h2
          id="home-faq-heading"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          Frequently Asked Questions &amp; Guides
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Everything you need to know about parsing cron expressions and using CronParser's
          developer toolkit.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((item) => {
          const isOpen = openId === item.id
          return (
            <div
              key={item.id}
              className={`rounded-xl border bg-white transition-colors dark:bg-gray-900 ${
                isOpen
                  ? "border-blue-300 dark:border-blue-700"
                  : "border-gray-200 hover:border-blue-200 dark:border-gray-800 dark:hover:border-blue-800/60"
              }`}
            >
              <h3 className="text-base">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
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
                  <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
