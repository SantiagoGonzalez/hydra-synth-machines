export const POSITIONAL_KEY_CODES = [
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",
  "KeyY",
  "KeyU",
  "KeyI",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
] as const

export const PARAM_ACTION_KEY_MAP = {
  KeyX: "focus-source",
  KeyB: "toggle-bypass",
  KeyC: "random",
} as const

const CHAIN_POSITION_KEY_MAP: Record<string, number> = {
  Digit1: 1,
  Digit2: 2,
  Digit3: 3,
  Digit4: 4,
  Digit5: 5,
  Digit6: 6,
  Digit7: 7,
  Digit8: 8,
  Digit9: 9,
}

export function chainPositionForCode(code: string): number | undefined {
  return CHAIN_POSITION_KEY_MAP[code]
}

export type ParamAction = (typeof PARAM_ACTION_KEY_MAP)[keyof typeof PARAM_ACTION_KEY_MAP]

export function cellIndexForCode(code: string): number | undefined {
  const index = POSITIONAL_KEY_CODES.indexOf(code as (typeof POSITIONAL_KEY_CODES)[number])
  return index === -1 ? undefined : index
}

export function keyLabelForIndex(index: number): string | undefined {
  const code = POSITIONAL_KEY_CODES[index]
  if (!code) return undefined
  return code.replace("Key", "")
}
