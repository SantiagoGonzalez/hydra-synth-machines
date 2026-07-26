"use client"

// Grilla fija 8×2 de pads por categoría con placeholders y celda de agregar

import { useMemo, useCallback } from "react"
import {
  getRegistryByCategory,
  getFunctionDef,
  type HydraCategory,
} from "@/lib/hydra-registry"
import { useChainStore, type PadSlot } from "@/stores/chain-store"
import { Pad } from "@/components/launchpad/pad"
import { AddPad } from "@/components/launchpad/add-pad"
import { cn } from "@/lib/utils"

const GRID_COLS = 8
const GRID_MIN_CELLS = 16
const MIN_ROW_PX = 64

interface PadGridProps {
  category: HydraCategory
  onToggleSlot: (slotId: string) => void
  onSelectSlot: (slotId: string) => void
  onArmSlot: (slotId: string) => void
  onDisarmSlot: () => void
  onRemoveSlot: (slotId: string) => void
  onAddSlot: (functionId: string) => void
  onMomentaryStart: (slotId: string) => void
  onMomentaryEnd: (slotId: string) => void
}

export function PadGrid({
  category,
  onToggleSlot,
  onSelectSlot,
  onArmSlot,
  onDisarmSlot,
  onRemoveSlot,
  onAddSlot,
  onMomentaryStart,
  onMomentaryEnd,
}: PadGridProps) {
  const padSlots = useChainStore((s) => s.padSlots)
  const selectedSlotId = useChainStore((s) => s.selectedSlotId)
  const armedSlotId = useChainStore((s) => s.armedSlotId)
  const activePads = useChainStore((s) => s.activePads)

  // Memoizado localmente: un selector Zustand que retorne un Map nuevo en cada
  // llamada rompe useSyncExternalStore (getSnapshot inestable) y causa loop infinito
  const chainPositions = useMemo(() => {
    const map = new Map<string, number>()
    ;[...activePads]
      .sort((a, b) => a.activatedAt - b.activatedAt)
      .forEach((pad, i) => map.set(pad.instanceId, i + 1))
    return map
  }, [activePads])

  const categoryFunctions = useMemo(() => getRegistryByCategory(category), [category])

  const orderedSlots = useMemo(() => {
    const slotsInCategory = padSlots.filter((s) => s.category === category)
    const baseSlots: PadSlot[] = []
    const extraSlots: PadSlot[] = []

    for (const fn of categoryFunctions) {
      const fnSlots = slotsInCategory.filter((s) => s.functionId === fn.id && !s.isExtra)
      baseSlots.push(...fnSlots)
    }

    for (const slot of slotsInCategory) {
      if (slot.isExtra) extraSlots.push(slot)
    }

    return [...baseSlots, ...extraSlots]
  }, [padSlots, category, categoryFunctions])

  const getSlotLabel = useCallback(
    (slot: PadSlot): string => {
      const slotsForFn = padSlots.filter((s) => s.functionId === slot.functionId)
      if (slotsForFn.length <= 1) return ""
      const idx = slotsForFn.findIndex((s) => s.instanceId === slot.instanceId)
      return idx >= 0 ? `#${idx + 1}` : ""
    },
    [padSlots]
  )

  const totalCells = Math.max(GRID_MIN_CELLS, orderedSlots.length + 1)
  const placeholderCount = totalCells - orderedSlots.length - 1
  const rowCount = Math.ceil(totalCells / GRID_COLS)

  return (
    <div
      role="tabpanel"
      id={`pad-panel-${category}`}
      aria-labelledby={`pad-tab-${category}`}
      className="grid grid-cols-8 gap-1 h-full"
      style={{
        gridTemplateRows: `repeat(${rowCount}, minmax(${MIN_ROW_PX}px, 1fr))`,
      }}
    >
      {orderedSlots.map((slot) => {
        const fn = getFunctionDef(slot.functionId)
        if (!fn) return null
        return (
          <div key={slot.instanceId} className="min-w-0 min-h-0">
            <Pad
              functionDef={fn}
              isActive={slot.isActive}
              isSelected={selectedSlotId === slot.instanceId}
              isArmed={armedSlotId === slot.instanceId}
              isBypassed={slot.isActive && !!slot.isBypassed}
              chainPosition={slot.isActive ? chainPositions.get(slot.instanceId) : undefined}
              slotLabel={getSlotLabel(slot)}
              isExtra={slot.isExtra}
              onToggle={() => onToggleSlot(slot.instanceId)}
              onSelect={() => onSelectSlot(slot.instanceId)}
              onArm={() => onArmSlot(slot.instanceId)}
              onDisarm={onDisarmSlot}
              onMomentaryStart={() => onMomentaryStart(slot.instanceId)}
              onMomentaryEnd={() => onMomentaryEnd(slot.instanceId)}
              onRemove={() => onRemoveSlot(slot.instanceId)}
            />
          </div>
        )
      })}

      <div className="min-w-0 min-h-0">
        <AddPad category={category} functions={categoryFunctions} onAdd={onAddSlot} />
      </div>

      {Array.from({ length: placeholderCount }).map((_, i) => (
        <div
          key={`placeholder-${i}`}
          className={cn(
            "min-w-0 min-h-0 rounded-lg border border-dashed border-white/5 bg-black/20"
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}
