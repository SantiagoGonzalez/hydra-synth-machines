"use client"

// Canvas WebGL aislado para el launchpad: inicializa hydra-synth y reevalúa la cadena compilada

import { useRef, useEffect, useState, useCallback } from "react"
import { Maximize2, AlertCircle, Heart, LayoutGrid } from "lucide-react"
import { useChainStore, selectAllChainsSnapshot, type OutputBuffer } from "@/stores/chain-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { createHydraEvaluator, type HydraEvaluator } from "@/lib/chain-evaluator"
import { OUTPUT_BUFFERS } from "@/lib/chain-compiler"
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
  const [isSaved, setIsSaved] = useState(false)

  const compiledCode = useChainStore((s) => s.compiledCode)
  const activePads = useChainStore((s) => s.activePads)
  const editingOutput = useChainStore((s) => s.editingOutput)
  const gridView = useChainStore((s) => s.gridView)
  const setEditingOutput = useChainStore((s) => s.setEditingOutput)
  const setGridView = useChainStore((s) => s.setGridView)
  const markSafeCode = useChainStore((s) => s.markSafeCode)
  const lastSafeCode = useChainStore((s) => s.lastSafeCode)
  const saveFavorite = useFavoritesStore((s) => s.saveFavorite)

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
    })

    return () => {
      evaluator?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isReady || !evaluatorRef.current) return

    const padCount = activePads.length
    const isStructural =
      padCount !== prevPadCountRef.current ||
      compiledCode.includes("render(") !== prevCodeRef.current.includes("render(")

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
    evaluatorRef.current?.run(lastSafeCode, true)
  }, [lastSafeCode])

  const handleSaveToFavorites = useCallback(() => {
    if (!canvasRef.current) return
    const thumbnailDataUrl = canvasRef.current.toDataURL("image/webp", 0.6)
    // Snapshot leído on-demand (no suscripto al render): evita recrear un objeto
    // nuevo en cada render, que rompería useSyncExternalStore con loop infinito
    const allChains = selectAllChainsSnapshot(useChainStore.getState())
    saveFavorite({ chains: allChains, compiledCode, thumbnailDataUrl })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 1500)
  }, [compiledCode, saveFavorite])

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
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden border border-white/10 bg-black",
        "w-full h-auto max-h-full aspect-video"
      )}
    >
      <div
        className={cn(
          "absolute -inset-[1px] rounded-xl transition-opacity duration-500 pointer-events-none z-0",
          "bg-gradient-to-br from-[#44ff88]/20 via-transparent to-[#cc44ff]/20",
          isFlashing ? "opacity-100" : "opacity-30"
        )}
      />

      {isFlashing && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none z-10 animate-ping" />
      )}

      <canvas
        ref={canvasRef}
        className="relative z-1 w-full h-full bg-black block"
      />

      <div className={cn(
        "absolute top-2 right-2 z-20 flex gap-1",
        "opacity-0 group-hover:opacity-100 transition-opacity"
      )}>
        <button
          type="button"
          onClick={handleSaveToFavorites}
          className={cn(
            "p-1.5 border rounded-lg transition-colors",
            isSaved
              ? "bg-pink-900/40 border-pink-400/40 text-pink-400"
              : "bg-black/60 hover:bg-black/80 border-white/10 text-white/50"
          )}
          title="Save to favorites"
        >
          <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 bg-black/60 hover:bg-black/80 border border-white/10 rounded-lg text-white/50"
          title="Toggle fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          {OUTPUT_BUFFERS.map((buf) => (
            <button
              key={buf}
              type="button"
              onClick={() => setEditingOutput(buf as OutputBuffer)}
              className={cn(
                "font-mono text-[8px] px-1.5 py-0.5 rounded transition-colors uppercase",
                editingOutput === buf
                  ? "bg-white/15 text-white/70"
                  : "text-white/25 hover:text-white/50"
              )}
            >
              {buf}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setGridView(!gridView)}
            className={cn(
              "p-0.5 ml-1 rounded transition-colors",
              gridView ? "text-green-400/80" : "text-white/25 hover:text-white/50"
            )}
            title="Toggle 2×2 grid view"
          >
            <LayoutGrid className="w-3 h-3" />
          </button>
        </div>
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
