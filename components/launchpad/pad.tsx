"use client"

// Componente atómico del launchpad: botón de pad con estados de activación y colores por categoría

import { useCallback, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { CATEGORY_COLORS, type HydraFunctionDef } from "@/lib/hydra-registry"
import { cn } from "@/lib/utils"

/** Umbral de long-press: superarlo activa el slot como momentary */
const MOMENTARY_HOLD_MS = 250

interface PadProps {
  functionDef: HydraFunctionDef
  isActive: boolean
  isSelected?: boolean
  isArmed?: boolean
  /** Activo pero salteado por el compilador (conserva posición y params) */
  isBypassed?: boolean
  /** Posición en cadena (1-based), esquina opuesta al #N */
  chainPosition?: number
  slotLabel?: string
  isExtra?: boolean
  onToggle: () => void
  onSelect: () => void
  onArm: () => void
  onDisarm: () => void
  onMomentaryStart: () => void
  onMomentaryEnd: () => void
  onRemove?: () => void
}

export function Pad({
  functionDef,
  isActive,
  isSelected = false,
  isArmed = false,
  isBypassed = false,
  chainPosition,
  slotLabel,
  isExtra,
  onToggle,
  onSelect,
  onArm,
  onDisarm,
  onMomentaryStart,
  onMomentaryEnd,
  onRemove,
}: PadProps) {
  const color = CATEGORY_COLORS[functionDef.category]
  const selectOnlyRef = useRef(false)
  const armRef = useRef(false)
  const holdTimerRef = useRef<number | null>(null)
  const momentaryRef = useRef(false)

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  useEffect(() => clearHoldTimer, [clearHoldTimer])

  // Gesto unificado: tap corto = toggle; sostener MOMENTARY_HOLD_MS = momentary hasta soltar
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.currentTarget.setPointerCapture(e.pointerId)
      selectOnlyRef.current = e.ctrlKey || e.altKey || e.metaKey
      armRef.current = e.shiftKey

      if (armRef.current) return
      if (selectOnlyRef.current) return
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null
        momentaryRef.current = true
        onMomentaryStart()
      }, MOMENTARY_HOLD_MS)
    },
    [onMomentaryStart]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      clearHoldTimer()
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
      if (momentaryRef.current) {
        momentaryRef.current = false
        onMomentaryEnd()
        return
      }
      onToggle()
    },
    [clearHoldTimer, onToggle, onMomentaryEnd, onSelect, onArm, onDisarm, isArmed, isActive]
  )

  const handlePointerLeave = useCallback(() => {
    clearHoldTimer()
    if (momentaryRef.current) {
      momentaryRef.current = false
      onMomentaryEnd()
    }
  }, [clearHoldTimer, onMomentaryEnd])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onSelect()
    },
    [onSelect]
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
        isActive && !isBypassed && "border-[var(--pad-color)] bg-[var(--pad-color)]/15",
        isActive && isBypassed && "border-[var(--pad-color)]/40 bg-[var(--pad-color)]/5",
        !isActive && "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/5",
        isSelected && "ring-2 ring-inset ring-white/60",
        isArmed && "border-dashed border-yellow-400/60"
      )}
      style={{ "--pad-color": color } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
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
          : isActive && !isBypassed
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
        (isActive && !isBypassed) || isArmed
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.2 }
      }
      whileTap={{ scale: 0.94 }}
    >
      <div
        className={cn(
          "absolute top-1 right-1 w-2 h-2 rounded-full transition-all duration-150",
          isActive ? "opacity-100" : "opacity-20",
          isActive && isBypassed && "opacity-40"
        )}
        style={{ backgroundColor: color }}
      />

      {chainPosition != null && (
        <span
          className="absolute bottom-1 right-1 font-mono text-[10px] leading-none px-1 py-0.5 rounded text-white/80 tabular-nums"
          style={{ backgroundColor: `${color}40` }}
        >
          {chainPosition}
        </span>
      )}

      {isActive && isBypassed && (
        <span className="absolute bottom-1 left-1 font-mono text-[8px] leading-none px-1 py-0.5 rounded border border-amber-400/40 text-amber-300/90 bg-amber-400/10 uppercase">
          byp
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
          "font-mono text-[12px] font-semibold text-center leading-tight px-0.5 truncate w-full",
          isActive ? "text-white" : "text-white/50",
          isBypassed && "line-through opacity-60"
        )}
        style={isActive ? { color } : undefined}
      >
        {functionDef.label}
      </span>

      <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider truncate">
        {slotLabel || functionDef.category.slice(0, 3)}
      </span>
    </motion.div>
  )
}
