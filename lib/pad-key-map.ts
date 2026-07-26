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
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "Comma",
] as const

export function cellIndexForCode(code: string): number | undefined {
  const index = POSITIONAL_KEY_CODES.indexOf(code as (typeof POSITIONAL_KEY_CODES)[number])
  return index === -1 ? undefined : index
}

export function keyLabelForIndex(index: number): string | undefined {
  const code = POSITIONAL_KEY_CODES[index]
  if (!code) return undefined
  return code === "Comma" ? "," : code.replace("Key", "")
}
