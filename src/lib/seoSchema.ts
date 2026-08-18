const SITE_URL = "https://cronparser.org"

// Cloudflare Pages serves directory-style routes (everything except "/") at their
// trailing-slash form with a genuine 200, and 308-redirects the no-slash form to it.
// Every canonical/OG/JSON-LD URL must use the trailing-slash form to match what
// actually gets served, rather than a URL that immediately redirects away from itself.
export function toCanonicalPath(path: string): string {
  return path === "/" || path.endsWith("/") ? path : `${path}/`
}

export const WEB_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CronParser",
  url: SITE_URL,
  description:
    "A complete cron platform: parse, generate, validate, visualize, and compare cron expressions entirely client-side, with guides for every major scheduler.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}

interface TechArticleParams {
  headline: string
  description: string
  path: string
  dateModified?: string
}

export function buildTechArticleJsonLd({ headline, description, path, dateModified }: TechArticleParams) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url: `${SITE_URL}${toCanonicalPath(path)}`,
    dateModified: dateModified ?? new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "CronParser" },
    publisher: { "@type": "Organization", name: "CronParser" },
  }
}

interface BlogPostingParams {
  headline: string
  description: string
  path: string
  datePublished: string
}

export function buildBlogPostingJsonLd({ headline, description, path, datePublished }: BlogPostingParams) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    url: `${SITE_URL}${toCanonicalPath(path)}`,
    datePublished,
    dateModified: datePublished,
    author: { "@type": "Organization", name: "CronParser" },
    publisher: { "@type": "Organization", name: "CronParser" },
  }
}
