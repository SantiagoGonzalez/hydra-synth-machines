import { getRegistryByCategory, type HydraCategory } from "@/lib/hydra-registry"
import type { PadSlot } from "@/stores/chain-store"

/** Ordena los slots como la grilla: base por registro y extras al final. */
export function orderPadSlotsForCategory(
  padSlots: PadSlot[],
  category: HydraCategory
): PadSlot[] {
  const slotsInCategory = padSlots.filter((slot) => slot.category === category)
  const baseSlots: PadSlot[] = []
  const extraSlots: PadSlot[] = []

  for (const fn of getRegistryByCategory(category)) {
    baseSlots.push(
      ...slotsInCategory.filter((slot) => slot.functionId === fn.id && !slot.isExtra)
    )
  }

  for (const slot of slotsInCategory) {
    if (slot.isExtra) extraSlots.push(slot)
  }

  return [...baseSlots, ...extraSlots]
}
