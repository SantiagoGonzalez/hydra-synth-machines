"use client"

// Contenedor principal del launchpad: grilla 4x4 de pads con faders globales y panel de parámetros

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Shuffle } from "lucide-react"
import { HYDRA_REGISTRY, CATEGORY_COLORS, CATEGORY_LABELS, type HydraCategory } from "@/lib/hydra-registry"
import { useChainStore } from "@/stores/chain-store"
import { Pad } from "@/components/launchpad/pad"
import { PadParamPanel } from "@/components/launchpad/param-slider"
import { cn } from "@/lib/utils"

// Orden fijo de pads en el grid (4x4 = 16 celdas, 20 funciones en el registro → primeras 16)
const GRID_FUNCTIONS = HYDRA_REGISTRY.slice(0, 16).map((fn) => fn.id)

// Faders globales mapeados a parámetros del store
const GLOBAL_FADERS = [
  { id: "speed", label: "SPEED", min: 0, max: 3, step: 0.05, default: 1 },
  { id: "brightness", label: "BRIGHT", min: -1, max: 1, step: 0.01, default: 0 },
  { id: "decay", label: "DECAY", min: 0, max: 1, step: 0.01, default: 0 },
  { id: "amount", label: "AMOUNT", min: 0, max: 1, step: 0.01, default: 0.5 },
] as const

type GlobalFaderId = (typeof GLOBAL_FADERS)[number]["id"]

const CATEGORY_ORDER: HydraCategory[] = ["source", "geometry", "color", "modulate", "blend"]

export function MachineLayout() {
  const activePads = useChainStore((s) => s.activePads)
  const togglePad = useChainStore((s) => s.togglePad)
  const activatePad = useChainStore((s) => s.activatePad)
  const deactivatePad = useChainStore((s) => s.deactivatePad)
  const clearAll = useChainStore((s) => s.clearAll)

  const [padModes, setPadModes] = useState<Record<string, "toggle" | "momentary">>({})
  const [globalFaders, setGlobalFaders] = useState<Record<GlobalFaderId, number>>(
    Object.fromEntries(GLOBAL_FADERS.map((f) => [f.id, f.default])) as Record<GlobalFaderId, number>
  )
  const [selectedCategory, setSelectedCategory] = useState<HydraCategory | null>(null)

  const getModeFor = useCallback(
    (functionId: string): "toggle" | "momentary" => padModes[functionId] ?? "toggle",
    [padModes]
  )

  const handleModeChange = useCallback((functionId: string, mode: "toggle" | "momentary") => {
    setPadModes((prev) => ({ ...prev, [functionId]: mode }))
  }, [])

  const handleMomentaryStart = useCallback(
    (functionId: string) => {
      activatePad(functionId, "momentary")
    },
    [activatePad]
  )

  const handleMomentaryEnd = useCallback(
    (functionId: string) => {
      const pad = activePads.find((p) => p.functionId === functionId && p.mode === "momentary")
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

    // Pequeño delay entre activaciones para mantener orden correcto de timestamps
    activatePad(randSrc.id)
    setTimeout(() => activatePad(randT1.id), 10)
    setTimeout(() => activatePad(randT2.id), 20)
  }, [clearAll, activatePad])

  // Filtrar pads visibles según categoría seleccionada
  const visibleFunctions = selectedCategory
    ? HYDRA_REGISTRY.filter((fn) => fn.category === selectedCategory).slice(0, 16)
    : HYDRA_REGISTRY.slice(0, 16)

  // Pads activos con parámetros propios o con fuente secundaria configurable
  const activePadsWithParams = activePads.filter((p) => {
    const fn = HYDRA_REGISTRY.find((fn) => fn.id === p.functionId)
    return (fn?.params.length ?? 0) > 0 || !!fn?.secondarySourceId
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Category filter bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded border transition-colors",
            selectedCategory === null
              ? "border-white/40 text-white bg-white/10"
              : "border-white/10 text-white/30 hover:border-white/20"
          )}
        >
          ALL
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={cn(
              "font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded border transition-colors"
            )}
            style={
              selectedCategory === cat
                ? {
                    borderColor: CATEGORY_COLORS[cat],
                    color: CATEGORY_COLORS[cat],
                    backgroundColor: `${CATEGORY_COLORS[cat]}22`,
                  }
                : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
            }
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}

        <div className="ml-auto flex gap-1">
          <button
            onClick={handleRandomize}
            title="Random patch"
            className="p-1.5 rounded border border-white/10 text-white/30 hover:border-white/30 hover:text-white/60 transition-colors"
          >
            <Shuffle className="w-3 h-3" />
          </button>
          <button
            onClick={clearAll}
            title="Clear all (Tranquilizador)"
            className="p-1.5 rounded border border-white/10 text-white/30 hover:border-red-500/40 hover:text-red-400/60 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4×4 Pad Grid */}
      <div
        className="glass-card p-3 rounded-xl border border-white/5"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        <div className="grid grid-cols-4 gap-2">
          {visibleFunctions.map((fn) => {
            const activePad = activePads.find((p) => p.functionId === fn.id)
            const isActive = !!activePad
            const mode = getModeFor(fn.id)

            return (
              <Pad
                key={fn.id}
                functionDef={fn}
                isActive={isActive}
                mode={mode}
                onToggle={() => togglePad(fn.id)}
                onMomentaryStart={() => handleMomentaryStart(fn.id)}
                onMomentaryEnd={() => handleMomentaryEnd(fn.id)}
                onModeChange={(m) => handleModeChange(fn.id, m)}
              />
            )
          })}

          {/* Relleno si hay menos de 16 funciones visibles en el filtro */}
          {visibleFunctions.length < 16 &&
            Array.from({ length: 16 - visibleFunctions.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-lg border border-white/5 bg-black/20 min-h-[72px]"
              />
            ))}
        </div>

        {/* Global faders row */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5">
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

// ── Global Fader ────────────────────────────────────────────────────────────

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
