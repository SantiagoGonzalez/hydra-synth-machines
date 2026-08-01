// Catálogo de paletas por tabs para swatches de color (expandible a futuro)

export const SWATCHES_PER_TAB = 12

export interface ColorPaletteTab {
  id: string
  /** Etiqueta corta en el tab */
  label: string
  /** Nombre completo (tooltip) */
  title: string
  /** Nombres ancla documentales (futuro: leyendas / config ampliada) */
  anchorLabels?: readonly string[]
  colors: readonly string[]
}

export interface ColorPaletteCatalog {
  version: number
  tabs: readonly ColorPaletteTab[]
}

const CHROMATIC_SATURATION = 88
const CHROMATIC_LIGHTNESS = 52

/** Convierte HSL (h 0–360, s/l 0–100) a #RRGGBB */
function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360
  const sat = s / 100
  const light = l / 100
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) {
    r = c
    g = x
  } else if (hue < 120) {
    r = x
    g = c
  } else if (hue < 180) {
    g = c
    b = x
  } else if (hue < 240) {
    g = x
    b = c
  } else if (hue < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Muestra N colores entre dos matices (soporta cruce de 0°) */
function buildHueWedge(startHue: number, endHue: number, count: number): string[] {
  const start = ((startHue % 360) + 360) % 360
  const end = ((endHue % 360) + 360) % 360
  const span = end >= start ? end - start : 360 - start + end
  return Array.from({ length: count }, (_, i) => {
    const hue = start + (span * i) / (count - 1)
    return hslToHex(hue, CHROMATIC_SATURATION, CHROMATIC_LIGHTNESS)
  })
}

function buildGrayscale(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const lightness = 6 + (i * (94 - 6)) / (count - 1)
    return hslToHex(0, 0, lightness)
  })
}

/**
 * 4 wedges cromáticos (~120° cada uno, cubren el círculo con solape en bordes)
 * + tab de grises. Estructura lista para tabs/paletas extra en versiones futuras.
 */
export const DEFAULT_COLOR_PALETTE_CATALOG: ColorPaletteCatalog = {
  version: 1,
  tabs: [
    {
      id: "red-orange",
      label: "R–N",
      title: "Rojo–naranja",
      anchorLabels: ["Rojo", "Rojo-naranja", "Naranja"],
      colors: buildHueWedge(330, 90, SWATCHES_PER_TAB),
    },
    {
      id: "yellow-green",
      label: "A–V",
      title: "Amarillo–verde",
      anchorLabels: ["Amarillo-naranja", "Amarillo", "Amarillo-verde"],
      colors: buildHueWedge(60, 180, SWATCHES_PER_TAB),
    },
    {
      id: "green-blue",
      label: "V–A",
      title: "Verde–azul",
      anchorLabels: ["Verde", "Azul-verde", "Azul"],
      colors: buildHueWedge(150, 270, SWATCHES_PER_TAB),
    },
    {
      id: "violet-red",
      label: "V–R",
      title: "Violeta–rojo",
      anchorLabels: ["Azul-violeta", "Violeta", "Rojo-violeta"],
      colors: buildHueWedge(240, 360, SWATCHES_PER_TAB),
    },
    {
      id: "grayscale",
      label: "Gris",
      title: "Escala grises",
      colors: buildGrayscale(SWATCHES_PER_TAB),
    },
  ],
}
