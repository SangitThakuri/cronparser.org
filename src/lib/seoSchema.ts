const SITE_URL = "https://cronparser.org"

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
    url: `${SITE_URL}${path}`,
    dateModified: dateModified ?? new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "CronParser" },
    publisher: { "@type": "Organization", name: "CronParser" },
  }
}
