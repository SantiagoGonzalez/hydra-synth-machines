"use client"

// Controles opt-in de micrófono y visualizador FFT del motor Hydra

import { useChainStore } from "@/stores/chain-store"
import { cn } from "@/lib/utils"

export function AudioControls() {
  const audioEnabled = useChainStore((s) => s.audioEnabled)
  const fftVisible = useChainStore((s) => s.fftVisible)
  const setAudioEnabled = useChainStore((s) => s.setAudioEnabled)
  const setFftVisible = useChainStore((s) => s.setFftVisible)

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
      <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider">Audio</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={cn(
            "font-mono text-[10px] min-h-7 px-2.5 py-1 rounded border uppercase tracking-wider transition-colors",
            audioEnabled
              ? "border-red-400/50 text-red-300 bg-red-400/15"
              : "border-white/20 text-white/60 hover:text-white/80"
          )}
          title={
            audioEnabled
              ? "Mic active — click to disable audio input"
              : "Enable microphone (opt-in)"
          }
        >
          {audioEnabled ? "Mic on" : "Mic"}
        </button>
        <button
          type="button"
          disabled={!audioEnabled}
          onClick={() => setFftVisible(!fftVisible)}
          className={cn(
            "font-mono text-[10px] min-h-7 px-2.5 py-1 rounded border uppercase tracking-wider transition-colors",
            !audioEnabled && "opacity-40 cursor-not-allowed",
            fftVisible && audioEnabled
              ? "border-green-400/50 text-green-300 bg-green-400/15"
              : "border-white/20 text-white/60 hover:text-white/80"
          )}
          title={
            audioEnabled
              ? "Toggle FFT visualizer"
              : "Enable mic first"
          }
        >
          FFT
        </button>
      </div>
    </div>
  )
}
