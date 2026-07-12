import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react"
import { AdSlot } from "../components/ui/AdSlot"
import { Breadcrumbs } from "../components/ui/Breadcrumbs"
import { CopyButton } from "../components/ui/CopyButton"
import { RelatedToolsFooter } from "../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../components/ui/SeoMeta"
import type { IntervalPage } from "../data/intervalPages"
import { buildTechArticleJsonLd } from "../lib/seoSchema"

export function IntervalLandingPage({ page }: { page: IntervalPage }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  const articleJsonLd = buildTechArticleJsonLd({
    headline: page.h1,
    description: page.metaDescription,
    path: `/${page.slug}`,
  })

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta title={page.title} description={page.metaDescription} path={`/${page.slug}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: page.h1 }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{page.h1}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{page.intro}</p>
      </div>

      {/* Canonical expression card */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
        <div className="flex items-center gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </span>
          <p className="font-mono text-xl font-semibold text-blue-800 dark:text-blue-200">{page.cron}</p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={page.cron} />
          <Link
            to={`/?expr=${encodeURIComponent(page.cron)}`}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            Try it in Cron Parser
          </Link>
        </div>
      </div>

      {/* Examples */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Examples &amp; Variations
        </h2>
        <div className="flex flex-col gap-2">
          {page.examples.map((ex) => (
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

      {/* Mistakes + Best practices */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-red-500 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Common Mistakes
          </h2>
          <ul className="flex flex-col gap-2.5">
            {page.mistakes.map((m, i) => (
              <li
                key={i}
                className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-sm leading-relaxed text-gray-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-gray-300"
              >
                {m}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Best Practices
          </h2>
          <ul className="flex flex-col gap-2.5">
            {page.bestPractices.map((b, i) => (
              <li
                key={i}
                className="rounded-lg border border-green-100 bg-green-50/50 p-3 text-sm leading-relaxed text-gray-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-gray-300"
              >
                {b}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mb-8">
        <AdSlot />
      </div>

      {/* FAQs */}
      <section className="mb-4 border-t border-gray-100 pt-8 dark:border-gray-800">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Frequently Asked Questions
        </h2>
        <dl className="flex flex-col gap-5">
          {page.faqs.map((f, i) => (
            <div key={i}>
              <dt className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">{f.q}</dt>
              <dd className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "examples"]} />
    </div>
  )
}
