import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { AppShell } from "./App"

// Renders the exact same route tree and layout the client uses (AppShell), at a
// given path, to a plain HTML string — used by scripts/prerender.mjs to inject
// real body markup into specific routes' #root instead of shipping an empty div.
//
// HelmetProvider is required here only because AppShell's child components render
// <Helmet> internally (SeoMeta, Breadcrumbs, etc.) and react-helmet-async throws
// if <Helmet> is used outside a provider — the resulting head tags are discarded;
// prerender.mjs already builds <head> content separately via its own data-driven
// buildHead(), so there's nothing to extract from helmetContext here.
export function renderAppShell(path: string): string {
  const helmetContext = {}
  return renderToString(
    <StaticRouter location={path}>
      <HelmetProvider context={helmetContext}>
        <AppShell />
      </HelmetProvider>
    </StaticRouter>,
  )
}
