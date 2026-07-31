// Tipos y utilidades para valores de parámetro escalar o función de time

export type FnShape = "sin" | "cos" | "tan" | "linear"

export const FN_SHAPES: FnShape[] = ["sin", "cos", "tan", "linear"]

export interface ParamFnValue {
  kind: "fn"
  shape: FnShape
  freq: number
  amp: number
  offset: number
}

export interface ParamAudioValue {
  kind: "audio"
  bin: number
  scale: number
  offset: number
}

export type ParamValue = number | ParamFnValue | ParamAudioValue

export const DEFAULT_FN_VALUE: ParamFnValue = {
  kind: "fn",
  shape: "sin",
  freq: 1,
  amp: 0.5,
  offset: 0,
}

export const DEFAULT_AUDIO_BINS = 4

export const DEFAULT_AUDIO_VALUE: ParamAudioValue = {
  kind: "audio",
  bin: 0,
  scale: 1,
  offset: 0,
}

/** Indica si el valor es una función de time */
export function isParamFn(value: ParamValue): value is ParamFnValue {
  return typeof value === "object" && value !== null && value.kind === "fn"
}

/** Indica si el valor reacciona al FFT de audio */
export function isParamAudio(value: ParamValue): value is ParamAudioValue {
  return typeof value === "object" && value !== null && value.kind === "audio"
}

/** Valor escalar efectivo para UI (preview estático del fn/audio) */
export function scalarPreview(value: ParamValue, fallback = 0): number {
  if (typeof value === "number") return value
  return value.offset
}

/** Normaliza un valor persistido (número legacy o ParamValue) */
export function normalizeParamValue(value: unknown, fallback: number): ParamValue {
  if (typeof value === "number" && !Number.isNaN(value)) return value
  if (isParamFn(value as ParamValue)) return value as ParamFnValue
  if (isParamAudio(value as ParamValue)) return value as ParamAudioValue
  return fallback
}

/** Emite la expresión Hydra para un parámetro (escalar o arrow con time/audio) */
export function emitParamExpression(value: ParamValue | undefined, fallback: number): string {
  const v = value === undefined ? fallback : value
  if (typeof v === "number") {
    return String(Math.round(v * 10000) / 10000)
  }
  if (isParamAudio(v)) {
    const s = Math.round(v.scale * 10000) / 10000
    const o = Math.round(v.offset * 10000) / 10000
    return `() => (a && a.fft && a.fft[${v.bin}] != null ? a.fft[${v.bin}] : 0) * ${s} + ${o}`
  }
  const { shape, freq, amp, offset } = v
  const o = Math.round(offset * 10000) / 10000
  const a = Math.round(amp * 10000) / 10000
  const f = Math.round(freq * 10000) / 10000
  switch (shape) {
    case "sin":
      return `({time}) => ${o} + ${a} * Math.sin(time * ${f})`
    case "cos":
      return `({time}) => ${o} + ${a} * Math.cos(time * ${f})`
    case "tan":
      return `({time}) => ${o} + ${a} * Math.max(-1, Math.min(1, Math.tan(time * ${f})))`
    case "linear":
      return `({time}) => ${o} + ${a} * ((time * ${f}) % 1)`
  }
}
