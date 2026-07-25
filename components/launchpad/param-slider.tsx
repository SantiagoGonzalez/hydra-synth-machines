"use client"

// Panel de controles de parámetros para un pad activo, con sliders horizontales por parámetro

import { useCallback, useRef, useState } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { CATEGORY_COLORS, getFunctionDef, getSourceOptions, type HydraParam } from "@/lib/hydra-registry"
import { useChainStore, type ActivePad } from "@/stores/chain-store"
import { cn } from "@/lib/utils"

interface ParamSliderProps {
  param: HydraParam
  value: number
  color: string
  onChange: (value: number) => void
}

function SingleParamSlider({ param, value, color, onChange }: ParamSliderProps) {
  const rafRef = useRef<number | null>(null)
  const [draft, setDraft] = useState<string | null>(null)

  const handleChange = useCallback(
    ([newVal]: number[]) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(() => {
        onChange(newVal)
        rafRef.current = null
      })
    },
    [onChange]
  )

  const displayValue = Math.round(value * 1000) / 1000

  const commitDraft = useCallback(() => {
    if (draft === null) return
    const parsed = Number(draft)
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(param.max, Math.max(param.min, parsed))
      onChange(clamped)
    }
    setDraft(null)
  }, [draft, onChange, param.max, param.min])

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider truncate">
          {param.name}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={draft ?? String(displayValue)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commitDraft()
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          className="w-14 font-mono text-[8px] text-white/50 tabular-nums bg-white/5 border border-white/10 rounded px-1 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center h-4"
        orientation="horizontal"
        min={param.min}
        max={param.max}
        step={param.step}
        value={[value]}
        onValueChange={handleChange}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-white/10">
          <SliderPrimitive.Range
            className="absolute h-full rounded-full transition-none"
            style={{ backgroundColor: color }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block h-3 w-3 rounded-full border border-white/30 shadow",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50",
            "transition-transform hover:scale-110 active:scale-95"
          )}
          style={{ backgroundColor: color }}
        />
      </SliderPrimitive.Root>
    </div>
  )
}

interface PadParamPanelProps {
  pad: ActivePad
}

/** Panel de parámetros para un pad activo concreto */
export function PadParamPanel({ pad }: PadParamPanelProps) {
  const updateParam = useChainStore((s) => s.updateParam)
  const updateSecondarySource = useChainStore((s) => s.updateSecondarySource)
  const updateSecondaryParam = useChainStore((s) => s.updateSecondaryParam)
  const padSlots = useChainStore((s) => s.padSlots)
  const def = getFunctionDef(pad.functionId)

  if (!def) return null

  const activeOfSameType = padSlots.filter((s) => s.functionId === pad.functionId && s.isActive)
  const instanceIndex = activeOfSameType.findIndex((s) => s.instanceId === pad.instanceId)
  const instanceLabel =
    activeOfSameType.length > 1 && instanceIndex >= 0 ? ` #${instanceIndex + 1}` : ""

  const hasMainParams = def.params.length > 0
  const hasSecondary = !!def.secondarySourceId
  const selectedSourceId = pad.secondarySourceId ?? def.secondarySourceId

  if (!hasMainParams && !hasSecondary) {
    return (
      <div className="flex items-center justify-center h-12 text-white/20 font-mono text-[10px]">
        no params
      </div>
    )
  }

  const mainColor = CATEGORY_COLORS[pad.category]
  const sourceColor = CATEGORY_COLORS["source"]
  const sourceOptions = getSourceOptions()
  const selectedSecDef = selectedSourceId ? getFunctionDef(selectedSourceId) : undefined

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-semibold" style={{ color: mainColor }}>
        {def.label}{instanceLabel}
      </span>

      {hasMainParams && (
        <div className="flex flex-col gap-3">
          {def.params.map((param) => (
            <SingleParamSlider
              key={param.name}
              param={param}
              value={pad.params[param.name] ?? param.default}
              color={mainColor}
              onChange={(val) => updateParam(pad.instanceId, param.name, val)}
            />
          ))}
        </div>
      )}

      {hasSecondary && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">
            source
          </span>
          <div className="flex gap-1 flex-wrap">
            {sourceOptions.map((src) => {
              const isSelected = src.id === selectedSourceId
              return (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => updateSecondarySource(pad.instanceId, src.id)}
                  className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors"
                  style={
                    isSelected
                      ? {
                          borderColor: sourceColor,
                          color: sourceColor,
                          backgroundColor: `${sourceColor}22`,
                        }
                      : {
                          borderColor: "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.25)",
                        }
                  }
                >
                  {src.label}
                </button>
              )
            })}
          </div>

          {selectedSecDef && selectedSecDef.params.length > 0 && (
            <div className="flex flex-col gap-3 mt-1">
              {selectedSecDef.params.map((param) => (
                <SingleParamSlider
                  key={param.name}
                  param={param}
                  value={pad.secondaryParams?.[param.name] ?? param.default}
                  color={`${sourceColor}99`}
                  onChange={(val) => updateSecondaryParam(pad.instanceId, param.name, val)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
