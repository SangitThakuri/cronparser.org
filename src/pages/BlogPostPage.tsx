import { Helmet } from "react-helmet-async"
import { CalendarDays, Clock } from "lucide-react"
import { AdSlot } from "../components/ui/AdSlot"
import { Breadcrumbs } from "../components/ui/Breadcrumbs"
import { CopyButton } from "../components/ui/CopyButton"
import { RelatedToolsFooter } from "../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../components/ui/SeoMeta"
import type { BlogPost } from "../data/blogPosts"
import { ScheduleBugSvg } from "../components/illustrations/ScheduleBugSvg"
import { SchedulerComparisonSvg } from "../components/illustrations/SchedulerComparisonSvg"
import { SilentFailureSvg } from "../components/illustrations/SilentFailureSvg"
import { buildBlogPostingJsonLd } from "../lib/seoSchema"

const ILLUSTRATIONS = {
  "silent-failure": SilentFailureSvg,
  "scheduler-comparison": SchedulerComparisonSvg,
  "schedule-bug": ScheduleBugSvg,
} as const

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function BlogPostPage({ post }: { post: BlogPost }) {
  const Illustration = ILLUSTRATIONS[post.illustration]

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  const blogJsonLd = buildBlogPostingJsonLd({
    headline: post.h1,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    datePublished: post.publishDate,
  })

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta title={post.title} description={post.metaDescription} path={`/blog/${post.slug}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(blogJsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={[{ label: "Blog", path: "/blog" }, { label: post.h1 }]} />

      <div className="mb-5 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(post.publishDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {post.readingTime}
        </span>
      </div>

      <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">{post.h1}</h1>

      <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <Illustration />
      </div>

      <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{post.intro}</p>

      <div className="flex flex-col gap-8">
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">{section.heading}</h2>
            <div className="flex flex-col gap-3">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed text-gray-600 dark:text-gray-300">
                  {p}
                </p>
              ))}
            </div>
            {section.code && (
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-2">
                  <span className="text-xs font-medium text-gray-400">{section.code.label}</span>
                  <CopyButton text={section.code.code} />
                </div>
                <pre className="overflow-x-auto p-4">
                  <code className="whitespace-pre font-mono text-sm text-gray-100">{section.code.code}</code>
                </pre>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="my-8">
        <AdSlot />
      </div>

      <section className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Key Takeaways
        </p>
        <ul className="flex flex-col gap-2">
          {post.takeaways.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-blue-900 dark:text-blue-200">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4 border-t border-gray-100 pt-8 dark:border-gray-800">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Frequently Asked Questions
        </h2>
        <dl className="flex flex-col gap-5">
          {post.faqs.map((f, i) => (
            <div key={i}>
              <dt className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">{f.q}</dt>
              <dd className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedToolsFooter toolIds={["blog", ...post.relatedToolIds]} />
    </div>
  )
}
