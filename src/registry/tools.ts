import { lazy } from "react"
import { BookOpen, Gauge, Globe2, Library, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react"
import type { RegistryEntry } from "./types"

export const tools: RegistryEntry[] = [
  // ── Cron Tools ─────────────────────────────────────────────────────────────
  {
    id: "cheat-sheet",
    name: "Cron Cheat Sheet",
    description: "Quick reference for cron syntax, special characters, and shortcuts",
    category: "Cron Tools",
    icon: BookOpen,
    component: lazy(() => import("../tools/cheat-sheet/CheatSheet")),
  },
  {
    id: "examples",
    name: "Cron Examples Library",
    description: "Browse and search common cron expression examples",
    category: "Cron Tools",
    icon: Library,
    component: lazy(() => import("../tools/examples/ExamplesLibrary")),
  },
  {
    id: "validator",
    name: "Cron Validator",
    description: "Validate a cron expression field-by-field and normalize it",
    category: "Cron Tools",
    icon: ShieldCheck,
    component: lazy(() => import("../tools/cron-validator/CronValidator")),
  },
  {
    id: "generator",
    name: "Cron Generator",
    description: "Describe a schedule in plain English, get the cron expression",
    category: "Cron Tools",
    icon: Sparkles,
    component: lazy(() => import("../tools/cron-generator/CronGenerator")),
  },
  {
    id: "visual-builder",
    name: "Visual Cron Builder",
    description: "Build a cron expression field by field with a live preview",
    category: "Cron Tools",
    icon: SlidersHorizontal,
    component: lazy(() => import("../tools/visual-builder/VisualBuilder")),
  },
  {
    id: "timezone-converter",
    name: "Cron Timezone Converter",
    description: "Convert a cron schedule's time from one timezone to another",
    category: "Cron Tools",
    icon: Globe2,
    component: lazy(() => import("../tools/timezone-converter/TimezoneConverter")),
  },
  {
    id: "frequency-calculator",
    name: "Cron Frequency Calculator",
    description: "See how many times a cron expression runs per day, week, month, year",
    category: "Cron Tools",
    icon: Gauge,
    component: lazy(() => import("../tools/frequency-calculator/FrequencyCalculator")),
  },
]
