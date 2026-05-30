"use client"

// Panel de controles de parámetros para un pad activo, con sliders verticales por parámetro

import { useCallback, useRef } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { CATEGORY_COLORS, getFunctionDef, type HydraParam } from "@/lib/hydra-registry"
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

  // Debounce al siguiente frame de animación para garantizar 60fps
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

  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      {/* Nombre del parámetro */}
      <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider truncate max-w-[40px] text-center">
        {param.name}
      </span>

      {/* Slider vertical */}
      <SliderPrimitive.Root
        className="relative flex flex-col items-center touch-none select-none h-20 w-4"
        orientation="vertical"
        min={param.min}
        max={param.max}
        step={param.step}
        value={[value]}
        onValueChange={handleChange}
      >
        <SliderPrimitive.Track className="relative w-1 h-full grow rounded-full bg-white/10">
          <SliderPrimitive.Range
            className="absolute bottom-0 w-full rounded-full transition-none"
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

      {/* Valor actual */}
      <span className="font-mono text-[8px] text-white/50 tabular-nums">
        {displayValue}
      </span>
    </div>
  )
}

interface PadParamPanelProps {
  pad: ActivePad
}

/** Panel de parámetros para un pad activo concreto */
export function PadParamPanel({ pad }: PadParamPanelProps) {
  const updateParam = useChainStore((s) => s.updateParam)
  const def = getFunctionDef(pad.functionId)

  if (!def || def.params.length === 0) {
    return (
      <div className="flex items-center justify-center h-12 text-white/20 font-mono text-[10px]">
        no params
      </div>
    )
  }

  const color = CATEGORY_COLORS[pad.category]

  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-mono text-[10px] font-semibold mb-1"
        style={{ color }}
      >
        {def.label}
      </span>
      <div className="flex gap-3 items-end">
        {def.params.map((param) => (
          <SingleParamSlider
            key={param.name}
            param={param}
            value={pad.params[param.name] ?? param.default}
            color={color}
            onChange={(val) => updateParam(pad.instanceId, param.name, val)}
          />
        ))}
      </div>
    </div>
  )
}
