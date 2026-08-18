import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import "./index.css"
import App from "./App.tsx"

// Dark mode is the default appearance; only an explicit "light" choice opts out.
const savedTheme = localStorage.getItem("cronparser-theme")
if (savedTheme === "light") {
  document.documentElement.classList.remove("dark")
} else {
  document.documentElement.classList.add("dark")
}

const rootEl = document.getElementById("root")!
const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)

// Only a handful of routes (see BODY_PRERENDER_PATHS in scripts/prerender.mjs) ship
// real server-rendered markup inside #root — everything else still ships the empty
// shell it always has. Checking for actual content here (rather than hardcoding
// that route list a second time on the client) means this can never drift out of
// sync with what prerender.mjs actually produced: hydrate when there's real markup
// to attach to, mount fresh otherwise, and never hydrate an empty root.
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}
