"use client"

// Panel lateral de detalle: pad seleccionado, lista de activos y faders globales

import { useMemo } from "react"
import { CATEGORY_COLORS, getFunctionDef } from "@/lib/hydra-registry"
import { useChainStore, selectDetailPad } from "@/stores/chain-store"
import { PadParamPanel } from "@/components/launchpad/param-slider"
import { GlobalFaders } from "@/components/launchpad/global-faders"

export function ParamPanel() {
  const activePads = useChainStore((s) => s.activePads)
  const selectSlot = useChainStore((s) => s.selectSlot)
  const detailPad = useChainStore(selectDetailPad)

  const otherActivePads = useMemo(() => {
    if (!detailPad) return activePads
    return activePads.filter((p) => p.instanceId !== detailPad.instanceId)
  }, [activePads, detailPad])

  return (
    <aside
      className="min-h-0 overflow-y-auto glass-card rounded-xl border border-white/5 p-3 flex flex-col gap-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider shrink-0">
        Parameters
      </p>

      {detailPad ? (
        <div className="flex flex-col gap-3">
          <PadParamPanel pad={detailPad} />
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-white/20 font-mono text-[10px] text-center">
          no pad selected
          <br />
          <span className="text-white/10">activate or select a pad</span>
        </div>
      )}

      {otherActivePads.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider">
            Active ({activePads.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {otherActivePads
              .sort((a, b) => a.activatedAt - b.activatedAt)
              .map((pad) => {
                const def = getFunctionDef(pad.functionId)
                const color = CATEGORY_COLORS[pad.category]
                return (
                  <button
                    key={pad.instanceId}
                    type="button"
                    onClick={() => selectSlot(pad.instanceId)}
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded border transition-colors hover:bg-white/5"
                    style={{
                      color,
                      backgroundColor: `${color}15`,
                      borderColor: `${color}30`,
                    }}
                  >
                    {def?.label ?? pad.functionId}
                  </button>
                )
              })}
          </div>
        </div>
      )}

      <GlobalFaders />
    </aside>
  )
}
