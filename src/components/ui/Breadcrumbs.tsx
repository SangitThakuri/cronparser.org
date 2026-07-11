import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `https://cronparser.org${item.path ?? "/"}`,
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Link to="/" className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {item.path && i < items.length - 1 ? (
            <Link to={item.path} className="hover:text-gray-600 dark:hover:text-gray-300">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
