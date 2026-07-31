// Conversión RGB ↔ HEX para controles de color en el launchpad

export type ColorInputMode = "unit" | "multiplier"

/** Clampa un canal según el modo del param (multiplier → [0,1]) */
export function clampChannel(value: number, mode: ColorInputMode): number {
  if (mode === "multiplier") return Math.min(1, Math.max(0, value))
  return value
}

/** Convierte canales 0–1 a HEX #RRGGBB (clampa a [0,1] para el swatch) */
export function rgbToHex(r: number, g: number, b: number, mode: ColorInputMode = "unit"): string {
  const cr = Math.round(clampChannel(r, mode) * 255)
  const cg = Math.round(clampChannel(g, mode) * 255)
  const cb = Math.round(clampChannel(b, mode) * 255)
  return `#${cr.toString(16).padStart(2, "0")}${cg.toString(16).padStart(2, "0")}${cb.toString(16).padStart(2, "0")}`
}

/** Parsea #RGB o #RRGGBB a canales 0–1; retorna null si inválido */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const trimmed = hex.trim()
  const match3 = /^#([0-9a-fA-F]{3})$/.exec(trimmed)
  if (match3) {
    const [r, g, b] = match3[1].split("").map((c) => parseInt(c + c, 16) / 255)
    return { r, g, b }
  }
  const match6 = /^#([0-9a-fA-F]{6})$/.exec(trimmed)
  if (match6) {
    const h = match6[1]
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    }
  }
  return null
}
