// Estado global del launchpad: pads activos, cadena compilada y acciones de performance

import { create } from "zustand"
import { getFunctionDef, getDefaultParams, type HydraCategory } from "@/lib/hydra-registry"
import { compileChain } from "@/lib/chain-compiler"

export interface ActivePad {
  instanceId: string
  functionId: string
  category: HydraCategory
  params: Record<string, number>
  /** Fuente secundaria seleccionada para funciones de modulación/blend */
  secondarySourceId?: string
  secondaryParams?: Record<string, number>
  mode: "toggle" | "momentary"
  activatedAt: number
}

interface ChainState {
  activePads: ActivePad[]
  compiledCode: string
  lastSafeCode: string
  outputBuffer: "o0" | "o1" | "o2" | "o3"

  activatePad: (functionId: string, mode?: "toggle" | "momentary") => void
  deactivatePad: (instanceId: string) => void
  togglePad: (functionId: string) => void
  updateParam: (instanceId: string, paramName: string, value: number) => void
  updateSecondarySource: (instanceId: string, sourceId: string) => void
  updateSecondaryParam: (instanceId: string, paramName: string, value: number) => void
  clearAll: () => void
  setOutputBuffer: (buffer: "o0" | "o1" | "o2" | "o3") => void
  markSafeCode: () => void
  /** Restaura el launchpad completo desde una cadena favorita guardada */
  restoreFromFavorite: (pads: ActivePad[]) => void
}

function rebuild(activePads: ActivePad[], outputBuffer: "o0" | "o1" | "o2" | "o3"): string {
  return compileChain(activePads, outputBuffer)
}

export const useChainStore = create<ChainState>((set, get) => ({
  activePads: [],
  compiledCode: "solid(0,0,0).out()",
  lastSafeCode: "solid(0,0,0).out()",
  outputBuffer: "o0",

  activatePad: (functionId, mode = "toggle") => {
    const def = getFunctionDef(functionId)
    if (!def) return

    const instanceId = `${functionId}-${Date.now()}`
    const secDef = def.secondarySourceId ? getFunctionDef(def.secondarySourceId) : undefined
    const newPad: ActivePad = {
      instanceId,
      functionId,
      category: def.category,
      params: getDefaultParams(def),
      secondarySourceId: def.secondarySourceId,
      secondaryParams: secDef ? getDefaultParams(secDef) : undefined,
      mode,
      activatedAt: Date.now(),
    }

    set((state) => {
      const activePads = [...state.activePads, newPad]
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { activePads, compiledCode }
    })
  },

  deactivatePad: (instanceId) => {
    set((state) => {
      const activePads = state.activePads.filter((p) => p.instanceId !== instanceId)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { activePads, compiledCode }
    })
  },

  // Alterna un pad por functionId (para modo toggle desde la UI del grid)
  togglePad: (functionId) => {
    const { activePads, outputBuffer } = get()
    const existing = activePads.find((p) => p.functionId === functionId)

    if (existing) {
      const updated = activePads.filter((p) => p.functionId !== functionId)
      const compiledCode = rebuild(updated, outputBuffer)
      set({ activePads: updated, compiledCode })
    } else {
      const def = getFunctionDef(functionId)
      if (!def) return

      const secDef = def.secondarySourceId ? getFunctionDef(def.secondarySourceId) : undefined
      const newPad: ActivePad = {
        instanceId: `${functionId}-${Date.now()}`,
        functionId,
        category: def.category,
        params: getDefaultParams(def),
        secondarySourceId: def.secondarySourceId,
        secondaryParams: secDef ? getDefaultParams(secDef) : undefined,
        mode: "toggle",
        activatedAt: Date.now(),
      }
      const updated = [...activePads, newPad]
      const compiledCode = rebuild(updated, outputBuffer)
      set({ activePads: updated, compiledCode })
    }
  },

  updateParam: (instanceId, paramName, value) => {
    set((state) => {
      const activePads = state.activePads.map((p) =>
        p.instanceId === instanceId ? { ...p, params: { ...p.params, [paramName]: value } } : p
      )
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { activePads, compiledCode }
    })
  },

  // Cambia la fuente secundaria de un pad y reinicia sus parámetros a los valores por defecto
  updateSecondarySource: (instanceId, sourceId) => {
    set((state) => {
      const secDef = getFunctionDef(sourceId)
      if (!secDef) return state
      const activePads = state.activePads.map((p) =>
        p.instanceId === instanceId
          ? { ...p, secondarySourceId: sourceId, secondaryParams: getDefaultParams(secDef) }
          : p
      )
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { activePads, compiledCode }
    })
  },

  // Actualiza un parámetro de la fuente secundaria de un pad
  updateSecondaryParam: (instanceId, paramName, value) => {
    set((state) => {
      const activePads = state.activePads.map((p) =>
        p.instanceId === instanceId
          ? { ...p, secondaryParams: { ...p.secondaryParams, [paramName]: value } }
          : p
      )
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { activePads, compiledCode }
    })
  },

  clearAll: () => {
    const safe = "solid(0,0,0).out()"
    set({ activePads: [], compiledCode: safe })
  },

  setOutputBuffer: (buffer) => {
    set((state) => {
      const compiledCode = rebuild(state.activePads, buffer)
      return { outputBuffer: buffer, compiledCode }
    })
  },

  markSafeCode: () => {
    set((state) => ({ lastSafeCode: state.compiledCode }))
  },

  // Restaura el estado del launchpad desde una cadena favorita, regenerando instanceIds
  restoreFromFavorite: (pads) => {
    const { outputBuffer } = get()
    const now = Date.now()
    const restored: ActivePad[] = pads.map((p, i) => ({
      ...p,
      instanceId: `${p.functionId}-${now + i}`,
      activatedAt: now + i,
      mode: "toggle" as const,
    }))
    const compiledCode = rebuild(restored, outputBuffer)
    set({ activePads: restored, compiledCode })
  },
}))

/** Selector: ¿está un functionId activo en algún pad? */
export function selectIsPadActive(functionId: string) {
  return (state: ChainState) => state.activePads.some((p) => p.functionId === functionId)
}

/** Selector: obtiene el instanceId del pad activo para un functionId */
export function selectActivePadInstance(functionId: string) {
  return (state: ChainState) => state.activePads.find((p) => p.functionId === functionId)
}
