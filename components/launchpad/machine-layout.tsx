"use client"

// Contenedor principal del launchpad: secciones por categorÃ­a con grupos de pads por funciÃ³n

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Shuffle } from "lucide-react"
import { HYDRA_REGISTRY, type HydraCategory } from "@/lib/hydra-registry"
import { useChainStore } from "@/stores/chain-store"
import { SectionRow } from "@/components/launchpad/section-row"
import { PadParamPanel } from "@/components/launchpad/param-slider"
import { cn } from "@/lib/utils"

// Faders globales mapeados a parÃ¡metros del store
const GLOBAL_FADERS = [
  { id: "speed", label: "SPEED", min: 0, max: 3, step: 0.05, default: 1 },
  { id: "brightness", label: "BRIGHT", min: -1, max: 1, step: 0.01, default: 0 },
  { id: "decay", label: "DECAY", min: 0, max: 1, step: 0.01, default: 0 },
  { id: "amount", label: "AMOUNT", min: 0, max: 1, step: 0.01, default: 0.5 },
] as const

type GlobalFaderId = (typeof GLOBAL_FADERS)[number]["id"]

const CATEGORY_ORDER: HydraCategory[] = ["source", "geometry", "color", "modulate", "blend"]

export function MachineLayout() {
  const padSlots = useChainStore((s) => s.padSlots)
  const activePads = useChainStore((s) => s.activePads)
  const toggleSlot = useChainStore((s) => s.toggleSlot)
  const addSlot = useChainStore((s) => s.addSlot)
  const removeSlot = useChainStore((s) => s.removeSlot)
  const activatePad = useChainStore((s) => s.activatePad)
  const deactivatePad = useChainStore((s) => s.deactivatePad)
  const clearAll = useChainStore((s) => s.clearAll)

  const [padModes, setPadModes] = useState<Record<string, "toggle" | "momentary">>({})
  const [globalFaders, setGlobalFaders] = useState<Record<GlobalFaderId, number>>(
    Object.fromEntries(GLOBAL_FADERS.map((f) => [f.id, f.default])) as Record<GlobalFaderId, number>
  )

  const getModeFor = useCallback(
    (slotId: string): "toggle" | "momentary" => padModes[slotId] ?? "toggle",
    [padModes]
  )

  const handleModeChange = useCallback((slotId: string, mode: "toggle" | "momentary") => {
    setPadModes((prev) => ({ ...prev, [slotId]: mode }))
  }, [])

  const handleMomentaryStart = useCallback(
    (slotId: string) => {
      const slot = padSlots.find((s) => s.instanceId === slotId)
      if (slot) activatePad(slot.functionId, "momentary")
    },
    [padSlots, activatePad]
  )

  const handleMomentaryEnd = useCallback(
    (slotId: string) => {
      const pad = activePads.find((p) => p.instanceId === slotId && p.mode === "momentary")
      if (pad) deactivatePad(pad.instanceId)
    },
    [activePads, deactivatePad]
  )

  const handleRandomize = useCallback(() => {
    clearAll()
    const sources = HYDRA_REGISTRY.filter((f) => f.category === "source")
    const transforms = HYDRA_REGISTRY.filter((f) => f.category !== "source")
    const randSrc = sources[Math.floor(Math.random() * sources.length)]
    const randT1 = transforms[Math.floor(Math.random() * transforms.length)]
    const randT2 = transforms.filter((f) => f.id !== randT1.id)[
      Math.floor(Math.random() * (transforms.length - 1))
    ]
    // PequeÃ±o delay entre activaciones para mantener orden correcto de timestamps
    const srcSlot = padSlots.find((s) => s.functionId === randSrc.id && !s.isExtra)
    const t1Slot = padSlots.find((s) => s.functionId === randT1.id && !s.isExtra)
    const t2Slot = padSlots.find((s) => s.functionId === randT2.id && !s.isExtra)
    if (srcSlot) toggleSlot(srcSlot.instanceId)
    if (t1Slot) setTimeout(() => toggleSlot(t1Slot.instanceId), 10)
    if (t2Slot) setTimeout(() => toggleSlot(t2Slot.instanceId), 20)
  }, [clearAll, padSlots, toggleSlot])

  // Pads activos con parÃ¡metros propios o con fuente secundaria configurable
  const activePadsWithParams = activePads.filter((p) => {
    const fn = HYDRA_REGISTRY.find((fn) => fn.id === p.functionId)
    return (fn?.params.length ?? 0) > 0 || !!fn?.secondarySourceId
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Header con controles globales */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
          Pads
        </span>
        <div className="flex gap-1">
          <button
            onClick={handleRandomize}
            title="Random patch"
            className="p-1.5 rounded border border-white/10 text-white/30 hover:border-white/30 hover:text-white/60 transition-colors"
          >
            <Shuffle className="w-3 h-3" />
          </button>
          <button
            onClick={clearAll}
            title="Clear all"
            className="p-1.5 rounded border border-white/10 text-white/30 hover:border-red-500/40 hover:text-red-400/60 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Secciones por categorÃ­a */}
      <div
        className="glass-card p-3 rounded-xl border border-white/5 flex flex-col gap-5"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        {CATEGORY_ORDER.map((cat) => (
          <SectionRow
            key={cat}
            category={cat}
            padSlots={padSlots}
            padModes={padModes}
            onToggleSlot={toggleSlot}
            onRemoveSlot={removeSlot}
            onAddSlot={addSlot}
            onModeChange={handleModeChange}
            onMomentaryStart={handleMomentaryStart}
            onMomentaryEnd={handleMomentaryEnd}
          />
        ))}

        {/* Global faders row */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
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

      {/* Param detail panel */}
      <AnimatePresence>
        {activePadsWithParams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-xl border border-white/5 p-3 overflow-hidden"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider mb-3">
              Parameters
            </p>
            <div className="flex flex-wrap gap-5">
              {activePadsWithParams.map((pad) => (
                <PadParamPanel key={pad.instanceId} pad={pad} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// â”€â”€ Global Fader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">
        {fader.label}
      </span>
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
      <span className="font-mono text-[8px] text-white/30 tabular-nums">
        {Math.round(value * 100) / 100}
      </span>
    </div>
  )
}
