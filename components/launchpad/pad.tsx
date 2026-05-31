"use client"

// Componente atÃ³mico del launchpad: botÃ³n de pad con estados de activaciÃ³n y colores por categorÃ­a

import { useCallback } from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { CATEGORY_COLORS, type HydraFunctionDef } from "@/lib/hydra-registry"
import { cn } from "@/lib/utils"

interface PadProps {
  functionDef: HydraFunctionDef
  isActive: boolean
  mode: "toggle" | "momentary"
  /** Etiqueta de instancia, ej. "#2" para diferenciar slots del mismo tipo */
  slotLabel?: string
  /** Si true, muestra botÃ³n X para eliminar el slot */
  isExtra?: boolean
  onToggle: () => void
  onMomentaryStart: () => void
  onMomentaryEnd: () => void
  onModeChange: (mode: "toggle" | "momentary") => void
  onRemove?: () => void
}

export function Pad({
  functionDef,
  isActive,
  mode,
  slotLabel,
  isExtra,
  onToggle,
  onMomentaryStart,
  onMomentaryEnd,
  onModeChange,
  onRemove,
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
      {/* Indicador activo */}
      <div
        className={cn(
          "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full transition-all duration-150",
          isActive ? "opacity-100" : "opacity-20"
        )}
        style={{ backgroundColor: color }}
      />

      {/* BotÃ³n X para eliminar slots extra */}
      {isExtra && (
        <button
          onClick={handleRemove}
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded flex items-center justify-center text-white/20 hover:text-red-400/70 hover:bg-red-500/10 transition-colors"
          title="Eliminar slot"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}

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

      {/* NÃºmero de instancia */}
      <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">
        {slotLabel ?? functionDef.category.slice(0, 3)}
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

