"use client"

// Componente atómico del launchpad: botón de pad con estados de activación y colores por categoría

import { useCallback } from "react"
import { motion } from "framer-motion"
import { CATEGORY_COLORS, type HydraFunctionDef } from "@/lib/hydra-registry"
import { cn } from "@/lib/utils"

interface PadProps {
  functionDef: HydraFunctionDef
  isActive: boolean
  mode: "toggle" | "momentary"
  onToggle: () => void
  onMomentaryStart: () => void
  onMomentaryEnd: () => void
  onModeChange: (mode: "toggle" | "momentary") => void
}

export function Pad({
  functionDef,
  isActive,
  mode,
  onToggle,
  onMomentaryStart,
  onMomentaryEnd,
  onModeChange,
}: PadProps) {
  const color = CATEGORY_COLORS[functionDef.category]

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      if (mode === "momentary") {
        onMomentaryStart()
      }
    },
    [mode, onMomentaryStart]
  )

  const handlePointerUp = useCallback(() => {
    if (mode === "momentary") {
      onMomentaryEnd()
    } else {
      onToggle()
    }
  }, [mode, onToggle, onMomentaryEnd])

  const handlePointerLeave = useCallback(() => {
    if (mode === "momentary" && isActive) {
      onMomentaryEnd()
    }
  }, [mode, isActive, onMomentaryEnd])

  const toggleMode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onModeChange(mode === "toggle" ? "momentary" : "toggle")
    },
    [mode, onModeChange]
  )

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-between rounded-lg cursor-pointer select-none",
        "border transition-colors duration-150",
        "p-2 min-h-[72px]",
        isActive
          ? "border-[var(--pad-color)] bg-[var(--pad-color)]/15"
          : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/5"
      )}
      style={{ "--pad-color": color } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      animate={
        isActive
          ? {
              boxShadow: [
                `0 0 8px ${color}60`,
                `0 0 16px ${color}80`,
                `0 0 8px ${color}60`,
              ],
            }
          : { boxShadow: "0 0 0px transparent" }
      }
      transition={
        isActive
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.2 }
      }
      whileTap={{ scale: 0.94 }}
    >
      {/* Indicator dot */}
      <div
        className={cn(
          "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full transition-all duration-150",
          isActive ? "opacity-100" : "opacity-20"
        )}
        style={{ backgroundColor: color }}
      />

      {/* Label */}
      <span
        className={cn(
          "font-mono text-[10px] font-semibold text-center leading-tight mt-1 px-1",
          isActive ? "text-white" : "text-white/50"
        )}
        style={isActive ? { color } : undefined}
      >
        {functionDef.label}
      </span>

      {/* Category badge */}
      <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">
        {functionDef.category.slice(0, 3)}
      </span>

      {/* Mode indicator (M = momentary, T = toggle) */}
      <button
        onClick={toggleMode}
        className={cn(
          "absolute bottom-1 left-1.5 font-mono text-[7px] uppercase tracking-wider px-0.5 py-px rounded",
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
