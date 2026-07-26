export const GLOBAL_FADERS = [
  { id: "speed", label: "SPEED", min: 0, max: 3, step: 0.05, default: 1 },
  { id: "brightness", label: "BRIGHT", min: -1, max: 1, step: 0.01, default: 0 },
  { id: "decay", label: "DECAY", min: 0, max: 1, step: 0.01, default: 0 },
  { id: "amount", label: "AMOUNT", min: 0, max: 1, step: 0.01, default: 0.5 },
] as const

export type GlobalFaderId = (typeof GLOBAL_FADERS)[number]["id"]

export type GlobalFaderValues = Record<GlobalFaderId, number>

export function getDefaultGlobalFaders(): GlobalFaderValues {
  return Object.fromEntries(GLOBAL_FADERS.map((fader) => [fader.id, fader.default])) as GlobalFaderValues
}
