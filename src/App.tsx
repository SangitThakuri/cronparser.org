import { Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ShellLayout } from "./components/layout/ShellLayout"
import { HomePage } from "./pages/HomePage"
import { AllToolsPage } from "./pages/AllToolsPage"
import { IntervalLandingPage } from "./pages/IntervalLandingPage"
import { PlatformGuidePage } from "./pages/PlatformGuidePage"
import { tools } from "./registry/tools"
import { INTERVAL_PAGES } from "./data/intervalPages"
import { PLATFORM_GUIDES } from "./data/platformGuides"
import { WEB_APPLICATION_JSON_LD } from "./lib/seoSchema"

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(WEB_APPLICATION_JSON_LD)}</script>
      </Helmet>
      <ShellLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/all-tools" element={<AllToolsPage />} />
          <Route path="/dashboard" element={<Navigate to="/all-tools" replace />} />
          {/* Cron Parser now lives on the home page — redirect the old tool URL */}
          <Route path="/cron-parser" element={<Navigate to="/" replace />} />
          {INTERVAL_PAGES.map((page) => (
            <Route key={page.slug} path={`/${page.slug}`} element={<IntervalLandingPage page={page} />} />
          ))}
          {PLATFORM_GUIDES.map((guide) => (
            <Route key={guide.slug} path={`/${guide.slug}`} element={<PlatformGuidePage guide={guide} />} />
          ))}
          {tools.map((tool) => (
            <Route
              key={tool.id}
              path={`/${tool.id}`}
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <tool.component />
                </Suspense>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ShellLayout>
    </BrowserRouter>
  )
}
