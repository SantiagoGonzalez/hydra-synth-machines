"use client"

// Grid de swatches con tabs de paleta (sin picker nativo)

import { useState } from "react"
import {
  DEFAULT_COLOR_PALETTE_CATALOG,
  type ColorPaletteCatalog,
} from "@/lib/color-palettes"
import { cn } from "@/lib/utils"

interface ColorSwatchGridProps {
  activeHex: string
  onSelect: (hex: string) => void
  catalog?: ColorPaletteCatalog
}

function normalizeHex(hex: string): string {
  return hex.trim().toUpperCase()
}

export function ColorSwatchGrid({
  activeHex,
  onSelect,
  catalog = DEFAULT_COLOR_PALETTE_CATALOG,
}: ColorSwatchGridProps) {
  const [activeTabId, setActiveTabId] = useState(catalog.tabs[0]?.id ?? "")
  const activeTab =
    catalog.tabs.find((tab) => tab.id === activeTabId) ?? catalog.tabs[0]
  const activeNorm = normalizeHex(activeHex)

  if (!activeTab) return null

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-0.5">
        {catalog.tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            title={tab.title}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              "font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors",
              tab.id === activeTabId
                ? "border-white/40 text-white/90 bg-white/10"
                : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {activeTab.colors.map((hex) => {
          const isActive = normalizeHex(hex) === activeNorm
          return (
            <button
              key={`${activeTab.id}-${hex}`}
              type="button"
              aria-label={`${activeTab.title} ${hex}`}
              title={hex}
              onClick={() => onSelect(hex)}
              className={cn(
                "h-6 w-full rounded border transition-transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-white/40",
                isActive ? "border-white/70 ring-1 ring-white/50" : "border-white/15"
              )}
              style={{ backgroundColor: hex }}
            />
          )
        })}
      </div>
    </div>
  )
}
