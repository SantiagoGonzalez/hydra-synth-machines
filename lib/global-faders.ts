export const GLOBAL_FADERS = [
  { id: "speed", label: "SPEED", min: 0, max: 3, step: 0.05, default: 1 },
  { id: "bpm", label: "BPM", min: 30, max: 300, step: 1, default: 120 },
  { id: "brightness", label: "BRIGHT", min: -1, max: 1, step: 0.01, default: 0 },
  { id: "feedback", label: "FEEDBACK", min: 0, max: 1, step: 0.01, default: 0 },
] as const

export type GlobalFaderId = (typeof GLOBAL_FADERS)[number]["id"]

export type GlobalFaderValues = Record<GlobalFaderId, number>

export function getDefaultGlobalFaders(): GlobalFaderValues {
  return Object.fromEntries(GLOBAL_FADERS.map((fader) => [fader.id, fader.default])) as GlobalFaderValues
}

/** Migra claves legacy (decay/amount) al shape actual del store */
export function normalizeGlobalFaders(values: Partial<Record<string, number>>): GlobalFaderValues {
  const defaults = getDefaultGlobalFaders()
  return {
    speed: values.speed ?? defaults.speed,
    bpm: values.bpm ?? defaults.bpm,
    brightness: values.brightness ?? defaults.brightness,
    feedback: values.feedback ?? values.decay ?? defaults.feedback,
  }
}

/** Mapea el fader BRIGHT (−1…1) a filter CSS master sobre el canvas */
export function brightnessToCssFilter(brightness: number): string {
  return `brightness(${1 + brightness})`
}
