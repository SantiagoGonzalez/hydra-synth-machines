"use client"

// Panel lateral de detalle: cadena ordenada, pad seleccionado/armado y faders globales

import { useChainStore, selectDetailPad } from "@/stores/chain-store"
import { ChainChips } from "@/components/launchpad/chain-chips"
import { PadParamPanel } from "@/components/launchpad/pad-param-panel"
import { GlobalFaders } from "@/components/launchpad/global-faders"

export function ParamPanel() {
  const activePads = useChainStore((s) => s.activePads)
  const armedSlotId = useChainStore((s) => s.armedSlotId)
  const selectSlot = useChainStore((s) => s.selectSlot)
  const applyArmedSlot = useChainStore((s) => s.applyArmedSlot)
  const detailPad = useChainStore(selectDetailPad)
  const isArmed = detailPad != null && armedSlotId === detailPad.instanceId

  return (
    <aside
      className="min-h-0 overflow-y-auto glass-card rounded-xl border border-white/5 p-3 flex flex-col gap-4 scrollbar-thin"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider shrink-0">
        Parameters
      </p>

      {activePads.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider">
            Chain ({activePads.length})
          </p>
          <ChainChips
            pads={activePads}
            highlightId={detailPad?.instanceId}
            onChipClick={selectSlot}
          />
        </div>
      )}

      {detailPad ? (
        <div className="flex flex-col gap-3">
          {isArmed && (
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded border border-yellow-400/30 bg-yellow-400/10">
              <span className="font-mono text-[9px] text-yellow-400/90 uppercase tracking-wider">
                Armed
              </span>
              <button
                type="button"
                onClick={applyArmedSlot}
                className="font-mono text-[9px] px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 transition-colors uppercase tracking-wider"
              >
                Apply
              </button>
            </div>
          )}
          <PadParamPanel pad={detailPad} isArmed={isArmed} />
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-white/20 font-mono text-[10px] text-center">
          no pad selected
          <br />
          <span className="text-white/10">activate or select a pad</span>
        </div>
      )}

      <GlobalFaders />
    </aside>
  )
}
