export function tokenize(s: string): string[] {
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // XMLParser → XML Parser
    .replace(/([a-z\d])([A-Z])/g, "$1 $2") // camelCase → camel Case
    .split(/[^a-zA-Z0-9]+/)
    .filter((w) => w.length > 0)
    .map((w) => w.toLowerCase())
}

function convertLine(line: string, fn: (words: string[]) => string): string {
  if (!line.trim()) return line
  const words = tokenize(line.trim())
  return words.length > 0 ? fn(words) : line
}

export function applyConversion(text: string, fn: (words: string[]) => string): string {
  return text
    .split("\n")
    .map((line) => convertLine(line, fn))
    .join("\n")
}

export const CASE_CONVERSIONS = [
  {
    label: "camelCase",
    fn: (ws: string[]) => ws.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join(""),
  },
  {
    label: "PascalCase",
    fn: (ws: string[]) => ws.map((w) => w[0].toUpperCase() + w.slice(1)).join(""),
  },
  {
    label: "snake_case",
    fn: (ws: string[]) => ws.join("_"),
  },
  {
    label: "kebab-case",
    fn: (ws: string[]) => ws.join("-"),
  },
  {
    label: "UPPER_SNAKE",
    fn: (ws: string[]) => ws.join("_").toUpperCase(),
  },
  {
    label: "Title Case",
    fn: (ws: string[]) => ws.map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
  },
] as const

export const CHAR_TRANSFORMS = [
  { label: "UPPERCASE", fn: (t: string) => t.toUpperCase() },
  { label: "lowercase", fn: (t: string) => t.toLowerCase() },
] as const
