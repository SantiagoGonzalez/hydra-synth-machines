"use client"

// Faders globales del launchpad (UI local, sin cablear al compilador aún)

import { useState } from "react"

const GLOBAL_FADERS = [
  { id: "speed", label: "SPEED", min: 0, max: 3, step: 0.05, default: 1 },
  { id: "brightness", label: "BRIGHT", min: -1, max: 1, step: 0.01, default: 0 },
  { id: "decay", label: "DECAY", min: 0, max: 1, step: 0.01, default: 0 },
  { id: "amount", label: "AMOUNT", min: 0, max: 1, step: 0.01, default: 0.5 },
] as const

type GlobalFaderId = (typeof GLOBAL_FADERS)[number]["id"]

interface GlobalFaderConfig {
  id: string
  label: string
  min: number
  max: number
  step: number
  default: number
}

interface GlobalFaderProps {
  fader: GlobalFaderConfig
  value: number
  onChange: (value: number) => void
}

function GlobalFader({ fader, value, onChange }: GlobalFaderProps) {
  const pct = ((value - fader.min) / (fader.max - fader.min)) * 100

  return (
    <div className="flex flex-col gap-1">
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
  const [globalFaders, setGlobalFaders] = useState<Record<GlobalFaderId, number>>(
    Object.fromEntries(GLOBAL_FADERS.map((f) => [f.id, f.default])) as Record<
      GlobalFaderId,
      number
    >
  )

  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
      <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider">Global</p>
      <div className="flex flex-col gap-3">
        {GLOBAL_FADERS.map((fader) => (
          <GlobalFader
            key={fader.id}
            fader={fader}
            value={globalFaders[fader.id]}
            onChange={(val) => setGlobalFaders((prev) => ({ ...prev, [fader.id]: val }))}
          />
        ))}
      </div>
    </div>
  )
}
