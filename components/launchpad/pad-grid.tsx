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

const GRID_MIN_CELLS = 16

interface PadGridProps {
  category: HydraCategory
  onToggleSlot: (slotId: string) => void
  onSelectSlot: (slotId: string) => void
  onRemoveSlot: (slotId: string) => void
  onAddSlot: (functionId: string) => void
  onModeChange: (slotId: string, mode: "toggle" | "momentary") => void
  onMomentaryStart: (slotId: string) => void
  onMomentaryEnd: (slotId: string) => void
}

export function PadGrid({
  category,
  onToggleSlot,
  onSelectSlot,
  onRemoveSlot,
  onAddSlot,
  onModeChange,
  onMomentaryStart,
  onMomentaryEnd,
}: PadGridProps) {
  const padSlots = useChainStore((s) => s.padSlots)
  const selectedSlotId = useChainStore((s) => s.selectedSlotId)

  const categoryFunctions = useMemo(() => getRegistryByCategory(category), [category])

  const orderedSlots = useMemo(() => {
    const slotsInCategory = padSlots.filter((s) => s.category === category)
    const result: PadSlot[] = []
    for (const fn of categoryFunctions) {
      const fnSlots = slotsInCategory.filter((s) => s.functionId === fn.id)
      result.push(...fnSlots)
    }
    return result
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

  return (
    <div
      role="tabpanel"
      id={`pad-panel-${category}`}
      aria-labelledby={`pad-tab-${category}`}
      className="grid grid-cols-8 gap-1 auto-rows-fr"
    >
      {orderedSlots.map((slot) => {
        const fn = getFunctionDef(slot.functionId)
        if (!fn) return null
        return (
          <div key={slot.instanceId} className="aspect-square min-w-0">
            <Pad
              functionDef={fn}
              isActive={slot.isActive}
              isSelected={selectedSlotId === slot.instanceId}
              mode={slot.mode}
              slotLabel={getSlotLabel(slot)}
              isExtra={slot.isExtra}
              onToggle={() => onToggleSlot(slot.instanceId)}
              onSelect={() => onSelectSlot(slot.instanceId)}
              onMomentaryStart={() => onMomentaryStart(slot.instanceId)}
              onMomentaryEnd={() => onMomentaryEnd(slot.instanceId)}
              onModeChange={(m) => onModeChange(slot.instanceId, m)}
              onRemove={() => onRemoveSlot(slot.instanceId)}
            />
          </div>
        )
      })}

      <div className="aspect-square min-w-0">
        <AddPad category={category} functions={categoryFunctions} onAdd={onAddSlot} />
      </div>

      {Array.from({ length: placeholderCount }).map((_, i) => (
        <div
          key={`placeholder-${i}`}
          className={cn(
            "aspect-square min-w-0 rounded-lg border border-dashed border-white/5 bg-black/20"
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}
