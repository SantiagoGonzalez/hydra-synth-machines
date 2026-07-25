"use client"

// Barra de tabs por categoría con indicador de pads activos y atajo numérico

import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORIES, type HydraCategory } from "@/lib/hydra-registry"
import { useChainStore } from "@/stores/chain-store"
import { cn } from "@/lib/utils"

interface PadTabBarProps {
  activeCategory: HydraCategory
  onCategoryChange: (category: HydraCategory) => void
}

export function PadTabBar({ activeCategory, onCategoryChange }: PadTabBarProps) {
  const padSlots = useChainStore((s) => s.padSlots)

  return (
    <div
      role="tablist"
      aria-label="Pad categories"
      className="flex items-center gap-1 shrink-0"
    >
      {CATEGORIES.map((cat, index) => {
        const color = CATEGORY_COLORS[cat]
        const label = CATEGORY_LABELS[cat]
        const activeCount = padSlots.filter((s) => s.category === cat && s.isActive).length
        const isActive = activeCategory === cat

        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`pad-panel-${cat}`}
            id={`pad-tab-${cat}`}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[9px] uppercase tracking-wider transition-colors",
              isActive
                ? "border-white/20 bg-white/10 text-white/80"
                : "border-transparent text-white/30 hover:text-white/50 hover:bg-white/5"
            )}
          >
            <span className="text-white/20 tabular-nums">{index + 1}</span>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: activeCount > 0 ? color : `${color}44` }}
            />
            <span style={isActive ? { color } : undefined}>{label}</span>
            {activeCount > 0 && (
              <span
                className="tabular-nums px-1 py-px rounded text-[8px]"
                style={{ color, backgroundColor: `${color}22` }}
              >
                {activeCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
