import { Helmet } from "react-helmet-async"
import { DEFAULT_OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, toCanonicalPath } from "../../lib/seoSchema"

interface SeoMetaProps {
  title: string
  description: string
  path: string
  noindex?: boolean
  /** Per-route social card. Defaults to the site-wide card in /og-default.png. */
  image?: string
  imageAlt?: string
}

const SITE_URL = "https://cronparser.org"

export function SeoMeta({ title, description, path, noindex, image = DEFAULT_OG_IMAGE, imageAlt = "CronParser" }: SeoMetaProps) {
  const url = `${SITE_URL}${toCanonicalPath(path)}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={url} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="CronParser" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content={imageAlt} />

      {/* summary_large_image renders the full 1200x630 card instead of a thumbnail. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
    </Helmet>
  )
}
