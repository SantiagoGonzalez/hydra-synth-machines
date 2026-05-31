// Estado global del launchpad: slots de pads, cadena compilada y acciones de performance

import { create } from "zustand"
import { HYDRA_REGISTRY, getFunctionDef, getDefaultParams, type HydraCategory } from "@/lib/hydra-registry"
import { compileChain } from "@/lib/chain-compiler"

export interface ActivePad {
  instanceId: string
  functionId: string
  category: HydraCategory
  params: Record<string, number>
  /** Fuente secundaria seleccionada para funciones de modulaciÃ³n/blend */
  secondarySourceId?: string
  secondaryParams?: Record<string, number>
  mode: "toggle" | "momentary"
  activatedAt: number
}

/** Slot de pad: extiende ActivePad con estado visible (activo/inactivo) y si es extra */
export interface PadSlot extends ActivePad {
  /** true si el slot estÃ¡ encendido y contribuye al chain */
  isActive: boolean
  /** true si fue agregado vÃ­a el pad "+" (puede eliminarse) */
  isExtra: boolean
}

// Inicializa 3 slots por cada funciÃ³n del registro
function initPadSlots(): PadSlot[] {
  return HYDRA_REGISTRY.flatMap((fn) => {
    const secDef = fn.secondarySourceId ? getFunctionDef(fn.secondarySourceId) : undefined
    return Array.from({ length: 1 }, (_, i) => ({
      instanceId: `${fn.id}-${i + 1}`,
      functionId: fn.id,
      category: fn.category,
      params: getDefaultParams(fn),
      secondarySourceId: fn.secondarySourceId,
      secondaryParams: secDef ? getDefaultParams(secDef) : undefined,
      mode: "toggle" as const,
      activatedAt: 0,
      isActive: false,
      isExtra: false,
    }))
  })
}

interface ChainState {
  padSlots: PadSlot[]
  activePads: ActivePad[]
  compiledCode: string
  lastSafeCode: string
  outputBuffer: "o0" | "o1" | "o2" | "o3"

  toggleSlot: (slotId: string) => void
  addSlot: (functionId: string) => void
  removeSlot: (slotId: string) => void
  /** @deprecated usar toggleSlot para toggle; se mantiene para momentary */
  activatePad: (functionId: string, mode?: "toggle" | "momentary") => void
  deactivatePad: (instanceId: string) => void
  /** @deprecated usar toggleSlot */
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

function deriveActivePads(padSlots: PadSlot[]): PadSlot[] {
  return padSlots.filter((s) => s.isActive).sort((a, b) => a.activatedAt - b.activatedAt)
}

export const useChainStore = create<ChainState>((set, get) => ({
  padSlots: initPadSlots(),
  activePads: [],
  compiledCode: "solid(0,0,0).out()",
  lastSafeCode: "solid(0,0,0).out()",
  outputBuffer: "o0",

  // Alterna el estado activo de un slot especÃ­fico por su slotId
  toggleSlot: (slotId) => {
    set((state) => {
      const padSlots = state.padSlots.map((s) =>
        s.instanceId === slotId
          ? { ...s, isActive: !s.isActive, activatedAt: !s.isActive ? Date.now() : s.activatedAt }
          : s
      )
      const activePads = deriveActivePads(padSlots)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { padSlots, activePads, compiledCode }
    })
  },

  // Agrega un nuevo slot extra para la funciÃ³n dada (vÃ­a pad "+")
  addSlot: (functionId) => {
    const def = getFunctionDef(functionId)
    if (!def) return
    const secDef = def.secondarySourceId ? getFunctionDef(def.secondarySourceId) : undefined
    const newSlot: PadSlot = {
      instanceId: `${functionId}-extra-${Date.now()}`,
      functionId,
      category: def.category,
      params: getDefaultParams(def),
      secondarySourceId: def.secondarySourceId,
      secondaryParams: secDef ? getDefaultParams(secDef) : undefined,
      mode: "toggle",
      activatedAt: 0,
      isActive: false,
      isExtra: true,
    }
    set((state) => ({ padSlots: [...state.padSlots, newSlot] }))
  },

  // Elimina un slot extra; valida que no sea el Ãºnico del functionId
  removeSlot: (slotId) => {
    set((state) => {
      const target = state.padSlots.find((s) => s.instanceId === slotId)
      if (!target || !target.isExtra) return state
      const slotsForFn = state.padSlots.filter((s) => s.functionId === target.functionId)
      if (slotsForFn.length <= 1) return state
      const padSlots = state.padSlots.filter((s) => s.instanceId !== slotId)
      const activePads = deriveActivePads(padSlots)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { padSlots, activePads, compiledCode }
    })
  },

  activatePad: (functionId, mode = "toggle") => {
    const def = getFunctionDef(functionId)
    if (!def) return
    const secDef = def.secondarySourceId ? getFunctionDef(def.secondarySourceId) : undefined
    const newSlot: PadSlot = {
      instanceId: `${functionId}-${Date.now()}`,
      functionId,
      category: def.category,
      params: getDefaultParams(def),
      secondarySourceId: def.secondarySourceId,
      secondaryParams: secDef ? getDefaultParams(secDef) : undefined,
      mode,
      activatedAt: Date.now(),
      isActive: true,
      isExtra: true,
    }
    set((state) => {
      const padSlots = [...state.padSlots, newSlot]
      const activePads = deriveActivePads(padSlots)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { padSlots, activePads, compiledCode }
    })
  },

  deactivatePad: (instanceId) => {
    set((state) => {
      const target = state.padSlots.find((s) => s.instanceId === instanceId)
      if (!target) return state
      const padSlots = target.isExtra
        ? state.padSlots.filter((s) => s.instanceId !== instanceId)
        : state.padSlots.map((s) =>
            s.instanceId === instanceId ? { ...s, isActive: false } : s
          )
      const activePads = deriveActivePads(padSlots)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { padSlots, activePads, compiledCode }
    })
  },

  // Mantiene compatibilidad legacy: toggle por functionId (primera instancia encontrada)
  togglePad: (functionId) => {
    const { padSlots } = get()
    const firstSlot = padSlots.find((s) => s.functionId === functionId)
    if (firstSlot) get().toggleSlot(firstSlot.instanceId)
  },

  updateParam: (instanceId, paramName, value) => {
    set((state) => {
      const padSlots = state.padSlots.map((s) =>
        s.instanceId === instanceId ? { ...s, params: { ...s.params, [paramName]: value } } : s
      )
      const activePads = deriveActivePads(padSlots)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { padSlots, activePads, compiledCode }
    })
  },

  // Cambia la fuente secundaria de un pad y reinicia sus parÃ¡metros a los valores por defecto
  updateSecondarySource: (instanceId, sourceId) => {
    set((state) => {
      const secDef = getFunctionDef(sourceId)
      if (!secDef) return state
      const padSlots = state.padSlots.map((s) =>
        s.instanceId === instanceId
          ? { ...s, secondarySourceId: sourceId, secondaryParams: getDefaultParams(secDef) }
          : s
      )
      const activePads = deriveActivePads(padSlots)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { padSlots, activePads, compiledCode }
    })
  },

  // Actualiza un parÃ¡metro de la fuente secundaria de un pad
  updateSecondaryParam: (instanceId, paramName, value) => {
    set((state) => {
      const padSlots = state.padSlots.map((s) =>
        s.instanceId === instanceId
          ? { ...s, secondaryParams: { ...s.secondaryParams, [paramName]: value } }
          : s
      )
      const activePads = deriveActivePads(padSlots)
      const compiledCode = rebuild(activePads, state.outputBuffer)
      return { padSlots, activePads, compiledCode }
    })
  },

  clearAll: () => {
    const safe = "solid(0,0,0).out()"
    set((state) => ({
      padSlots: state.padSlots.map((s) => ({ ...s, isActive: false })),
      activePads: [],
      compiledCode: safe,
    }))
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

  // Restaura el estado del launchpad desde una cadena favorita, mapeando pads a slots
  restoreFromFavorite: (pads) => {
    const { outputBuffer } = get()
    const freshSlots = initPadSlots()
    const now = Date.now()
    const usedSlotIds = new Set<string>()
    const extraSlots: PadSlot[] = []

    pads.forEach((p, i) => {
      const available = freshSlots.find(
        (s) => s.functionId === p.functionId && !usedSlotIds.has(s.instanceId)
      )
      if (available) {
        usedSlotIds.add(available.instanceId)
        available.isActive = true
        available.activatedAt = now + i
        available.params = { ...p.params }
        available.secondarySourceId = p.secondarySourceId
        available.secondaryParams = p.secondaryParams ? { ...p.secondaryParams } : undefined
      } else {
        const def = getFunctionDef(p.functionId)
        if (!def) return
        const secDef = def.secondarySourceId ? getFunctionDef(def.secondarySourceId) : undefined
        extraSlots.push({
          instanceId: `${p.functionId}-extra-${now + i}`,
          functionId: p.functionId,
          category: p.category,
          params: { ...p.params },
          secondarySourceId: p.secondarySourceId,
          secondaryParams: p.secondaryParams ? { ...p.secondaryParams } : undefined,
          mode: "toggle",
          activatedAt: now + i,
          isActive: true,
          isExtra: true,
        })
      }
    })

    const padSlots = [...freshSlots, ...extraSlots]
    const activePads = deriveActivePads(padSlots)
    const compiledCode = rebuild(activePads, outputBuffer)
    set({ padSlots, activePads, compiledCode })
  },
}))

/** Selector: Â¿estÃ¡ algÃºn slot de un functionId activo? */
export function selectIsPadActive(functionId: string) {
  return (state: ChainState) => state.padSlots.some((s) => s.functionId === functionId && s.isActive)
}

/** Selector: obtiene el primer slot activo para un functionId */
export function selectActivePadInstance(functionId: string) {
  return (state: ChainState) => state.activePads.find((p) => p.functionId === functionId)
}
