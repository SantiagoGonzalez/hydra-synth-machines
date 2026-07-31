"use client"

// Visualización en tiempo real del código Hydra compilado, con segmentos coloreados por categoría

import { useMemo, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { useChainStore, selectDetailPad } from "@/stores/chain-store"
import { HYDRA_REGISTRY, CATEGORY_COLORS } from "@/lib/hydra-registry"
import { ChainChips } from "@/components/launchpad/chain-chips"
import { cn } from "@/lib/utils"

interface CodeSegment {
  text: string
  color?: string
}

/** Tokeniza el código compilado e inyecta colores según si el token es un functionId conocido */
function tokenize(code: string): CodeSegment[] {
  const segments: CodeSegment[] = []
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
  const selectSlot = useChainStore((s) => s.selectSlot)
  const detailPad = useChainStore(selectDetailPad)
  const [isCopied, setIsCopied] = useState(false)

  const segments = useMemo(() => tokenize(compiledCode), [compiledCode])
  const isEmpty = activePads.length === 0

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(compiledCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      // clipboard no disponible
    }
  }, [compiledCode])

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
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/20 tabular-nums">
            {activePads.length} active
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "p-0.5 rounded transition-colors",
              isCopied
                ? "text-green-400/80"
                : "text-white/20 hover:text-white/50"
            )}
            title="Copy compiled code"
          >
            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={compiledCode}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "leading-relaxed whitespace-pre-wrap break-all",
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
        <div className="mt-2 pt-2 border-t border-white/5">
          <ChainChips
            pads={activePads}
            highlightId={detailPad?.instanceId}
            onChipClick={selectSlot}
          />
        </div>
      )}
    </div>
  )
}
