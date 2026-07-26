"use client"

// Componente atómico del launchpad: botón de pad con estados de activación y colores por categoría

import { useCallback, useRef } from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { CATEGORY_COLORS, type HydraFunctionDef } from "@/lib/hydra-registry"
import { cn } from "@/lib/utils"

interface PadProps {
  functionDef: HydraFunctionDef
  isActive: boolean
  isSelected?: boolean
  isArmed?: boolean
  /** Posición en cadena (1-based), esquina opuesta al #N */
  chainPosition?: number
  mode: "toggle" | "momentary"
  slotLabel?: string
  isExtra?: boolean
  onToggle: () => void
  onSelect: () => void
  onArm: () => void
  onDisarm: () => void
  onMomentaryStart: () => void
  onMomentaryEnd: () => void
  onModeChange: (mode: "toggle" | "momentary") => void
  onRemove?: () => void
}

export function Pad({
  functionDef,
  isActive,
  isSelected = false,
  isArmed = false,
  chainPosition,
  mode,
  slotLabel,
  isExtra,
  onToggle,
  onSelect,
  onArm,
  onDisarm,
  onMomentaryStart,
  onMomentaryEnd,
  onModeChange,
  onRemove,
}: PadProps) {
  const color = CATEGORY_COLORS[functionDef.category]
  const selectOnlyRef = useRef(false)
  const armRef = useRef(false)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      selectOnlyRef.current = e.ctrlKey || e.altKey || e.metaKey
      armRef.current = e.shiftKey

      if (armRef.current) return
      if (selectOnlyRef.current) return
      if (mode === "momentary") {
        onMomentaryStart()
      }
    },
    [mode, onMomentaryStart]
  )

  const handlePointerUp = useCallback(() => {
    if (armRef.current) {
      if (isArmed) {
        onDisarm()
      } else if (!isActive) {
        onArm()
      }
      armRef.current = false
      return
    }
    if (selectOnlyRef.current) {
      onSelect()
      selectOnlyRef.current = false
      return
    }
    if (mode === "momentary") {
      onMomentaryEnd()
    } else {
      onToggle()
    }
  }, [mode, onToggle, onMomentaryEnd, onSelect, onArm, onDisarm, isArmed, isActive])

  const handlePointerLeave = useCallback(() => {
    if (selectOnlyRef.current || armRef.current) return
    if (mode === "momentary" && isActive) {
      onMomentaryEnd()
    }
  }, [mode, isActive, onMomentaryEnd])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onSelect()
    },
    [onSelect]
  )

  const toggleMode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onModeChange(mode === "toggle" ? "momentary" : "toggle")
    },
    [mode, onModeChange]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove?.()
    },
    [onRemove]
  )

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 rounded-lg cursor-pointer select-none w-full h-full overflow-hidden",
        "border transition-colors duration-150",
        "p-1.5",
        isActive
          ? "border-[var(--pad-color)] bg-[var(--pad-color)]/15"
          : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/5",
        isSelected && "ring-2 ring-inset ring-white/60",
        isArmed && "border-dashed border-yellow-400/60"
      )}
      style={{ "--pad-color": color } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={handleContextMenu}
      animate={
        isArmed
          ? {
              boxShadow: [
                "inset 0 0 6px rgba(250,204,21,0.3)",
                "inset 0 0 14px rgba(250,204,21,0.5)",
                "inset 0 0 6px rgba(250,204,21,0.3)",
              ],
            }
          : isActive
            ? {
                boxShadow: [
                  `inset 0 0 8px ${color}55`,
                  `inset 0 0 18px ${color}88`,
                  `inset 0 0 8px ${color}55`,
                ],
              }
            : { boxShadow: "inset 0 0 0px transparent" }
      }
      transition={
        isActive || isArmed
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.2 }
      }
      whileTap={{ scale: 0.94 }}
    >
      <div
        className={cn(
          "absolute top-1 right-1 w-1.5 h-1.5 rounded-full transition-all duration-150",
          isActive ? "opacity-100" : "opacity-20"
        )}
        style={{ backgroundColor: color }}
      />

      {chainPosition != null && (
        <span className="absolute bottom-0.5 right-1 font-mono text-[7px] text-white/40 tabular-nums">
          {chainPosition}
        </span>
      )}

      {isExtra && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded flex items-center justify-center text-white/20 hover:text-red-400/70 hover:bg-red-500/10 transition-colors z-10"
          title="Eliminar slot"
        >
          <X className="w-2 h-2" />
        </button>
      )}

      <span
        className={cn(
          "font-mono text-[9px] font-semibold text-center leading-tight px-0.5 truncate w-full",
          isActive ? "text-white" : "text-white/50"
        )}
        style={isActive ? { color } : undefined}
      >
        {functionDef.label}
      </span>

      <span className="font-mono text-[7px] text-white/25 uppercase tracking-wider truncate">
        {slotLabel || functionDef.category.slice(0, 3)}
      </span>

      <button
        type="button"
        onClick={toggleMode}
        className={cn(
          "absolute bottom-0.5 left-1 font-mono text-[6px] uppercase tracking-wider px-0.5 py-px rounded",
          "transition-colors hover:bg-white/10",
          mode === "momentary" ? "text-yellow-400/70" : "text-white/20"
        )}
        title={`Mode: ${mode}. Click to switch.`}
      >
        {mode === "momentary" ? "M" : "T"}
      </button>
    </motion.div>
  )
}
