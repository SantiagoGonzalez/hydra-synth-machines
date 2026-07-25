"use client"

// Visualización en tiempo real del código Hydra compilado, con segmentos coloreados por categoría

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useChainStore } from "@/stores/chain-store"
import { HYDRA_REGISTRY, CATEGORY_COLORS } from "@/lib/hydra-registry"
import { cn } from "@/lib/utils"

interface CodeSegment {
  text: string
  color?: string
}

/** Tokeniza el código compilado e inyecta colores según si el token es un functionId conocido */
function tokenize(code: string): CodeSegment[] {
  const segments: CodeSegment[] = []
  // Divide por el patrón de llamada de función, preservando los separadores
  const parts = code.split(/(\b\w+(?=\())/g)

  for (const part of parts) {
    const fn = HYDRA_REGISTRY.find((f) => f.id === part)
    if (fn) {
      segments.push({ text: part, color: CATEGORY_COLORS[fn.category] })
    } else {
      segments.push({ text: part })
    }
  }

  return segments
}

export function ChainPreview({ compact = false }: { compact?: boolean }) {
  const compiledCode = useChainStore((s) => s.compiledCode)
  const activePads = useChainStore((s) => s.activePads)

  const segments = useMemo(() => tokenize(compiledCode), [compiledCode])

  const isEmpty = activePads.length === 0

  return (
    <div
      className={cn(
        "glass-card rounded-xl border border-white/5 font-mono shrink-0",
        compact ? "px-3 py-2" : "p-3",
        "transition-all duration-300",
        isEmpty ? "opacity-40" : "opacity-100"
      )}
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className={cn("flex items-center justify-between", compact ? "mb-1" : "mb-2")}>
        <span className="text-[9px] text-white/20 uppercase tracking-wider">Chain</span>
        <span className="text-[9px] text-white/20 tabular-nums">
          {activePads.length} active
        </span>
      </div>

      <div className="relative overflow-x-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={compiledCode}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "leading-relaxed whitespace-nowrap",
              compact ? "text-[10px]" : "text-[11px] pb-1"
            )}
          >
            {segments.map((seg, i) => (
              <span
                key={i}
                style={seg.color ? { color: seg.color } : { color: "rgba(255,255,255,0.4)" }}
              >
                {seg.text}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {!compact && activePads.length > 0 && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5 flex-wrap">
          {[...activePads]
            .sort((a, b) => a.activatedAt - b.activatedAt)
            .map((pad, idx) => {
              const color = CATEGORY_COLORS[pad.category]
              return (
                <div key={pad.instanceId} className="flex items-center gap-0.5">
                  {idx > 0 && (
                    <span className="text-white/15 text-[9px]">→</span>
                  )}
                  <span
                    className="text-[9px] font-mono px-1 py-0.5 rounded"
                    style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    {pad.functionId}
                  </span>
                </div>
              )
            })}
          <span className="text-white/15 text-[9px]">→ out()</span>
        </div>
      )}
    </div>
  )
}
