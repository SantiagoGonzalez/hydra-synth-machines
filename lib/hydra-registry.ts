// Registro centralizado de funciones Hydra con sus definiciones tipadas y rangos de parámetros

import type { ParamValue } from "@/lib/param-value"

export type HydraCategory = "source" | "geometry" | "color" | "blend" | "modulate"

export interface HydraParam {
  name: string
  default: number
  min: number
  max: number
  step: number
}

export interface ColorInputDef {
  channels: ("r" | "g" | "b")[]
  alphaParam?: "a"
  mode: "unit" | "multiplier"
}

export interface HydraFunctionDef {
  id: string
  label: string
  category: HydraCategory
  params: HydraParam[]
  /** Grupo RGB para bloque HEX/picker (no heurística por nombre) */
  colorInput?: ColorInputDef
  /** Para funciones de modulación/blend que requieren una fuente secundaria */
  secondarySourceId?: string
  description?: string
}

export const HYDRA_REGISTRY: HydraFunctionDef[] = [
  // ── Sources ──────────────────────────────────────────────────────────────
  {
    id: "osc",
    label: "osc",
    category: "source",
    description: "Sinusoidal bands",
    params: [
      { name: "frequency", default: 60, min: 1, max: 200, step: 1 },
      { name: "sync", default: 0.1, min: 0, max: 2, step: 0.01 },
      { name: "offset", default: 0, min: 0, max: 6.28, step: 0.01 },
    ],
  },
  {
    id: "noise",
    label: "noise",
    category: "source",
    description: "Procedural noise [-1,1]",
    params: [
      { name: "scale", default: 10, min: 1, max: 50, step: 0.5 },
      { name: "offset", default: 0.1, min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    id: "voronoi",
    label: "voronoi",
    category: "source",
    description: "Cell diagrams [0,1]",
    params: [
      { name: "scale", default: 5, min: 1, max: 50, step: 0.5 },
      { name: "speed", default: 0.3, min: 0, max: 5, step: 0.05 },
      { name: "blending", default: 0.3, min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "shape",
    label: "shape",
    category: "source",
    description: "Polygon / circle",
    params: [
      { name: "sides", default: 3, min: 3, max: 20, step: 1 },
      { name: "radius", default: 0.3, min: 0, max: 1, step: 0.01 },
      { name: "smoothing", default: 0.01, min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "gradient",
    label: "gradient",
    category: "source",
    description: "Color gradient field",
    params: [{ name: "speed", default: 0, min: 0, max: 5, step: 0.05 }],
  },
  {
    id: "solid",
    label: "solid",
    category: "source",
    description: "Solid color fill",
    colorInput: { channels: ["r", "g", "b"], alphaParam: "a", mode: "unit" },
    params: [
      { name: "r", default: 0, min: 0, max: 1, step: 0.01 },
      { name: "g", default: 0, min: 0, max: 1, step: 0.01 },
      { name: "b", default: 0, min: 0, max: 1, step: 0.01 },
      { name: "a", default: 1, min: 0, max: 1, step: 0.01 },
    ],
  },

  // ── Geometry ─────────────────────────────────────────────────────────────
  {
    id: "rotate",
    label: "rotate",
    category: "geometry",
    description: "Rotate UV coords",
    params: [
      { name: "angle", default: 10, min: 0, max: 6.28, step: 0.01 },
      { name: "speed", default: 0, min: -2, max: 2, step: 0.01 },
    ],
  },
  {
    id: "scale",
    label: "scale",
    category: "geometry",
    description: "Scale / zoom",
    params: [
      { name: "amount", default: 1.5, min: 0.1, max: 5, step: 0.05 },
      { name: "xMult", default: 1, min: 0.1, max: 5, step: 0.05 },
      { name: "yMult", default: 1, min: 0.1, max: 5, step: 0.05 },
    ],
  },
  {
    id: "kaleid",
    label: "kaleid",
    category: "geometry",
    description: "Radial mirror symmetry",
    params: [{ name: "nSides", default: 4, min: 2, max: 20, step: 1 }],
  },
  {
    id: "pixelate",
    label: "pixelate",
    category: "geometry",
    description: "Mosaic blocks",
    params: [
      { name: "pixelX", default: 20, min: 2, max: 200, step: 1 },
      { name: "pixelY", default: 20, min: 2, max: 200, step: 1 },
    ],
  },
  {
    id: "repeat",
    label: "repeat",
    category: "geometry",
    description: "Tile UV in both axes",
    params: [
      { name: "repeatX", default: 3, min: 1, max: 10, step: 0.5 },
      { name: "repeatY", default: 3, min: 1, max: 10, step: 0.5 },
      { name: "offsetX", default: 0, min: -0.5, max: 0.5, step: 0.01 },
      { name: "offsetY", default: 0, min: -0.5, max: 0.5, step: 0.01 },
    ],
  },
  {
    id: "scroll",
    label: "scroll",
    category: "geometry",
    description: "Pan UV coords",
    params: [
      { name: "scrollX", default: 0.1, min: 0, max: 1, step: 0.01 },
      { name: "scrollY", default: 0.1, min: 0, max: 1, step: 0.01 },
      { name: "speedX", default: 0, min: -2, max: 2, step: 0.01 },
      { name: "speedY", default: 0, min: -2, max: 2, step: 0.01 },
    ],
  },

  // ── Color ─────────────────────────────────────────────────────────────────
  {
    id: "colorama",
    label: "colorama",
    category: "color",
    description: "HSV cycle with fract wrap",
    params: [{ name: "amount", default: 0.005, min: 0, max: 1, step: 0.001 }],
  },
  {
    id: "posterize",
    label: "posterize",
    category: "color",
    description: "Quantize color levels",
    params: [
      { name: "bins", default: 3, min: 1, max: 20, step: 1 },
      { name: "gamma", default: 0.6, min: 0.1, max: 3, step: 0.05 },
    ],
  },
  {
    id: "color",
    label: "color",
    category: "color",
    description: "Channel remap / tint",
    colorInput: { channels: ["r", "g", "b"], mode: "multiplier" },
    params: [
      { name: "r", default: 1, min: 0, max: 2, step: 0.01 },
      { name: "g", default: 0.5, min: 0, max: 2, step: 0.01 },
      { name: "b", default: 0.8, min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    id: "brightness",
    label: "brightness",
    category: "color",
    description: "Luminance offset",
    params: [{ name: "amount", default: 0.4, min: -1, max: 1, step: 0.01 }],
  },
  {
    id: "hue",
    label: "hue",
    category: "color",
    description: "Rotate hue in HSV space",
    params: [{ name: "hueRotate", default: 0.4, min: 0, max: 1, step: 0.005 }],
  },
  {
    id: "saturate",
    label: "saturate",
    category: "color",
    description: "Boost/reduce color saturation",
    params: [{ name: "amount", default: 1.5, min: 0, max: 4, step: 0.05 }],
  },
  {
    id: "contrast",
    label: "contrast",
    category: "color",
    description: "Contrast curve adjustment",
    params: [{ name: "amount", default: 1.6, min: 0, max: 4, step: 0.05 }],
  },
  {
    id: "invert",
    label: "invert",
    category: "color",
    description: "Invert RGB values",
    params: [{ name: "amount", default: 1, min: 0, max: 1, step: 0.01 }],
  },
  {
    id: "luma",
    label: "luma",
    category: "color",
    description: "Luminance alpha key",
    params: [
      { name: "threshold", default: 0.5, min: 0, max: 1, step: 0.01 },
      { name: "tolerance", default: 0.1, min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "thresh",
    label: "thresh",
    category: "color",
    description: "Threshold binarize",
    params: [
      { name: "threshold", default: 0.5, min: 0, max: 1, step: 0.01 },
      { name: "tolerance", default: 0.04, min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "shift",
    label: "shift",
    category: "color",
    description: "RGBA channel offset shift",
    params: [
      { name: "r", default: 0.5, min: -1, max: 1, step: 0.01 },
      { name: "g", default: 0, min: -1, max: 1, step: 0.01 },
      { name: "b", default: 0, min: -1, max: 1, step: 0.01 },
      { name: "a", default: 1, min: 0, max: 2, step: 0.01 },
    ],
  },

  // ── Modulate ──────────────────────────────────────────────────────────────
  {
    id: "modulate",
    label: "modulate",
    category: "modulate",
    description: "R/G displacement warp",
    secondarySourceId: "osc",
    params: [{ name: "amount", default: 0.1, min: 0, max: 1, step: 0.005 }],
  },
  {
    id: "modulateScale",
    label: "mod·scale",
    category: "modulate",
    description: "R/G scale warp",
    secondarySourceId: "noise",
    params: [
      { name: "multiple", default: 1, min: 0.1, max: 5, step: 0.05 },
      { name: "offset", default: 1, min: -2, max: 2, step: 0.05 },
    ],
  },
  {
    id: "modulateRotate",
    label: "mod·rotate",
    category: "modulate",
    description: "Modulator-driven rotation",
    secondarySourceId: "osc",
    params: [
      { name: "multiple", default: 1, min: 0, max: 10, step: 0.1 },
      { name: "offset", default: 0, min: -3.14, max: 3.14, step: 0.05 },
    ],
  },
  {
    id: "modulateHue",
    label: "mod·hue",
    category: "modulate",
    description: "G/B displacement (bidirectional)",
    secondarySourceId: "noise",
    params: [{ name: "amount", default: 1, min: 0, max: 5, step: 0.05 }],
  },
  {
    id: "modulatePixelate",
    label: "mod·pixelate",
    category: "modulate",
    description: "Modulator-driven pixelation",
    secondarySourceId: "noise",
    params: [
      { name: "multiple", default: 10, min: 1, max: 50, step: 0.5 },
      { name: "offset", default: 3, min: -5, max: 5, step: 0.1 },
    ],
  },
  {
    id: "modulateRepeat",
    label: "mod·repeat",
    category: "modulate",
    description: "Modulator-driven tiling",
    secondarySourceId: "osc",
    params: [
      { name: "repeatX", default: 1.5, min: 0.5, max: 10, step: 0.1 },
      { name: "repeatY", default: 1.5, min: 0.5, max: 10, step: 0.1 },
      { name: "offsetX", default: 0.5, min: 0, max: 1, step: 0.01 },
      { name: "offsetY", default: 0.5, min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "modulateKaleid",
    label: "mod·kaleid",
    category: "modulate",
    description: "Modulator-driven kaleidoscope",
    secondarySourceId: "osc",
    params: [{ name: "nSides", default: 4, min: 0, max: 20, step: 0.1 }],
  },
  {
    id: "modulateScroll",
    label: "mod·scroll",
    category: "modulate",
    description: "Modulator-driven scroll warp",
    secondarySourceId: "noise",
    params: [
      { name: "scrollX", default: 0.5, min: 0, max: 1, step: 0.01 },
      { name: "scrollY", default: 0.5, min: 0, max: 1, step: 0.01 },
      { name: "speedX", default: 0, min: -2, max: 2, step: 0.01 },
      { name: "speedY", default: 0, min: -2, max: 2, step: 0.01 },
    ],
  },

  // ── Blend ─────────────────────────────────────────────────────────────────
  {
    id: "blend",
    label: "blend",
    category: "blend",
    description: "Linear mix / feedback damping",
    secondarySourceId: "osc",
    params: [{ name: "amount", default: 0.5, min: 0, max: 1, step: 0.01 }],
  },
  {
    id: "add",
    label: "add",
    category: "blend",
    description: "Add textures",
    secondarySourceId: "gradient",
    params: [{ name: "amount", default: 0.5, min: 0, max: 1, step: 0.01 }],
  },
  {
    id: "layer",
    label: "layer",
    category: "blend",
    description: "Alpha compositing",
    secondarySourceId: "shape",
    params: [],
  },
  {
    id: "sub",
    label: "sub",
    category: "blend",
    description: "Subtract textures",
    secondarySourceId: "osc",
    params: [{ name: "amount", default: 0.5, min: 0, max: 1, step: 0.01 }],
  },
  {
    id: "diff",
    label: "diff",
    category: "blend",
    description: "Absolute difference",
    secondarySourceId: "noise",
    params: [],
  },
  {
    id: "mult",
    label: "mult",
    category: "blend",
    description: "Multiply textures",
    secondarySourceId: "osc",
    params: [{ name: "amount", default: 1, min: 0, max: 1, step: 0.01 }],
  },
  {
    id: "mask",
    label: "mask",
    category: "blend",
    description: "Alpha mask",
    secondarySourceId: "shape",
    params: [],
  },
]

/** Lookup de una función por id */
export function getFunctionDef(id: string): HydraFunctionDef | undefined {
  return HYDRA_REGISTRY.find((fn) => fn.id === id)
}

const BUFFER_SOURCE_IDS = ["o0", "o1", "o2", "o3"] as const

/** Pseudo-definiciones para src(o0..o3) como fuente secundaria cross-buffer */
const BUFFER_SOURCE_DEFS: HydraFunctionDef[] = BUFFER_SOURCE_IDS.map((buf) => ({
  id: `src:${buf}`,
  label: `src(${buf})`,
  category: "source" as const,
  params: [],
  description: `Read buffer ${buf}`,
}))

/** Retorna fuentes del registro + src(o0..o3) para modulación entre outputs */
export function getSourceOptions(): HydraFunctionDef[] {
  return [...HYDRA_REGISTRY.filter((fn) => fn.category === "source"), ...BUFFER_SOURCE_DEFS]
}

/** Retorna todas las funciones de una categoría dada */
export function getRegistryByCategory(cat: HydraCategory): HydraFunctionDef[] {
  return HYDRA_REGISTRY.filter((fn) => fn.category === cat)
}

/** Obtiene los valores por defecto de los parámetros de una función */
export function getDefaultParams(def: HydraFunctionDef): Record<string, ParamValue> {
  return Object.fromEntries(def.params.map((p) => [p.name, p.default]))
}

/** Categorías únicas presentes en el registro */
export const CATEGORIES: HydraCategory[] = ["source", "geometry", "color", "modulate", "blend"]

/** Colores de categoría para UI */
export const CATEGORY_COLORS: Record<HydraCategory, string> = {
  source: "#ff4444",
  geometry: "#44aaff",
  color: "#cc44ff",
  modulate: "#44ff88",
  blend: "#ffaa44",
}

export const CATEGORY_LABELS: Record<HydraCategory, string> = {
  source: "Source",
  geometry: "Geometry",
  color: "Color",
  modulate: "Modulate",
  blend: "Blend",
}
