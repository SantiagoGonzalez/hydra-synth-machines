"use client"

// Banda inferior de pads: tabs por categoría, grilla 8×2 y controles globales

import { useState, useCallback } from "react"
import { Trash2, Shuffle } from "lucide-react"
import { HYDRA_REGISTRY, CATEGORIES, type HydraCategory } from "@/lib/hydra-registry"
import { useChainStore } from "@/stores/chain-store"
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

  const [activeCategory, setActiveCategory] = useState<HydraCategory>("source")

  useLaunchpadKeys(setActiveCategory)

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

  const handleRandomize = useCallback(() => {
    clearAll()
    const sources = HYDRA_REGISTRY.filter((f) => f.category === "source")
    const transforms = HYDRA_REGISTRY.filter((f) => f.category !== "source")
    const randSrc = sources[Math.floor(Math.random() * sources.length)]
    const randT1 = transforms[Math.floor(Math.random() * transforms.length)]
    const randT2 = transforms.filter((f) => f.id !== randT1.id)[
      Math.floor(Math.random() * (transforms.length - 1))
    ]
    const srcSlot = padSlots.find((s) => s.functionId === randSrc.id && !s.isExtra)
    const t1Slot = padSlots.find((s) => s.functionId === randT1.id && !s.isExtra)
    const t2Slot = padSlots.find((s) => s.functionId === randT2.id && !s.isExtra)
    if (srcSlot) toggleSlot(srcSlot.instanceId)
    if (t1Slot) setTimeout(() => toggleSlot(t1Slot.instanceId), 10)
    if (t2Slot) setTimeout(() => toggleSlot(t2Slot.instanceId), 20)
  }, [clearAll, padSlots, toggleSlot])

  return (
    <section className="min-h-0 flex flex-col border-t border-white/5 bg-black/40">
      <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 border-b border-white/5">
        <PadTabBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={handleRandomize}
            title="Random patch"
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
              onRemoveSlot={removeSlot}
              onAddSlot={addSlot}
              onMomentaryStart={holdSlot}
              onMomentaryEnd={releaseSlot}
            />
          ) : null
        )}
      </div>
    </section>
  )
}
