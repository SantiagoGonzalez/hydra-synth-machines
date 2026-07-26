"use client"

// Mini-canvas PiP de staging: instancia Hydra propia que evalúa previewCode sin tocar el canvas principal

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { useChainStore } from "@/stores/chain-store"
import { createHydraEvaluator, type HydraEvaluator } from "@/lib/chain-evaluator"

export function PreviewCanvas() {
  const armedSlotId = useChainStore((s) => s.armedSlotId)
  if (!armedSlotId) return null
  return <ArmedPreview />
}

// Montado solo mientras hay slot armado: crea y libera su propio contexto WebGL
function ArmedPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const evaluatorRef = useRef<HydraEvaluator | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewCode = useChainStore((s) => s.previewCode)
  const applyArmedSlot = useChainStore((s) => s.applyArmedSlot)

  useEffect(() => {
    if (!canvasRef.current) return
    let disposed = false
    let evaluator: HydraEvaluator | null = null

    createHydraEvaluator(canvasRef.current, {
      onError: (msg) => setError(msg),
      onSuccess: () => setError(null),
    }).then((ev) => {
      if (disposed) {
        ev.dispose()
        return
      }
      evaluator = ev
      evaluatorRef.current = ev
      setIsReady(true)
    })

    return () => {
      disposed = true
      evaluator?.dispose()
      evaluatorRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isReady || !previewCode) return
    evaluatorRef.current?.run(previewCode)
  }, [previewCode, isReady])

  return (
    <div className="absolute top-3 left-3 z-30 w-56 rounded-lg overflow-hidden border border-yellow-400/40 bg-black shadow-lg shadow-black/60">
      <canvas ref={canvasRef} className="block w-full aspect-video bg-black" />
      <div className="flex items-center justify-between px-2 py-1 bg-black/80 border-t border-yellow-400/20">
        <span className="font-mono text-[8px] text-yellow-400/80 uppercase tracking-wider">
          preview · Enter
        </span>
        <button
          type="button"
          onClick={applyArmedSlot}
          className="flex items-center gap-1 font-mono text-[8px] uppercase px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-300 hover:bg-yellow-400/30 transition-colors"
          title="Apply armed pad (Enter)"
        >
          <Check className="w-2.5 h-2.5" />
          Apply
        </button>
      </div>
      {error && (
        <p className="px-2 py-1 font-mono text-[8px] text-red-300 bg-black/80">{error}</p>
      )}
    </div>
  )
}
