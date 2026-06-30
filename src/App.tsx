import { Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ShellLayout } from "./components/layout/ShellLayout"
import { tools } from "./registry/tools"

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )
}

function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Helmet>
        <title>DevBits — Free Developer Utilities</title>
        <meta name="description" content="A collection of free, fast, and private developer tools. Format JSON, encode Base64, debug JWTs, and test regex — all client-side." />
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Welcome to DevBits
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Select a tool from the sidebar to get started.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={`/${tool.id}`}
            className="rounded-xl border border-gray-200 bg-white p-6 text-left transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {tool.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ShellLayout>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
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
