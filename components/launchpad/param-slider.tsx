"use client"

// Panel de controles de parámetros para un pad activo, con sliders escalar/fn por parámetro

import { useCallback, useRef, useState } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import {
  CATEGORY_COLORS,
  getFunctionDef,
  type HydraParam,
} from "@/lib/hydra-registry"
import { SourceSelector } from "@/components/launchpad/source-selector"
import {
  isParamFn,
  scalarPreview,
  DEFAULT_FN_VALUE,
  type ParamValue,
  type FnShape,
} from "@/lib/param-value"
import { useChainStore, type ActivePad } from "@/stores/chain-store"
import { cn } from "@/lib/utils"

interface ParamSliderProps {
  param: HydraParam
  value: ParamValue
  color: string
  onChange: (value: ParamValue) => void
}

const FN_SHAPES: FnShape[] = ["sin", "cos", "tan", "linear"]

function SingleParamSlider({ param, value, color, onChange }: ParamSliderProps) {
  const rafRef = useRef<number | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  const isFn = isParamFn(value)
  const scalarVal = scalarPreview(value, param.default)

  const handleScalarChange = useCallback(
    ([newVal]: number[]) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        onChange(newVal)
        rafRef.current = null
      })
    },
    [onChange]
  )

  const handleFnFieldChange = useCallback(
    (field: "freq" | "amp" | "offset", val: number) => {
      const base = isParamFn(value) ? value : { ...DEFAULT_FN_VALUE, offset: param.default }
      onChange({ ...base, [field]: val })
    },
    [onChange, value, param.default]
  )

  const toggleMode = useCallback(() => {
    if (isFn) {
      onChange(scalarVal)
    } else {
      onChange({ ...DEFAULT_FN_VALUE, offset: typeof value === "number" ? value : param.default })
    }
  }, [isFn, onChange, scalarVal, value, param.default])

  const displayValue = Math.round(scalarVal * 1000) / 1000

  const commitDraft = useCallback(() => {
    if (draft === null || isFn) return
    const parsed = Number(draft)
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(param.max, Math.max(param.min, parsed))
      onChange(clamped)
    }
    setDraft(null)
  }, [draft, onChange, param.max, param.min, isFn])

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider truncate">
          {param.name}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleMode}
            className={cn(
              "font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider transition-colors",
              isFn
                ? "border-yellow-400/40 text-yellow-400/80 bg-yellow-400/10"
                : "border-white/10 text-white/25 hover:text-white/50"
            )}
            title={isFn ? "Switch to scalar" : "Switch to fn(time)"}
          >
            {isFn ? "fn" : "#"}
          </button>
          {!isFn && (
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
          )}
        </div>
      </div>

      {isFn && isParamFn(value) ? (
        <div className="flex flex-col gap-2 pl-1 border-l border-white/10">
          <div className="flex gap-1 flex-wrap">
            {FN_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => onChange({ ...value, shape })}
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase",
                  value.shape === shape
                    ? "border-white/30 text-white/60 bg-white/10"
                    : "border-white/5 text-white/20 hover:text-white/40"
                )}
              >
                {shape}
              </button>
            ))}
          </div>
          {(["freq", "amp", "offset"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span className="font-mono text-[7px] text-white/25 uppercase">{field}</span>
                <span className="font-mono text-[7px] text-white/40 tabular-nums">
                  {Math.round(value[field] * 1000) / 1000}
                </span>
              </div>
              <SliderPrimitive.Root
                className="relative flex w-full touch-none select-none items-center h-3"
                min={field === "freq" ? 0.01 : field === "amp" ? -5 : -5}
                max={field === "freq" ? 10 : field === "amp" ? 5 : 5}
                step={field === "freq" ? 0.01 : 0.05}
                value={[value[field]]}
                onValueChange={([v]) => handleFnFieldChange(field, v)}
              >
                <SliderPrimitive.Track className="relative h-0.5 w-full grow rounded-full bg-white/10">
                  <SliderPrimitive.Range
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: `${color}88` }}
                  />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                  className="block h-2.5 w-2.5 rounded-full border border-white/30"
                  style={{ backgroundColor: color }}
                />
              </SliderPrimitive.Root>
            </div>
          ))}
        </div>
      ) : (
        <SliderPrimitive.Root
          className="relative flex w-full touch-none select-none items-center h-4"
          orientation="horizontal"
          min={param.min}
          max={param.max}
          step={param.step}
          value={[scalarVal]}
          onValueChange={handleScalarChange}
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
      )}
    </div>
  )
}

interface PadParamPanelProps {
  pad: ActivePad
  isArmed?: boolean
}

/** Panel de parámetros para un pad concreto (activo, seleccionado o armado) */
export function PadParamPanel({ pad, isArmed = false }: PadParamPanelProps) {
  const updateParam = useChainStore((s) => s.updateParam)
  const updateSecondarySource = useChainStore((s) => s.updateSecondarySource)
  const updateSecondaryParam = useChainStore((s) => s.updateSecondaryParam)
  const toggleBypass = useChainStore((s) => s.toggleBypass)
  const padSlots = useChainStore((s) => s.padSlots)
  const def = getFunctionDef(pad.functionId)

  if (!def) return null

  const isActiveSlot = padSlots.some((s) => s.instanceId === pad.instanceId && s.isActive)

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
  const selectedSecDef = selectedSourceId ? getFunctionDef(selectedSourceId) : undefined

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-mono text-[10px] font-semibold",
            isArmed && "text-yellow-400/90",
            pad.isBypassed && "line-through opacity-50"
          )}
          style={!isArmed ? { color: mainColor } : undefined}
        >
          {def.label}{instanceLabel}
        </span>
        {isActiveSlot && (
          <button
            type="button"
            onClick={() => toggleBypass(pad.instanceId)}
            className={cn(
              "font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider transition-colors shrink-0",
              pad.isBypassed
                ? "border-amber-400/50 text-amber-300 bg-amber-400/10"
                : "border-white/10 text-white/25 hover:text-white/50"
            )}
            title={pad.isBypassed ? "Re-enable pad in chain" : "Bypass pad (keeps position and params)"}
          >
            {pad.isBypassed ? "bypassed" : "bypass"}
          </button>
        )}
      </div>

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
          <SourceSelector
            key={pad.instanceId}
            appliedSourceId={selectedSourceId}
            onApply={(sourceId) => updateSecondarySource(pad.instanceId, sourceId)}
          />

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
