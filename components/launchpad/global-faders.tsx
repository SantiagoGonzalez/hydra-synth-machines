"use client"

// Faders globales del launchpad: speed/bpm vía evaluador, brightness CSS, feedback en compilador

import { useCallback, useEffect, useRef, useState } from "react"
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

const FADER_TITLES: Partial<Record<(typeof GLOBAL_FADERS)[number]["id"], string>> = {
  speed: "Speed — global Hydra time multiplier (affects fn(time) animations)",
  bpm: "BPM — global Hydra tempo (beats per minute)",
  brightness: "Brightness — master CSS filter on canvas (−1…1, 0 = normal)",
  feedback: "Feedback — blend damping when chain uses src(oN); no effect without buffer feedback",
}

function formatFaderValue(value: number, step: number): string {
  if (step >= 1) return String(Math.round(value))
  return String(Math.round(value * 1000) / 1000)
}

function GlobalFader({ fader, value, onChange, controlId: id, isFocusActive }: GlobalFaderProps) {
  const pct = ((value - fader.min) / (fader.max - fader.min)) * 100
  const containerRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef(false)
  const [draft, setDraft] = useState<string | null>(null)
  const title = FADER_TITLES[fader.id]
  const displayValue = formatFaderValue(value, fader.step)

  useEffect(() => {
    if (isFocusActive) containerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [isFocusActive])

  const commitDraft = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current = false
      return
    }
    if (draft === null) return
    const parsed = Number(draft)
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(fader.max, Math.max(fader.min, parsed))
      onChange(clamped)
    }
    setDraft(null)
  }, [draft, fader.max, fader.min, onChange])

  return (
    <div
      ref={containerRef}
      data-control-id={id}
      title={title}
      className={`flex flex-col gap-1 rounded transition-shadow ${isFocusActive ? "ring-1 ring-inset ring-yellow-300/80" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider shrink-0">
          {fader.label}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={draft ?? displayValue}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commitDraft()
              ;(e.target as HTMLInputElement).blur()
            }
            if (e.key === "Escape") {
              e.preventDefault()
              cancelRef.current = true
              setDraft(null)
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          className="w-14 font-mono text-[11px] text-white/80 tabular-nums bg-white/5 border border-white/10 rounded px-1 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-white/30"
        />
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
