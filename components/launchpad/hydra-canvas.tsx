"use client"

// Canvas WebGL aislado para el launchpad: inicializa hydra-synth y reevalúa la cadena compilada

import { useRef, useEffect, useState, useCallback } from "react"
import { Maximize2, AlertCircle } from "lucide-react"
import { useChainStore } from "@/stores/chain-store"
import { createHydraEvaluator, type HydraEvaluator } from "@/lib/chain-evaluator"
import { cn } from "@/lib/utils"

export function HydraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const evaluatorRef = useRef<HydraEvaluator | null>(null)
  const prevCodeRef = useRef<string>("")
  const prevPadCountRef = useRef<number>(0)

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const compiledCode = useChainStore((s) => s.compiledCode)
  const activePads = useChainStore((s) => s.activePads)
  const markSafeCode = useChainStore((s) => s.markSafeCode)
  const lastSafeCode = useChainStore((s) => s.lastSafeCode)

  // Inicialización del engine hydra-synth
  useEffect(() => {
    if (!canvasRef.current) return

    let evaluator: HydraEvaluator | null = null

    createHydraEvaluator(canvasRef.current, {
      onError: (msg) => {
        setError(msg)
      },
      onSuccess: () => {
        setError(null)
        markSafeCode()
      },
    }).then((ev) => {
      evaluator = ev
      evaluatorRef.current = ev
      setIsReady(true)

      // Render inicial seguro
      ev.run("solid(0,0,0).out()", true)
    })

    return () => {
      evaluator?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reevalúa cuando el código compilado cambia
  useEffect(() => {
    if (!isReady || !evaluatorRef.current) return

    const padCount = activePads.length
    // Cambio estructural = se añadió o quitó un pad (no solo ajuste de parámetros)
    const isStructural = padCount !== prevPadCountRef.current

    evaluatorRef.current.run(compiledCode, isStructural)

    if (isStructural) {
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 200)
    }

    prevCodeRef.current = compiledCode
    prevPadCountRef.current = padCount
  }, [compiledCode, isReady, activePads.length])

  const handleDismissError = useCallback(() => {
    setError(null)
    // Revert to last safe state
    evaluatorRef.current?.run(lastSafeCode, true)
  }, [lastSafeCode])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black">
      {/* Glow border */}
      <div
        className={cn(
          "absolute -inset-[1px] rounded-xl transition-opacity duration-500 pointer-events-none z-0",
          "bg-gradient-to-br from-[#44ff88]/20 via-transparent to-[#cc44ff]/20",
          isFlashing ? "opacity-100" : "opacity-30"
        )}
      />

      {/* Flash overlay on structural change */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none z-10 animate-ping" />
      )}

      <canvas
        ref={canvasRef}
        className="relative z-1 w-full aspect-video bg-black block"
      />

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className={cn(
          "absolute top-2 right-2 z-20 p-1.5",
          "bg-black/60 hover:bg-black/80 border border-white/10 rounded-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        title="Toggle fullscreen"
      >
        <Maximize2 className="w-3.5 h-3.5 text-white/50" />
      </button>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-black/60 backdrop-blur-sm">
        <span className="font-mono text-[9px] text-white/30">Hydra Output (o0)</span>
        <div className="flex items-center gap-1.5">
          {isReady ? (
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 animate-pulse" />
          )}
          <span className="font-mono text-[9px] text-white/30">
            {isReady ? "LIVE" : "INIT"}
          </span>
        </div>
      </div>

      {/* Error overlay */}
      {error && (
        <div
          className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={handleDismissError}
        >
          <div className="flex flex-col items-center gap-2 max-w-xs text-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="font-mono text-[10px] text-red-300">{error}</p>
            <p className="font-mono text-[9px] text-white/30">click to dismiss</p>
          </div>
        </div>
      )}
    </div>
  )
}
