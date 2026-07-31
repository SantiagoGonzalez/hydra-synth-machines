// Compilador puro: transforma pads activos en código Hydra válido (multi-output y ParamValue)

import { HYDRA_REGISTRY, getFunctionDef, type HydraFunctionDef } from "@/lib/hydra-registry"
import { emitParamExpression, type ParamValue } from "@/lib/param-value"
import type { ActivePad } from "@/stores/chain-store"

export type OutputBuffer = "o0" | "o1" | "o2" | "o3"
export const OUTPUT_BUFFERS: OutputBuffer[] = ["o0", "o1", "o2", "o3"]

export const EMPTY_CODE = "solid(0,0,0).out()"
const SAFE_SOURCE = "solid(0,0,0)"

/** True si algún pad audible usa src(oN) del buffer dado (feedback loop) */
export function chainUsesBufferFeedback(pads: ActivePad[], buffer: OutputBuffer): boolean {
  const srcId = `src:${buffer}`
  return pads.some((pad) => {
    if (pad.isBypassed) return false
    const def = getFunctionDef(pad.functionId)
    const resolved = pad.secondarySourceId ?? def?.secondarySourceId
    return resolved === srcId
  })
}

/** Resuelve el fragmento de fuente secundaria (función o src(oN)) */
function buildSecondarySourceFragment(pad: ActivePad, fallbackId: string): string | null {
  const resolvedSourceId = pad.secondarySourceId ?? fallbackId

  const bufferMatch = resolvedSourceId.match(/^src:(o[0-3])$/)
  if (bufferMatch) {
    return `src(${bufferMatch[1]})`
  }

  const secDef = getFunctionDef(resolvedSourceId)
  if (!secDef) return null

  const secParamValues = secDef.params.map((p) => {
    const val = pad.secondaryParams?.[p.name] ?? p.default
    return emitParamExpression(val as ParamValue | undefined, p.default)
  })
  return secParamValues.length > 0 ? `${secDef.id}(${secParamValues.join(", ")})` : `${secDef.id}()`
}

/** Expande modulateScroll al par real de Hydra: modulateScrollX + modulateScrollY */
function buildModulateScrollFragment(pad: ActivePad, def: HydraFunctionDef): string | null {
  if (!def.secondarySourceId) return null

  const secCall = buildSecondarySourceFragment(pad, def.secondarySourceId)
  if (!secCall) return null

  const param = (name: string, fallback: number) =>
    emitParamExpression(
      (pad.params[name] ?? fallback) as ParamValue | undefined,
      fallback
    )

  const scrollX = param("scrollX", 0.5)
  const scrollY = param("scrollY", 0.5)
  const speedX = param("speedX", 0)
  const speedY = param("speedY", 0)

  return `modulateScrollX(${secCall}, ${scrollX}, ${speedX}).modulateScrollY(${secCall}, ${scrollY}, ${speedY})`
}

/** Construye el fragmento de llamada para un pad (sin encadenar) */
function buildCallFragment(pad: ActivePad, def: HydraFunctionDef): string {
  if (def.id === "modulateScroll") {
    return buildModulateScrollFragment(pad, def) ?? `${def.id}()`
  }

  const paramValues = def.params.map((p) => {
    const val = pad.params[p.name] ?? p.default
    return emitParamExpression(val as ParamValue | undefined, p.default)
  })

  if (def.secondarySourceId) {
    const secCall = buildSecondarySourceFragment(pad, def.secondarySourceId)
    if (secCall) {
      if (paramValues.length > 0) {
        return `${def.id}(${secCall}, ${paramValues.join(", ")})`
      }
      return `${def.id}(${secCall})`
    }
  }

  if (paramValues.length === 0) return `${def.id}()`
  return `${def.id}(${paramValues.join(", ")})`
}

/** Compila pads activos hacia un buffer concreto (.out() o .out(oN)) */
export function compileChainToBuffer(
  activePads: ActivePad[],
  outputBuffer: OutputBuffer,
  feedback = 0
): string | null {
  // Bypass: los pads bypasseados conservan posición/params pero no emiten fragmento
  const audiblePads = activePads.filter((p) => !p.isBypassed)
  if (audiblePads.length === 0) return null

  const sorted = [...audiblePads].sort((a, b) => a.activatedAt - b.activatedAt)
  const firstDef = getFunctionDef(sorted[0].functionId)
  const hasSourceFirst = firstDef?.category === "source"
  const fragments: string[] = []

  if (!hasSourceFirst) {
    fragments.push(SAFE_SOURCE)
  }

  for (const pad of sorted) {
    const def = getFunctionDef(pad.functionId)
    if (!def) continue

    if (def.category === "source" && fragments.length === 0) {
      fragments.push(buildCallFragment(pad, def))
    } else if (def.category === "source") {
      continue
    } else {
      fragments.push(buildCallFragment(pad, def))
    }
  }

  if (feedback > 0 && chainUsesBufferFeedback(audiblePads, outputBuffer)) {
    fragments.push(`blend(${outputBuffer}, ${feedback})`)
  }

  const outCall = outputBuffer === "o0" ? "out()" : `out(${outputBuffer})`
  return fragments.join(".") + "." + outCall
}

/**
 * Compila la lista de pads activos en una expresión Hydra válida (un solo output).
 * Garantiza que la cadena comienza con una fuente y termina con .out().
 */
export function compileChain(
  activePads: ActivePad[],
  outputBuffer: OutputBuffer = "o0",
  feedback = 0
): string {
  if (activePads.length === 0) {
    return EMPTY_CODE
  }
  return compileChainToBuffer(activePads, outputBuffer, feedback) ?? EMPTY_CODE
}

export interface CompileMultiOptions {
  gridView?: boolean
  focusOutput?: OutputBuffer
  feedback?: number
}

/**
 * Compila todas las cadenas por buffer y añade render() o render(oN).
 * Emite un bloque por output con contenido.
 */
export function compileMultiChain(
  chainsByOutput: Record<OutputBuffer, ActivePad[]>,
  options: CompileMultiOptions = {}
): string {
  const { gridView = false, focusOutput = "o0", feedback = 0 } = options
  const blocks: string[] = []

  for (const buf of OUTPUT_BUFFERS) {
    const block = compileChainToBuffer(chainsByOutput[buf], buf, feedback)
    if (block) blocks.push(block)
  }

  if (blocks.length === 0) {
    return EMPTY_CODE
  }

  if (gridView) {
    blocks.push("render()")
  } else {
    blocks.push(`render(${focusOutput})`)
  }

  return blocks.join("\n")
}

/** Reconstruye solo el fragmento visible de un pad para el ChainPreview */
export function buildPadFragment(pad: ActivePad): string {
  const def = getFunctionDef(pad.functionId)
  if (!def) return ""
  return buildCallFragment(pad, def)
}
