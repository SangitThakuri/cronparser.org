export interface TextStats {
  chars: number
  charsNoSpaces: number
  words: number
  lines: number
  bytes: number
  paragraphs: number
  sentences: number
  readingTimeSec: number
}

export function computeStats(text: string): TextStats {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+/g)?.length ?? (text.trim() ? 1 : 0)) : 0
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0

  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    words,
    lines: text ? text.split("\n").length : 0,
    bytes: new TextEncoder().encode(text).length,
    paragraphs,
    sentences,
    readingTimeSec: Math.ceil((words / 200) * 60),
  }
}

export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
}
