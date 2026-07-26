"use client"

// Faders globales del launchpad (UI local, sin cablear al compilador aún)

import { useEffect, useRef } from "react"
import { GLOBAL_FADERS } from "@/lib/global-faders"
import { controlId } from "@/lib/launchpad-controls"
import { useChainStore } from "@/stores/chain-store"

interface GlobalFaderProps {
  fader: (typeof GLOBAL_FADERS)[number]
  value: number
  onChange: (value: number) => void
  controlId: string
  isFocusActive: boolean
}

function GlobalFader({ fader, value, onChange, controlId: id, isFocusActive }: GlobalFaderProps) {
  const pct = ((value - fader.min) / (fader.max - fader.min)) * 100
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFocusActive) containerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [isFocusActive])

  return (
    <div
      ref={containerRef}
      data-control-id={id}
      className={`flex flex-col gap-1 rounded transition-shadow ${isFocusActive ? "ring-1 ring-inset ring-yellow-300/80" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider shrink-0">
          {fader.label}
        </span>
        <span className="font-mono text-[8px] text-white/30 tabular-nums">
          {Math.round(value * 100) / 100}
        </span>
      </div>
      <div className="relative w-full h-1 bg-white/10 rounded-full">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-white/30 transition-none"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={fader.min}
          max={fader.max}
          step={fader.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

export function GlobalFaders() {
  const globalFaders = useChainStore((state) => state.globalFaders)
  const setGlobalFader = useChainStore((state) => state.setGlobalFader)
  const focusZone = useChainStore((state) => state.focusZone)
  const focusedControlId = useChainStore((state) => state.focusedControlId)

  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
      <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider">Global</p>
      <div className="flex flex-col gap-3">
        {GLOBAL_FADERS.map((fader) => (
          <GlobalFader
            key={fader.id}
            fader={fader}
            value={globalFaders[fader.id]}
            onChange={(value) => setGlobalFader(fader.id, value)}
            controlId={controlId({ kind: "global", faderId: fader.id })}
            isFocusActive={
              focusZone === "params" &&
              focusedControlId === controlId({ kind: "global", faderId: fader.id })
            }
          />
        ))}
      </div>
    </div>
  )
}
