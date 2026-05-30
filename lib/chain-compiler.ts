// Compilador puro: transforma la lista de pads activos en una cadena de código Hydra válida

import { HYDRA_REGISTRY, getFunctionDef, type HydraFunctionDef } from "@/lib/hydra-registry"
import type { ActivePad } from "@/stores/chain-store"

const SAFE_SOURCE = "solid(0,0,0)"

/** Construye el fragmento de llamada para un pad (sin encadenar) */
function buildCallFragment(pad: ActivePad, def: HydraFunctionDef): string {
  const paramValues = def.params.map((p) => {
    const val = pad.params[p.name] ?? p.default
    // Redondea a 4 decimales para evitar ruido en el preview
    return Math.round(val * 10000) / 10000
  })

  if (def.secondarySourceId) {
    // Usa la fuente secundaria configurada en el pad (o la del registro como fallback)
    const resolvedSourceId = pad.secondarySourceId ?? def.secondarySourceId
    const secDef = getFunctionDef(resolvedSourceId)
    if (secDef) {
      const secParamValues = secDef.params.map((p) => {
        const val = pad.secondaryParams?.[p.name] ?? p.default
        return Math.round(val * 10000) / 10000
      })
      const secCall = secParamValues.length > 0
        ? `${secDef.id}(${secParamValues.join(", ")})`
        : `${secDef.id}()`
      if (paramValues.length > 0) {
        return `${def.id}(${secCall}, ${paramValues.join(", ")})`
      }
      return `${def.id}(${secCall})`
    }
  }

  if (paramValues.length === 0) return `${def.id}()`
  return `${def.id}(${paramValues.join(", ")})`
}

/**
 * Compila la lista de pads activos en una expresión Hydra válida.
 * Garantiza que la cadena comienza con una fuente y termina con .out().
 */
export function compileChain(
  activePads: ActivePad[],
  outputBuffer: "o0" | "o1" | "o2" | "o3" = "o0"
): string {
  if (activePads.length === 0) {
    return `${SAFE_SOURCE}.out()`
  }

  const sorted = [...activePads].sort((a, b) => a.activatedAt - b.activatedAt)

  // Verificar si hay una fuente al inicio; si no, usar safe source
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
      // La fuente inicia la cadena directamente (sin encadenar con punto)
      fragments.push(buildCallFragment(pad, def))
    } else if (def.category === "source") {
      // Una fuente adicional después de la primera actúa como blend/fuente secundaria implícita
      // En v1 la ignoramos para mantener la cadena lineal
      continue
    } else {
      fragments.push(buildCallFragment(pad, def))
    }
  }

  const outArg = outputBuffer === "o0" ? "" : outputBuffer
  const outCall = outArg ? `out(${outArg})` : "out()"

  return fragments.join(".") + "." + outCall
}

/** Reconstruye solo el fragmento visible de un pad para el ChainPreview */
export function buildPadFragment(pad: ActivePad): string {
  const def = getFunctionDef(pad.functionId)
  if (!def) return ""
  return buildCallFragment(pad, def)
}
