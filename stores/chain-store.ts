// Estado global del launchpad: pads activos, cadena compilada y acciones de performance

import { create } from "zustand"
import { getFunctionDef, getDefaultParams, type HydraCategory } from "@/lib/hydra-registry"
import { compileChain } from "@/lib/chain-compiler"

export interface ActivePad {
  instanceId: string
  functionId: string
  category: HydraCategory
  params: Record<string, number>
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
  clearAll: () => void
  setOutputBuffer: (buffer: "o0" | "o1" | "o2" | "o3") => void
  markSafeCode: () => void
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
    const newPad: ActivePad = {
      instanceId,
      functionId,
      category: def.category,
      params: getDefaultParams(def),
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

      const newPad: ActivePad = {
        instanceId: `${functionId}-${Date.now()}`,
        functionId,
        category: def.category,
        params: getDefaultParams(def),
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
}))

/** Selector: ¿está un functionId activo en algún pad? */
export function selectIsPadActive(functionId: string) {
  return (state: ChainState) => state.activePads.some((p) => p.functionId === functionId)
}

/** Selector: obtiene el instanceId del pad activo para un functionId */
export function selectActivePadInstance(functionId: string) {
  return (state: ChainState) => state.activePads.find((p) => p.functionId === functionId)
}
