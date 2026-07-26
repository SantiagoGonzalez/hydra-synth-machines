"use client"

// Selector de fuente secundaria con selección diferida: draft local + Apply/Cancel

import { useEffect, useRef } from "react"
import { CATEGORY_COLORS, getSourceOptions, type HydraFunctionDef } from "@/lib/hydra-registry"
import { cn } from "@/lib/utils"
import { useChainStore } from "@/stores/chain-store"

const SOURCE_COLOR = CATEGORY_COLORS["source"]

interface SourceSelectorProps {
  /** Fuente actualmente aplicada (la que compila) */
  appliedSourceId?: string
  /** Confirma el draft: recién acá se recompila */
  onApply: (sourceId: string) => void
  controlId: string
  isFocusActive: boolean
}

interface SourceChipProps {
  option: HydraFunctionDef
  isApplied: boolean
  isDraft: boolean
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

function SourceChip({ option, isApplied, isDraft, onClick }: SourceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-mono text-[11px] uppercase tracking-wider px-2 py-1.5 min-h-[28px] rounded border transition-colors",
        isDraft && "border-dashed border-yellow-400/70 text-yellow-300 bg-yellow-400/10"
      )}
      style={
        isDraft
          ? undefined
          : isApplied
            ? {
                borderColor: SOURCE_COLOR,
                color: SOURCE_COLOR,
                backgroundColor: `${SOURCE_COLOR}22`,
              }
            : {
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.35)",
              }
      }
      title={isDraft ? "Draft (pending Apply)" : option.description}
    >
      {option.label}
    </button>
  )
}

/** Grilla agrupada de fuentes (generadores vs buffers src:oN); montar con key={instanceId} para descartar el draft al cambiar de pad */
export function SourceSelector({
  appliedSourceId,
  onApply,
  controlId,
  isFocusActive,
}: SourceSelectorProps) {
  const draftId = useChainStore((state) => state.sourceDraftId)
  const setSourceDraft = useChainStore((state) => state.setSourceDraft)
  const containerRef = useRef<HTMLDivElement>(null)
  const options = getSourceOptions()
  const generators = options.filter((o) => !o.id.startsWith("src:"))
  const buffers = options.filter((o) => o.id.startsWith("src:"))

  useEffect(() => {
    if (isFocusActive) containerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [isFocusActive])

  const handlePick = (id: string, applyImmediately: boolean) => {
    const nextDraftId = id === appliedSourceId ? null : id
    setSourceDraft(nextDraftId)
    if (applyImmediately && nextDraftId) {
      onApply(nextDraftId)
      setSourceDraft(null)
    }
  }

  const renderGroup = (label: string, group: HydraFunctionDef[], cols: string) => (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">{label}</span>
      <div className={cn("grid gap-1", cols)}>
        {group.map((src) => (
          <SourceChip
            key={src.id}
            option={src}
            isApplied={src.id === appliedSourceId}
            isDraft={src.id === draftId}
            onClick={(event) => handlePick(src.id, event.ctrlKey)}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div
      ref={containerRef}
      data-control-id={controlId}
      className={cn(
        "flex flex-col gap-2 rounded transition-shadow",
        isFocusActive && "ring-1 ring-inset ring-yellow-300/80"
      )}
    >
      {renderGroup("generators", generators, "grid-cols-3")}
      {renderGroup("buffers", buffers, "grid-cols-4")}

      {draftId !== null && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              onApply(draftId)
              setSourceDraft(null)
            }}
            className="flex-1 font-mono text-[10px] uppercase tracking-wider px-2 py-1.5 rounded bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 transition-colors"
          >
            Apply source
          </button>
          <button
            type="button"
            onClick={() => setSourceDraft(null)}
            className="font-mono text-[10px] uppercase tracking-wider px-2 py-1.5 rounded border border-white/10 text-white/40 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
