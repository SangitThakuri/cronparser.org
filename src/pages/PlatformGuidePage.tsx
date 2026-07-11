import { Helmet } from "react-helmet-async"
import { AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { AdSlot } from "../components/ui/AdSlot"
import { Breadcrumbs } from "../components/ui/Breadcrumbs"
import { CopyButton } from "../components/ui/CopyButton"
import { RelatedToolsFooter } from "../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../components/ui/SeoMeta"
import type { PlatformGuide } from "../data/platformGuides"

export function PlatformGuidePage({ guide }: { guide: PlatformGuide }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta title={guide.title} description={guide.metaDescription} path={`/${guide.slug}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: guide.h1 }]} />

      <div className="mb-2">
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {guide.category}
        </span>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{guide.h1}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{guide.intro}</p>
      </div>

      {/* Syntax notes */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Syntax Notes
          </p>
          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">{guide.syntaxNotes}</p>
        </div>
      </div>

      {/* Code examples */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Examples
        </h2>
        <div className="flex flex-col gap-3">
          {guide.codeExamples.map((ex, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-2">
                <span className="text-xs font-medium text-gray-400">{ex.label}</span>
                <CopyButton text={ex.code} />
              </div>
              <pre className="overflow-x-auto p-4">
                <code className="whitespace-pre font-mono text-sm text-gray-100">{ex.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Gotchas + Best practices */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-red-500 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Gotchas
          </h2>
          <ul className="flex flex-col gap-2.5">
            {guide.gotchas.map((g, i) => (
              <li
                key={i}
                className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-sm leading-relaxed text-gray-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-gray-300"
              >
                {g}
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
            {guide.bestPractices.map((b, i) => (
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
          {guide.faqs.map((f, i) => (
            <div key={i}>
              <dt className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">{f.q}</dt>
              <dd className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "validator"]} />
    </div>
  )
}
