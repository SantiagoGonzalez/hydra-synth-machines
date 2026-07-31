"use client"

// Bloque compuesto HEX + color picker sincronizado con sliders r/g/b

import { useCallback, useRef, useState } from "react"
import { hexToRgb, rgbToHex, type ColorInputMode } from "@/lib/color-param"
import { scalarPreview, type ParamValue } from "@/lib/param-value"
import { cn } from "@/lib/utils"

type RgbChannel = "r" | "g" | "b"

interface RgbColorControlProps {
  channels: RgbChannel[]
  mode: ColorInputMode
  values: Record<string, ParamValue>
  defaults: Record<string, number>
  onChannelChange: (channel: RgbChannel, value: number) => void
}

export function RgbColorControl({
  channels,
  mode,
  values,
  defaults,
  onChannelChange,
}: RgbColorControlProps) {
  const cancelRef = useRef(false)
  const [hexDraft, setHexDraft] = useState<string | null>(null)

  const r = scalarPreview(values.r ?? defaults.r ?? 0, defaults.r ?? 0)
  const g = scalarPreview(values.g ?? defaults.g ?? 0, defaults.g ?? 0)
  const b = scalarPreview(values.b ?? defaults.b ?? 0, defaults.b ?? 0)

  const displayHex = rgbToHex(r, g, b, mode)
  const pickerHex = rgbToHex(r, g, b, "unit")

  const applyRgb = useCallback(
    (nr: number, ng: number, nb: number) => {
      const clamp = (v: number) => (mode === "multiplier" ? Math.min(1, Math.max(0, v)) : v)
      onChannelChange("r", clamp(nr))
      onChannelChange("g", clamp(ng))
      onChannelChange("b", clamp(nb))
    },
    [mode, onChannelChange]
  )

  const commitHexDraft = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current = false
      return
    }
    if (hexDraft === null) return
    const parsed = hexToRgb(hexDraft)
    if (parsed) applyRgb(parsed.r, parsed.g, parsed.b)
    setHexDraft(null)
  }, [hexDraft, applyRgb])

  const handlePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = hexToRgb(e.target.value)
      if (parsed) applyRgb(parsed.r, parsed.g, parsed.b)
      setHexDraft(null)
    },
    [applyRgb]
  )

  const isClamped =
    mode === "multiplier" && (r > 1 || g > 1 || b > 1)

  return (
    <div className="flex flex-col gap-1.5 pb-2 border-b border-white/10">
      <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">color</span>
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 rounded border border-white/20 shrink-0"
          style={{ backgroundColor: displayHex }}
          title={isClamped ? "Swatch clamped to [0,1]" : displayHex}
        />
        <input
          type="text"
          value={hexDraft ?? displayHex}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={commitHexDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commitHexDraft()
              ;(e.target as HTMLInputElement).blur()
            }
            if (e.key === "Escape") {
              e.preventDefault()
              cancelRef.current = true
              setHexDraft(null)
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          className={cn(
            "flex-1 min-w-0 font-mono text-[11px] text-white/80 tabular-nums",
            "bg-white/5 border border-white/10 rounded px-2 py-1",
            "focus:outline-none focus:ring-1 focus:ring-white/30 uppercase"
          )}
          spellCheck={false}
        />
        <input
          type="color"
          value={pickerHex}
          onChange={handlePickerChange}
          className="h-7 w-7 rounded border border-white/20 bg-transparent cursor-pointer shrink-0 p-0"
          title="Color picker"
        />
      </div>
      {isClamped && (
        <span className="font-mono text-[8px] text-white/25">swatch clamped</span>
      )}
    </div>
  )
}
