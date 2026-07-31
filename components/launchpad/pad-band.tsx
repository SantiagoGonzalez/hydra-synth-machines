"use client"

// Banda inferior de pads: tabs por categoría, grilla 8×2 y controles globales

import { useState, useCallback, useMemo, useRef } from "react"
import { Trash2, Shuffle } from "lucide-react"
import { CATEGORIES, type HydraCategory } from "@/lib/hydra-registry"
import { useChainStore } from "@/stores/chain-store"
import { orderPadSlotsForCategory } from "@/lib/pad-grid-order"
import { PadTabBar } from "@/components/launchpad/pad-tab-bar"
import { PadGrid } from "@/components/launchpad/pad-grid"
import { useLaunchpadKeys } from "@/hooks/use-launchpad-keys"

export function PadBand() {
  const padSlots = useChainStore((s) => s.padSlots)
  const toggleSlot = useChainStore((s) => s.toggleSlot)
  const addSlot = useChainStore((s) => s.addSlot)
  const removeSlot = useChainStore((s) => s.removeSlot)
  const holdSlot = useChainStore((s) => s.holdSlot)
  const releaseSlot = useChainStore((s) => s.releaseSlot)
  const clearAll = useChainStore((s) => s.clearAll)
  const selectSlot = useChainStore((s) => s.selectSlot)
  const armSlot = useChainStore((s) => s.armSlot)
  const disarmSlot = useChainStore((s) => s.disarmSlot)
  const applyArmedSlot = useChainStore((s) => s.applyArmedSlot)
  const setEditingOutput = useChainStore((s) => s.setEditingOutput)
  const gridView = useChainStore((s) => s.gridView)
  const setGridView = useChainStore((s) => s.setGridView)
  const armedSlotId = useChainStore((s) => s.armedSlotId)
  const selectedSlotId = useChainStore((s) => s.selectedSlotId)
  const focusZone = useChainStore((s) => s.focusZone)
  const focusedControlId = useChainStore((s) => s.focusedControlId)
  const sourceDraftId = useChainStore((s) => s.sourceDraftId)
  const setFocusZone = useChainStore((s) => s.setFocusZone)
  const moveFocusedControl = useChainStore((s) => s.moveFocusedControl)
  const nudgeFocusedControl = useChainStore((s) => s.nudgeFocusedControl)
  const cycleChainPad = useChainStore((s) => s.cycleChainPad)
  const selectChainPosition = useChainStore((s) => s.selectChainPosition)
  const toggleFocusedParamMode = useChainStore((s) => s.toggleFocusedParamMode)
  const cycleFocusedFnShape = useChainStore((s) => s.cycleFocusedFnShape)
  const focusSourceControl = useChainStore((s) => s.focusSourceControl)
  const toggleDetailBypass = useChainStore((s) => s.toggleDetailBypass)
  const applySourceDraft = useChainStore((s) => s.applySourceDraft)
  const randomizePatch = useChainStore((s) => s.randomizePatch)

  const [activeCategory, setActiveCategory] = useState<HydraCategory>("source")
  const [isAddPadOpen, setIsAddPadOpen] = useState(false)
  const [undoFlash, setUndoFlash] = useState(false)
  const undoFlashTimerRef = useRef<number | null>(null)

  const orderedSlots = useMemo(
    () => orderPadSlotsForCategory(padSlots, activeCategory),
    [padSlots, activeCategory]
  )

  const handleCategoryChange = useCallback((category: HydraCategory) => {
    setIsAddPadOpen(false)
    setActiveCategory(category)
  }, [])

  const handleToggleSlot = useCallback(
    (slotId: string) => {
      toggleSlot(slotId)
      selectSlot(slotId)
    },
    [toggleSlot, selectSlot]
  )

  const handleSelectSlot = useCallback(
    (slotId: string) => {
      selectSlot(slotId)
    },
    [selectSlot]
  )

  const handleToggleArm = useCallback(
    (slot: (typeof orderedSlots)[number]) => {
      if (armedSlotId === slot.instanceId) {
        disarmSlot()
      } else if (!slot.isActive) {
        armSlot(slot.instanceId)
      }
    },
    [armedSlotId, armSlot, disarmSlot]
  )

  const handleRemoveSelected = useCallback(() => {
    if (selectedSlotId) removeSlot(selectedSlotId)
  }, [removeSlot, selectedSlotId])

  const handleAddPadOpenChange = useCallback(
    (open: boolean) => {
      setIsAddPadOpen(open)
      if (!open) {
        setFocusZone("pads")
        window.requestAnimationFrame(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        })
      }
    },
    [setFocusZone]
  )

  const handleToggleGridView = useCallback(() => {
    setGridView(!gridView)
  }, [gridView, setGridView])

  const handleEditFocusedControl = useCallback(() => {
    const { focusZone, focusedControlId } = useChainStore.getState()
    if (focusZone !== "params" || !focusedControlId) return
    const input = document.querySelector(
      `[data-control-id="${focusedControlId}"] input`
    ) as HTMLInputElement | null
    if (!input) return
    input.focus()
    input.select()
  }, [])

  const handleUndo = useCallback(() => {
    const { history, undo } = useChainStore.getState()
    if (history.length === 0) return
    undo()
    setUndoFlash(true)
    if (undoFlashTimerRef.current !== null) {
      window.clearTimeout(undoFlashTimerRef.current)
    }
    undoFlashTimerRef.current = window.setTimeout(() => {
      setUndoFlash(false)
      undoFlashTimerRef.current = null
    }, 1200)
  }, [])

  useLaunchpadKeys({
    orderedSlots,
    focusZone,
    onTabChange: handleCategoryChange,
    onOutputChange: setEditingOutput,
    onToggleGridView: handleToggleGridView,
    onOpenAddPad: () => setIsAddPadOpen(true),
    onToggleSlot: handleToggleSlot,
    onSelectSlot: handleSelectSlot,
    onToggleArm: handleToggleArm,
    onMomentaryStart: holdSlot,
    onMomentaryEnd: releaseSlot,
    onApplyArmed: applyArmedSlot,
    onApplySourceDraft: applySourceDraft,
    isSourceFocused: focusedControlId?.startsWith("source:") ?? false,
    hasSourceDraft: sourceDraftId !== null,
    onDisarm: disarmSlot,
    onRemoveSelected: handleRemoveSelected,
    onFocusParams: () => setFocusZone("params"),
    onFocusPads: () => setFocusZone("pads"),
    onMoveFocusedControl: moveFocusedControl,
    onNudgeFocusedControl: nudgeFocusedControl,
    onCycleChainPad: cycleChainPad,
    onSelectChainPosition: selectChainPosition,
    onToggleFocusedParamMode: toggleFocusedParamMode,
    onCycleFocusedFnShape: cycleFocusedFnShape,
    onFocusSourceControl: focusSourceControl,
    onToggleDetailBypass: toggleDetailBypass,
    onCopyChain: () => {
      navigator.clipboard
        .writeText(useChainStore.getState().compiledCode)
        .catch(() => {})
    },
    onRandomize: randomizePatch,
    onEditFocusedControl: handleEditFocusedControl,
    onUndo: handleUndo,
  })

  return (
    <section className="min-h-0 flex flex-col border-t border-white/5 bg-black/40">
      <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 border-b border-white/5">
        <PadTabBar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
        <div className="flex items-center gap-1 shrink-0">
          {undoFlash && (
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider px-1">
              Undone
            </span>
          )}
          <button
            type="button"
            onClick={randomizePatch}
            title="Random patch (C)"
            className="p-1.5 rounded border border-white/10 text-white/30 hover:border-white/30 hover:text-white/60 transition-colors"
          >
            <Shuffle className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={clearAll}
            title="Clear all"
            className="p-1.5 rounded border border-white/10 text-white/30 hover:border-red-500/40 hover:text-red-400/60 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {CATEGORIES.map((cat) =>
          cat === activeCategory ? (
            <PadGrid
              key={cat}
              category={cat}
              onToggleSlot={handleToggleSlot}
              onSelectSlot={handleSelectSlot}
              onArmSlot={armSlot}
              onDisarmSlot={disarmSlot}
              onApplyArmed={applyArmedSlot}
              onRemoveSlot={removeSlot}
              onAddSlot={addSlot}
              isAddPadOpen={isAddPadOpen}
              onAddPadOpenChange={handleAddPadOpenChange}
              onMomentaryStart={holdSlot}
              onMomentaryEnd={releaseSlot}
            />
          ) : null
        )}
      </div>
    </section>
  )
}
