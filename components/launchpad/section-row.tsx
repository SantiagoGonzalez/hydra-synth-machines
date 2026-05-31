"use client"

// Fila de sección del launchpad: agrupa los pads de una categoría por función

import { useCallback, useMemo } from "react"
import { CATEGORY_COLORS, CATEGORY_LABELS, getFunctionDef, getRegistryByCategory, type HydraCategory } from "@/lib/hydra-registry"
import { type PadSlot } from "@/stores/chain-store"
import { Pad } from "@/components/launchpad/pad"
import { AddPad } from "@/components/launchpad/add-pad"
import { cn } from "@/lib/utils"

interface SectionRowProps {
  category: HydraCategory
  padSlots: PadSlot[]
  padModes: Record<string, "toggle" | "momentary">
  onToggleSlot: (slotId: string) => void
  onRemoveSlot: (slotId: string) => void
  onAddSlot: (functionId: string) => void
  onModeChange: (slotId: string, mode: "toggle" | "momentary") => void
  onMomentaryStart: (slotId: string) => void
  onMomentaryEnd: (slotId: string) => void
}

export function SectionRow({
  category,
  padSlots,
  padModes,
  onToggleSlot,
  onRemoveSlot,
  onAddSlot,
  onModeChange,
  onMomentaryStart,
  onMomentaryEnd,
}: SectionRowProps) {
  const color = CATEGORY_COLORS[category]
  const label = CATEGORY_LABELS[category]
  const allFunctions = useMemo(() => getRegistryByCategory(category), [category])

  // Agrupa los slots de esta sección por functionId, manteniendo orden del registro
  const functionGroups = useMemo(() => {
    const slotsInSection = padSlots.filter((s) => s.category === category)
    return allFunctions.map((fn) => ({
      fn,
      slots: slotsInSection.filter((s) => s.functionId === fn.id),
    }))
  }, [padSlots, category, allFunctions])

  const hasAnyActive = padSlots.some((s) => s.category === category && s.isActive)

  const getSlotLabel = useCallback(
    (slot: PadSlot, indexInGroup: number): string => {
      const slotsForFn = padSlots.filter((s) => s.functionId === slot.functionId)
      // Solo mostrar número si hay más de un slot para esa función
      return slotsForFn.length > 1 ? `#${indexInGroup + 1}` : ""
    },
    [padSlots]
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Header de sección */}
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: hasAnyActive ? color : `${color}44` }}
        />
        <span
          className="font-mono text-[9px] uppercase tracking-widest font-semibold"
          style={{ color: hasAnyActive ? color : `${color}66` }}
        >
          {label}
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Grupos de pads por función + pad "+" */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 items-start">
        {functionGroups.map(({ fn, slots }) => (
          <FunctionGroup
            key={fn.id}
            slots={slots}
            color={color}
            padModes={padModes}
            getSlotLabel={getSlotLabel}
            onToggleSlot={onToggleSlot}
            onRemoveSlot={onRemoveSlot}
            onModeChange={onModeChange}
            onMomentaryStart={onMomentaryStart}
            onMomentaryEnd={onMomentaryEnd}
          />
        ))}

        <AddPad
          category={category}
          functions={allFunctions}
          onAdd={onAddSlot}
        />
      </div>
    </div>
  )
}

// ── Subcomponente: grupo de slots para una misma función ─────────────────────

interface FunctionGroupProps {
  slots: PadSlot[]
  color: string
  padModes: Record<string, "toggle" | "momentary">
  getSlotLabel: (slot: PadSlot, index: number) => string
  onToggleSlot: (slotId: string) => void
  onRemoveSlot: (slotId: string) => void
  onModeChange: (slotId: string, mode: "toggle" | "momentary") => void
  onMomentaryStart: (slotId: string) => void
  onMomentaryEnd: (slotId: string) => void
}

function FunctionGroup({
  slots,
  color,
  padModes,
  getSlotLabel,
  onToggleSlot,
  onRemoveSlot,
  onModeChange,
  onMomentaryStart,
  onMomentaryEnd,
}: FunctionGroupProps) {
  if (slots.length === 0) return null

  const fn = getFunctionDef(slots[0].functionId)
  if (!fn) return null

  return (
    <div className="flex flex-col gap-1">
      {/* Nombre de función sobre el grupo */}
      <span
        className={cn(
          "font-mono text-[8px] uppercase tracking-wider text-center px-0.5",
          slots.some((s) => s.isActive) ? "opacity-80" : "opacity-30"
        )}
        style={{ color }}
      >
        {fn.label}
      </span>

      {/* Fila de pads del grupo */}
      <div className="flex gap-1">
        {slots.map((slot, i) => (
          <Pad
            key={slot.instanceId}
            functionDef={fn}
            isActive={slot.isActive}
            mode={padModes[slot.instanceId] ?? "toggle"}
            slotLabel={getSlotLabel(slot, i)}
            isExtra={slot.isExtra}
            onToggle={() => onToggleSlot(slot.instanceId)}
            onMomentaryStart={() => onMomentaryStart(slot.instanceId)}
            onMomentaryEnd={() => onMomentaryEnd(slot.instanceId)}
            onModeChange={(m) => onModeChange(slot.instanceId, m)}
            onRemove={() => onRemoveSlot(slot.instanceId)}
          />
        ))}
      </div>
    </div>
  )
}
