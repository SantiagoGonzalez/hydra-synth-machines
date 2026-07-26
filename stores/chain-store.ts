// Estado global del launchpad: slots por output, cadena compilada, staging y acciones

import { create } from "zustand"
import { HYDRA_REGISTRY, getFunctionDef, getDefaultParams, type HydraCategory } from "@/lib/hydra-registry"
import {
  compileMultiChain,
  compileChain,
  type OutputBuffer,
  OUTPUT_BUFFERS,
} from "@/lib/chain-compiler"
import { normalizeParamValue, type ParamValue } from "@/lib/param-value"

export type { OutputBuffer }

export interface ActivePad {
  instanceId: string
  functionId: string
  category: HydraCategory
  params: Record<string, ParamValue>
  secondarySourceId?: string
  secondaryParams?: Record<string, ParamValue>
  activatedAt: number
  /** Bypass: el pad sigue en la cadena (posición y params) pero el compilador lo saltea */
  isBypassed?: boolean
}

/** Slot de pad: extiende ActivePad con estado visible (activo/inactivo) y si es extra */
export interface PadSlot extends ActivePad {
  isActive: boolean
  isExtra: boolean
}

export interface OutputChain {
  padSlots: PadSlot[]
  activePads: ActivePad[]
}

const EMPTY_CODE = "solid(0,0,0).out()"

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
      activatedAt: 0,
      isActive: false,
      isExtra: false,
    }))
  })
}

function initChains(): Record<OutputBuffer, OutputChain> {
  return {
    o0: { padSlots: initPadSlots(), activePads: [] },
    o1: { padSlots: initPadSlots(), activePads: [] },
    o2: { padSlots: initPadSlots(), activePads: [] },
    o3: { padSlots: initPadSlots(), activePads: [] },
  }
}

function deriveActivePads(padSlots: PadSlot[]): ActivePad[] {
  return padSlots.filter((s) => s.isActive).sort((a, b) => a.activatedAt - b.activatedAt)
}

function rebuildCompiled(
  chains: Record<OutputBuffer, OutputChain>,
  gridView: boolean,
  editingOutput: OutputBuffer
): string {
  const byOutput = Object.fromEntries(
    OUTPUT_BUFFERS.map((buf) => [buf, chains[buf].activePads])
  ) as Record<OutputBuffer, ActivePad[]>
  return compileMultiChain(byOutput, { gridView, focusOutput: editingOutput })
}

function computePreviewCode(
  chains: Record<OutputBuffer, OutputChain>,
  editingOutput: OutputBuffer,
  armedSlotId: string | null,
  gridView: boolean
): string | null {
  if (!armedSlotId) return null
  const chain = chains[editingOutput]
  const armed = chain.padSlots.find((s) => s.instanceId === armedSlotId)
  if (!armed) return null
  const previewPads = [...chain.activePads, armed]
  const byOutput = Object.fromEntries(
    OUTPUT_BUFFERS.map((buf) => [
      buf,
      buf === editingOutput ? previewPads : chains[buf].activePads,
    ])
  ) as Record<OutputBuffer, ActivePad[]>
  return compileMultiChain(byOutput, { gridView, focusOutput: editingOutput })
}

function syncEditingView(
  chains: Record<OutputBuffer, OutputChain>,
  editingOutput: OutputBuffer,
  armedSlotId: string | null,
  gridView: boolean
) {
  const chain = chains[editingOutput]
  const compiledCode = rebuildCompiled(chains, gridView, editingOutput)
  const previewCode = computePreviewCode(chains, editingOutput, armedSlotId, gridView)
  return {
    padSlots: chain.padSlots,
    activePads: chain.activePads,
    compiledCode,
    previewCode,
  }
}

function updateChain(
  chains: Record<OutputBuffer, OutputChain>,
  editingOutput: OutputBuffer,
  updater: (chain: OutputChain) => OutputChain,
  armedSlotId: string | null,
  gridView: boolean
) {
  const updatedChain = updater(chains[editingOutput])
  const nextChains = { ...chains, [editingOutput]: updatedChain }
  return { chains: nextChains, ...syncEditingView(nextChains, editingOutput, armedSlotId, gridView) }
}

interface ChainState {
  chains: Record<OutputBuffer, OutputChain>
  editingOutput: OutputBuffer
  gridView: boolean
  padSlots: PadSlot[]
  activePads: ActivePad[]
  compiledCode: string
  previewCode: string | null
  lastSafeCode: string
  armedSlotId: string | null
  selectedSlotId: string | null
  momentarySlotId: string | null

  toggleSlot: (slotId: string) => void
  selectSlot: (slotId: string | null) => void
  addSlot: (functionId: string) => void
  removeSlot: (slotId: string) => void
  holdSlot: (slotId: string) => void
  releaseSlot: (slotId: string) => void
  togglePad: (functionId: string) => void
  toggleBypass: (instanceId: string) => void
  updateParam: (instanceId: string, paramName: string, value: ParamValue) => void
  updateSecondarySource: (instanceId: string, sourceId: string) => void
  updateSecondaryParam: (instanceId: string, paramName: string, value: ParamValue) => void
  clearAll: () => void
  setEditingOutput: (buffer: OutputBuffer) => void
  setGridView: (gridView: boolean) => void
  armSlot: (slotId: string) => void
  disarmSlot: () => void
  applyArmedSlot: () => void
  markSafeCode: () => void
  restoreFromFavorite: (input: Partial<Record<OutputBuffer, ActivePad[]>> | ActivePad[]) => void
}

export const useChainStore = create<ChainState>((set, get) => ({
  chains: initChains(),
  editingOutput: "o0",
  gridView: false,
  padSlots: initPadSlots(),
  activePads: [],
  compiledCode: EMPTY_CODE,
  previewCode: null,
  lastSafeCode: EMPTY_CODE,
  armedSlotId: null,
  selectedSlotId: null,
  momentarySlotId: null,

  selectSlot: (slotId) => {
    set({ selectedSlotId: slotId })
  },

  toggleSlot: (slotId) => {
    set((state) =>
      updateChain(state.chains, state.editingOutput, (chain) => {
        const padSlots = chain.padSlots.map((s) =>
          s.instanceId === slotId
            ? {
                ...s,
                isActive: !s.isActive,
                activatedAt: !s.isActive ? Date.now() : s.activatedAt,
                isBypassed: s.isActive ? false : s.isBypassed,
              }
            : s
        )
        return { padSlots, activePads: deriveActivePads(padSlots) }
      }, state.armedSlotId, state.gridView)
    )
  },

  toggleBypass: (instanceId) => {
    set((state) =>
      updateChain(state.chains, state.editingOutput, (chain) => {
        const padSlots = chain.padSlots.map((s) =>
          s.instanceId === instanceId ? { ...s, isBypassed: !s.isBypassed } : s
        )
        return { padSlots, activePads: deriveActivePads(padSlots) }
      }, state.armedSlotId, state.gridView)
    )
  },

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
      activatedAt: 0,
      isActive: false,
      isExtra: true,
    }
    set((state) =>
      updateChain(state.chains, state.editingOutput, (chain) => ({
        padSlots: [...chain.padSlots, newSlot],
        activePads: chain.activePads,
      }), state.armedSlotId, state.gridView)
    )
  },

  removeSlot: (slotId) => {
    set((state) => {
      const chain = state.chains[state.editingOutput]
      const target = chain.padSlots.find((s) => s.instanceId === slotId)
      if (!target || !target.isExtra) return state
      const slotsForFn = chain.padSlots.filter((s) => s.functionId === target.functionId)
      if (slotsForFn.length <= 1) return state

      const result = updateChain(
        state.chains,
        state.editingOutput,
        (c) => {
          const padSlots = c.padSlots.filter((s) => s.instanceId !== slotId)
          return { padSlots, activePads: deriveActivePads(padSlots) }
        },
        state.armedSlotId === slotId ? null : state.armedSlotId,
        state.gridView
      )
      const selectedSlotId = state.selectedSlotId === slotId ? null : state.selectedSlotId
      const armedSlotId = state.armedSlotId === slotId ? null : state.armedSlotId
      return { ...result, selectedSlotId, armedSlotId }
    })
  },

  // Momentary: holdSlot activa el slot presionado al final de la cadena sin crear slots extra
  holdSlot: (slotId) => {
    set((state) => {
      const chain = state.chains[state.editingOutput]
      const slot = chain.padSlots.find((s) => s.instanceId === slotId)
      if (!slot || slot.isActive) return state
      const result = updateChain(
        state.chains,
        state.editingOutput,
        (c) => {
          const padSlots = c.padSlots.map((s) =>
            s.instanceId === slotId ? { ...s, isActive: true, activatedAt: Date.now() } : s
          )
          return { padSlots, activePads: deriveActivePads(padSlots) }
        },
        state.armedSlotId,
        state.gridView
      )
      return { ...result, momentarySlotId: slotId, selectedSlotId: slotId }
    })
  },

  // Momentary: releaseSlot apaga el slot solo si fue activado por holdSlot
  releaseSlot: (slotId) => {
    set((state) => {
      if (state.momentarySlotId !== slotId) return state
      const result = updateChain(
        state.chains,
        state.editingOutput,
        (c) => {
          const padSlots = c.padSlots.map((s) =>
            s.instanceId === slotId ? { ...s, isActive: false, isBypassed: false } : s
          )
          return { padSlots, activePads: deriveActivePads(padSlots) }
        },
        state.armedSlotId,
        state.gridView
      )
      return { ...result, momentarySlotId: null }
    })
  },

  togglePad: (functionId) => {
    const { padSlots } = get()
    const firstSlot = padSlots.find((s) => s.functionId === functionId)
    if (firstSlot) get().toggleSlot(firstSlot.instanceId)
  },

  updateParam: (instanceId, paramName, value) => {
    set((state) =>
      updateChain(state.chains, state.editingOutput, (chain) => {
        const padSlots = chain.padSlots.map((s) =>
          s.instanceId === instanceId ? { ...s, params: { ...s.params, [paramName]: value } } : s
        )
        return { padSlots, activePads: deriveActivePads(padSlots) }
      }, state.armedSlotId, state.gridView)
    )
  },

  updateSecondarySource: (instanceId, sourceId) => {
    set((state) => {
      const secDef = getFunctionDef(sourceId)
      if (!secDef && !sourceId.startsWith("src:")) return state
      const defaults = secDef ? getDefaultParams(secDef) : {}
      return updateChain(
        state.chains,
        state.editingOutput,
        (chain) => {
          const padSlots = chain.padSlots.map((s) =>
            s.instanceId === instanceId
              ? { ...s, secondarySourceId: sourceId, secondaryParams: defaults }
              : s
          )
          return { padSlots, activePads: deriveActivePads(padSlots) }
        },
        state.armedSlotId,
        state.gridView
      )
    })
  },

  updateSecondaryParam: (instanceId, paramName, value) => {
    set((state) =>
      updateChain(state.chains, state.editingOutput, (chain) => {
        const padSlots = chain.padSlots.map((s) =>
          s.instanceId === instanceId
            ? { ...s, secondaryParams: { ...s.secondaryParams, [paramName]: value } }
            : s
        )
        return { padSlots, activePads: deriveActivePads(padSlots) }
      }, state.armedSlotId, state.gridView)
    )
  },

  clearAll: () => {
    set((state) => {
      const chain = state.chains[state.editingOutput]
      const nextChain = {
        ...chain,
        padSlots: chain.padSlots.map((s) => ({ ...s, isActive: false, isBypassed: false })),
        activePads: [] as ActivePad[],
      }
      const nextChains = { ...state.chains, [state.editingOutput]: nextChain }
      return {
        chains: nextChains,
        ...syncEditingView(nextChains, state.editingOutput, null, state.gridView),
        armedSlotId: null,
        selectedSlotId: null,
        momentarySlotId: null,
      }
    })
  },

  setEditingOutput: (buffer) => {
    set((state) => ({
      editingOutput: buffer,
      armedSlotId: null,
      selectedSlotId: null,
      momentarySlotId: null,
      ...syncEditingView(state.chains, buffer, null, state.gridView),
    }))
  },

  setGridView: (gridView) => {
    set((state) => ({
      gridView,
      ...syncEditingView(state.chains, state.editingOutput, state.armedSlotId, gridView),
    }))
  },

  armSlot: (slotId) => {
    set((state) => {
      const chain = state.chains[state.editingOutput]
      const slot = chain.padSlots.find((s) => s.instanceId === slotId)
      if (!slot || slot.isActive) return state
      return {
        armedSlotId: slotId,
        selectedSlotId: slotId,
        ...syncEditingView(state.chains, state.editingOutput, slotId, state.gridView),
      }
    })
  },

  disarmSlot: () => {
    set((state) => ({
      armedSlotId: null,
      ...syncEditingView(state.chains, state.editingOutput, null, state.gridView),
    }))
  },

  applyArmedSlot: () => {
    const { armedSlotId, editingOutput } = get()
    if (!armedSlotId) return
    set((state) => {
      const result = updateChain(
        state.chains,
        editingOutput,
        (chain) => {
          const padSlots = chain.padSlots.map((s) =>
            s.instanceId === armedSlotId
              ? { ...s, isActive: true, activatedAt: Date.now() }
              : s
          )
          return { padSlots, activePads: deriveActivePads(padSlots) }
        },
        null,
        state.gridView
      )
      return { ...result, armedSlotId: null, selectedSlotId: armedSlotId }
    })
  },

  markSafeCode: () => {
    set((state) => ({ lastSafeCode: state.compiledCode }))
  },

  restoreFromFavorite: (input) => {
    const chainsInput: Partial<Record<OutputBuffer, ActivePad[]>> = Array.isArray(input)
      ? { o0: input }
      : input
    const { editingOutput, gridView } = get()
    const nextChains = initChains()
    const now = Date.now()

    for (const buf of OUTPUT_BUFFERS) {
      const pads = chainsInput[buf] ?? []

      const freshSlots = initPadSlots()
      const usedSlotIds = new Set<string>()
      const extraSlots: PadSlot[] = []

      pads.forEach((p, i) => {
        const normalizedParams = Object.fromEntries(
          Object.entries(p.params).map(([k, v]) => {
            const def = getFunctionDef(p.functionId)
            const fallback = def?.params.find((pp) => pp.name === k)?.default ?? 0
            return [k, normalizeParamValue(v, fallback)]
          })
        )
        const normalizedSecondary = p.secondaryParams
          ? Object.fromEntries(
              Object.entries(p.secondaryParams).map(([k, v]) => [k, normalizeParamValue(v, 0)])
            )
          : undefined

        const available = freshSlots.find(
          (s) => s.functionId === p.functionId && !usedSlotIds.has(s.instanceId)
        )
        if (available) {
          usedSlotIds.add(available.instanceId)
          available.isActive = true
          available.activatedAt = now + i
          available.params = normalizedParams
          available.secondarySourceId = p.secondarySourceId
          available.secondaryParams = normalizedSecondary
          available.isBypassed = p.isBypassed
        } else {
          const def = getFunctionDef(p.functionId)
          if (!def) return
          extraSlots.push({
            instanceId: `${p.functionId}-extra-${now + i}`,
            functionId: p.functionId,
            category: p.category,
            params: normalizedParams,
            secondarySourceId: p.secondarySourceId,
            secondaryParams: normalizedSecondary,
            activatedAt: now + i,
            isBypassed: p.isBypassed,
            isActive: true,
            isExtra: true,
          })
        }
      })

      nextChains[buf] = {
        padSlots: [...freshSlots, ...extraSlots],
        activePads: deriveActivePads([...freshSlots, ...extraSlots]),
      }
    }

    set({
      chains: nextChains,
      armedSlotId: null,
      selectedSlotId: null,
      momentarySlotId: null,
      ...syncEditingView(nextChains, editingOutput, null, gridView),
    })
  },
}))

export function selectMostRecentActivePad(state: ChainState) {
  if (state.activePads.length === 0) return null
  return [...state.activePads].sort((a, b) => b.activatedAt - a.activatedAt)[0]
}

/** Selector: slot a mostrar en el panel de detalle (armed > selected > reciente) */
export function selectDetailPad(state: ChainState): ActivePad | null {
  if (state.armedSlotId) {
    const armed = state.padSlots.find((s) => s.instanceId === state.armedSlotId)
    if (armed) return armed
  }
  if (state.selectedSlotId) {
    const slot = state.padSlots.find((s) => s.instanceId === state.selectedSlotId)
    if (slot) return slot
  }
  return selectMostRecentActivePad(state)
}

export function selectIsPadActive(functionId: string) {
  return (state: ChainState) => state.padSlots.some((s) => s.functionId === functionId && s.isActive)
}

export function selectActivePadInstance(functionId: string) {
  return (state: ChainState) => state.activePads.find((p) => p.functionId === functionId)
}

/** Mapa instanceId → posición en cadena (1-based), solo pads activos */
export function selectChainPositionMap(state: ChainState): Map<string, number> {
  const map = new Map<string, number>()
  ;[...state.activePads]
    .sort((a, b) => a.activatedAt - b.activatedAt)
    .forEach((pad, i) => map.set(pad.instanceId, i + 1))
  return map
}

/** Snapshot de todas las cadenas activas para favoritos v2 */
export function selectAllChainsSnapshot(state: ChainState): Record<OutputBuffer, ActivePad[]> {
  return Object.fromEntries(
    OUTPUT_BUFFERS.map((buf) => [buf, state.chains[buf].activePads])
  ) as Record<OutputBuffer, ActivePad[]>
}

/** Compat legacy: solo cadena o0 para restore v1 */
export function compileChainLegacy(activePads: ActivePad[], outputBuffer: OutputBuffer = "o0"): string {
  return compileChain(activePads, outputBuffer)
}
