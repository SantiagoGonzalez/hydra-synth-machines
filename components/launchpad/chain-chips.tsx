"use client"

// Chips ordenados de la cadena activa, reutilizables en ChainPreview y ParamPanel

import { CATEGORY_COLORS, getFunctionDef } from "@/lib/hydra-registry"
import type { ActivePad } from "@/stores/chain-store"
import { cn } from "@/lib/utils"

interface ChainChipsProps {
  pads: ActivePad[]
  /** instanceId del pad a resaltar (detalle / edición) */
  highlightId?: string | null
  onChipClick?: (instanceId: string) => void
  showOut?: boolean
  className?: string
}

export function ChainChips({
  pads,
  highlightId,
  onChipClick,
  showOut = true,
  className,
}: ChainChipsProps) {
  const ordered = [...pads].sort((a, b) => a.activatedAt - b.activatedAt)

  if (ordered.length === 0) return null

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {ordered.map((pad, idx) => {
        const color = CATEGORY_COLORS[pad.category]
        const def = getFunctionDef(pad.functionId)
        const label = def?.label ?? pad.functionId
        const isHighlighted = highlightId === pad.instanceId
        const Tag = onChipClick ? "button" : "span"

        return (
          <div key={pad.instanceId} className="flex items-center gap-0.5">
            {idx > 0 && <span className="text-white/15 text-[9px]">→</span>}
            <Tag
              {...(onChipClick
                ? {
                    type: "button" as const,
                    onClick: () => onChipClick(pad.instanceId),
                  }
                : {})}
              className={cn(
                "font-mono text-[9px] px-1 py-0.5 rounded transition-all",
                onChipClick && "hover:bg-white/5 cursor-pointer"
              )}
              style={{
                color,
                backgroundColor: `${color}${isHighlighted ? "28" : "15"}`,
                border: `1px solid ${color}${isHighlighted ? "80" : "30"}`,
                boxShadow: isHighlighted ? `0 0 8px ${color}55` : undefined,
              }}
            >
              {label}
            </Tag>
          </div>
        )
      })}
      {showOut && <span className="text-white/15 text-[9px]">→ out()</span>}
    </div>
  )
}
