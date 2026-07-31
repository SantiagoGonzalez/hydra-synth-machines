"use client"

// Panel de controles de parámetros para un pad activo, con sliders escalar/fn por parámetro

import { useCallback, useEffect, useRef, useState } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { type HydraParam } from "@/lib/hydra-registry"
import { FN_SHAPES, isParamFn, isParamAudio, scalarPreview, DEFAULT_FN_VALUE, DEFAULT_AUDIO_VALUE, DEFAULT_AUDIO_BINS, type ParamValue } from "@/lib/param-value"
import { FN_FIELD_RANGES } from "@/lib/launchpad-controls"
import { cn } from "@/lib/utils"

interface ParamSliderProps {
  param: HydraParam
  value: ParamValue
  color: string
  controlId: string
  fnControlIds: Record<"freq" | "amp" | "offset", string>
  isFocusActive: boolean
  focusedControlId: string | null
  onChange: (value: ParamValue) => void
}

export type { ParamSliderProps }

export function SingleParamSlider({
  param,
  value,
  color,
  controlId,
  fnControlIds,
  isFocusActive,
  focusedControlId,
  onChange,
}: ParamSliderProps) {
  const rafRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef(false)
  const [draft, setDraft] = useState<string | null>(null)
  const isFn = isParamFn(value)
  const isAudio = isParamAudio(value)
  const scalarVal = scalarPreview(value, param.default)
  const isFocused =
    isFocusActive &&
    (focusedControlId === controlId || Object.values(fnControlIds).includes(focusedControlId ?? ""))

  useEffect(() => {
    if (isFocused) containerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [isFocused])

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

  const setScalarMode = useCallback(() => {
    if (!isFn && !isAudio) return
    onChange(scalarVal)
  }, [isFn, isAudio, onChange, scalarVal])

  const setFnMode = useCallback(() => {
    if (isFn) return
    onChange({ ...DEFAULT_FN_VALUE, offset: scalarVal })
  }, [isFn, onChange, scalarVal])

  const setAudioMode = useCallback(() => {
    if (isAudio) return
    onChange({ ...DEFAULT_AUDIO_VALUE, offset: scalarVal })
  }, [isAudio, onChange, scalarVal])

  const handleAudioFieldChange = useCallback(
    (field: "bin" | "scale" | "offset", val: number) => {
      const base = isParamAudio(value) ? value : { ...DEFAULT_AUDIO_VALUE, offset: param.default }
      onChange({ ...base, [field]: val })
    },
    [onChange, value, param.default]
  )

  const displayValue = Math.round(scalarVal * 1000) / 1000

  const commitDraft = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current = false
      return
    }
    if (draft === null || isFn || isAudio) return
    const parsed = Number(draft)
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(param.max, Math.max(param.min, parsed))
      onChange(clamped)
    }
    setDraft(null)
  }, [draft, onChange, param.max, param.min, isFn, isAudio])

  return (
    <div
      ref={containerRef}
      data-control-id={controlId}
      className={cn(
        "flex flex-col gap-1 w-full rounded transition-shadow",
        isFocusActive && focusedControlId === controlId && "ring-1 ring-inset ring-yellow-300/80"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider truncate">
          {param.name}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={setScalarMode}
            className={cn(
              "font-mono text-[11px] min-h-7 min-w-7 px-1.5 py-1 rounded border uppercase tracking-wider transition-colors",
              !isFn && !isAudio
                ? "border-white/30 text-white/80 bg-white/10"
                : "border-white/20 text-white/70 hover:text-white/90"
            )}
            title="Scalar value"
          >
            #
          </button>
          <button
            type="button"
            onClick={setFnMode}
            className={cn(
              "font-mono text-[11px] min-h-7 min-w-7 px-1.5 py-1 rounded border uppercase tracking-wider transition-colors",
              isFn
                ? "border-yellow-400/50 text-yellow-400 bg-yellow-400/20"
                : "border-white/20 text-white/70 hover:text-white/90"
            )}
            title="fn(time) animation"
          >
            fn
          </button>
          <button
            type="button"
            onClick={setAudioMode}
            className={cn(
              "font-mono text-[11px] min-h-7 min-w-7 px-1.5 py-1 rounded border uppercase tracking-wider transition-colors",
              isAudio
                ? "border-green-400/50 text-green-400 bg-green-400/20"
                : "border-white/20 text-white/70 hover:text-white/90"
            )}
            title="Audio-reactive (a.fft)"
          >
            ♪
          </button>
          {!isFn && !isAudio && (
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
                if (e.key === "Escape") {
                  e.preventDefault()
                  cancelRef.current = true
                  setDraft(null)
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
              className="w-14 font-mono text-[11px] text-white/80 tabular-nums bg-white/5 border border-white/10 rounded px-1 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-white/30"
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
            <div
              key={field}
              data-control-id={fnControlIds[field]}
              className={cn(
                "flex flex-col gap-0.5 rounded transition-shadow",
                isFocusActive &&
                  focusedControlId === fnControlIds[field] &&
                  "ring-1 ring-inset ring-yellow-300/80"
              )}
            >
              <div className="flex justify-between">
                <span className="font-mono text-[9px] text-white/60 uppercase">{field}</span>
                <span className="font-mono text-[9px] text-white/70 tabular-nums">
                  {Math.round(value[field] * 1000) / 1000}
                </span>
              </div>
              <SliderPrimitive.Root
                className="relative flex w-full touch-none select-none items-center h-3"
                min={FN_FIELD_RANGES[field].min}
                max={FN_FIELD_RANGES[field].max}
                step={FN_FIELD_RANGES[field].step}
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
      ) : isAudio && isParamAudio(value) ? (
        <div className="flex flex-col gap-2 pl-1 border-l border-green-400/20">
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: DEFAULT_AUDIO_BINS }, (_, i) => i).map((bin) => (
              <button
                key={bin}
                type="button"
                onClick={() => handleAudioFieldChange("bin", bin)}
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded border",
                  value.bin === bin
                    ? "border-green-400/40 text-green-300 bg-green-400/10"
                    : "border-white/5 text-white/20 hover:text-white/40"
                )}
              >
                {bin}
              </button>
            ))}
          </div>
          {(["scale", "offset"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span className="font-mono text-[9px] text-white/60 uppercase">{field}</span>
                <span className="font-mono text-[9px] text-white/70 tabular-nums">
                  {Math.round(value[field] * 1000) / 1000}
                </span>
              </div>
              <SliderPrimitive.Root
                className="relative flex w-full touch-none select-none items-center h-3"
                min={FN_FIELD_RANGES[field === "scale" ? "amp" : "offset"].min}
                max={FN_FIELD_RANGES[field === "scale" ? "amp" : "offset"].max}
                step={FN_FIELD_RANGES[field === "scale" ? "amp" : "offset"].step}
                value={[value[field]]}
                onValueChange={([v]) => handleAudioFieldChange(field, v)}
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
