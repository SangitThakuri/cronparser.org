import { Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ShellLayout } from "./components/layout/ShellLayout"
import { HomePage } from "./pages/HomePage"
import { AllToolsPage } from "./pages/AllToolsPage"
import { tools } from "./registry/tools"

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
      <ShellLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/all-tools" element={<AllToolsPage />} />
          <Route path="/dashboard" element={<Navigate to="/all-tools" replace />} />
          {/* Cron Parser now lives on the home page — redirect the old tool URL */}
          <Route path="/cron-parser" element={<Navigate to="/" replace />} />
          {/* Retired combined tools — split into dedicated single-purpose pages */}
          <Route path="/codec" element={<Navigate to="/base64-converter" replace />} />
          <Route path="/text-inspector" element={<Navigate to="/case-converter" replace />} />
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
