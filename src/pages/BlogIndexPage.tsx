import { Link } from "react-router-dom"
import { CalendarDays, Clock } from "lucide-react"
import { Breadcrumbs } from "../components/ui/Breadcrumbs"
import { SeoMeta } from "../components/ui/SeoMeta"
import { BLOG_POSTS } from "../data/blogPosts"
import { ScheduleBugSvg } from "../components/illustrations/ScheduleBugSvg"
import { SchedulerComparisonSvg } from "../components/illustrations/SchedulerComparisonSvg"
import { SilentFailureSvg } from "../components/illustrations/SilentFailureSvg"

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

export function BlogIndexPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))

  return (
    <div className="mx-auto max-w-3xl py-10">
      <SeoMeta
        title="Blog — Cron Gotchas, Incidents & Tooling | CronParser"
        description="Deep dives on cron scheduling: silent failures, real-world bugs, and when to reach for something other than plain cron."
        path="/blog"
      />

      <Breadcrumbs items={[{ label: "Blog" }]} />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blog</h1>
        <p className="mx-auto mt-2 max-w-xl text-gray-500 dark:text-gray-400">
          Longer-form pieces on cron scheduling — real failure modes, platform comparisons, and the incidents that
          taught people the hard lessons the reference pages summarize in one line.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {sorted.map((post) => {
          const Illustration = ILLUSTRATIONS[post.illustration]
          return (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="border-b border-gray-100 dark:border-gray-800">
                <Illustration />
              </div>
              <div className="p-6">
                <div className="mb-2 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.publishDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {post.h1}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{post.excerpt}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
