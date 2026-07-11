import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
