export interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

export function parseHex(input: string): RgbaColor | null {
  let hex = input.trim().replace(/^#/, "")

  if (/^[0-9a-fA-F]{3}$/.test(hex) || /^[0-9a-fA-F]{4}$/.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    }
  }

  if (/^[0-9a-fA-F]{8}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 100) / 100,
    }
  }

  return null
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function toHex2(n: number): string {
  return Math.round(n).toString(16).padStart(2, "0")
}

export function toHexString({ r, g, b }: RgbaColor): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase()
}

export function toHex8String({ r, g, b, a }: RgbaColor): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}${toHex2(a * 255)}`.toUpperCase()
}

export function toRgbString({ r, g, b }: RgbaColor): string {
  return `rgb(${r}, ${g}, ${b})`
}

export function toRgbaString({ r, g, b, a }: RgbaColor): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function toHslString(color: RgbaColor): string {
  const { h, s, l } = rgbToHsl(color.r, color.g, color.b)
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function toHslaString(color: RgbaColor): string {
  const { h, s, l } = rgbToHsl(color.r, color.g, color.b)
  return `hsla(${h}, ${s}%, ${l}%, ${color.a})`
}
