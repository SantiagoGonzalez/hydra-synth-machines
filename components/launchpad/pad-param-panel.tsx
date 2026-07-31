"use client"

// Panel de parámetros del pad seleccionado, conectado a la capa de controles compartida.

import { CATEGORY_COLORS, getFunctionDef } from "@/lib/hydra-registry"
import { controlId } from "@/lib/launchpad-controls"
import { RgbColorControl } from "@/components/launchpad/rgb-color-control"
import { SourceSelector } from "@/components/launchpad/source-selector"
import { SingleParamSlider } from "@/components/launchpad/param-slider"
import { useChainStore, type ActivePad } from "@/stores/chain-store"
import { cn } from "@/lib/utils"

interface PadParamPanelProps {
  pad: ActivePad
  isArmed?: boolean
}

/** Presenta y actualiza los controles del pad seleccionado o armado. */
export function PadParamPanel({ pad, isArmed = false }: PadParamPanelProps) {
  const updateParam = useChainStore((state) => state.updateParam)
  const updateSecondarySource = useChainStore((state) => state.updateSecondarySource)
  const updateSecondaryParam = useChainStore((state) => state.updateSecondaryParam)
  const toggleBypass = useChainStore((state) => state.toggleBypass)
  const padSlots = useChainStore((state) => state.padSlots)
  const focusZone = useChainStore((state) => state.focusZone)
  const focusedControlId = useChainStore((state) => state.focusedControlId)
  const definition = getFunctionDef(pad.functionId)

  if (!definition) return null

  const isActiveSlot = padSlots.some((slot) => slot.instanceId === pad.instanceId && slot.isActive)
  const activeOfSameType = padSlots.filter(
    (slot) => slot.functionId === pad.functionId && slot.isActive
  )
  const instanceIndex = activeOfSameType.findIndex((slot) => slot.instanceId === pad.instanceId)
  const instanceLabel =
    activeOfSameType.length > 1 && instanceIndex >= 0 ? ` #${instanceIndex + 1}` : ""
  const hasMainParams = definition.params.length > 0
  const hasSecondary = !!definition.secondarySourceId
  const selectedSourceId = pad.secondarySourceId ?? definition.secondarySourceId

  if (!hasMainParams && !hasSecondary) {
    return (
      <div className="flex items-center justify-center h-12 text-white/20 font-mono text-[10px]">
        no params
      </div>
    )
  }

  const mainColor = CATEGORY_COLORS[pad.category]
  const sourceColor = CATEGORY_COLORS.source
  const selectedSecondaryDefinition = selectedSourceId ? getFunctionDef(selectedSourceId) : undefined
  const sourceControlId = controlId({ kind: "source", padId: pad.instanceId })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={cn(
              "font-mono text-[11px] font-semibold",
              isArmed && "text-yellow-400/90",
              pad.isBypassed && "line-through opacity-50"
            )}
            style={!isArmed ? { color: mainColor } : undefined}
          >
            {definition.label}
            {instanceLabel}
          </span>
          {isActiveSlot && (
            <span className="font-mono text-[8px] text-white/35 tracking-wide">
              B mute · ⇧⌫ remove
            </span>
          )}
        </div>
        {isActiveSlot && (
          <button
            type="button"
            onClick={() => toggleBypass(pad.instanceId)}
            className={cn(
              "font-mono text-[11px] min-h-7 px-2 py-1 rounded border uppercase tracking-wider transition-colors shrink-0",
              pad.isBypassed
                ? "border-amber-400/50 text-amber-300 bg-amber-400/10"
                : "border-white/20 text-white/70 hover:text-white/90"
            )}
            title={
              pad.isBypassed
                ? "Re-enable pad in chain (B)"
                : "Mute in chain (keeps slot) (B)"
            }
          >
            {pad.isBypassed ? "bypassed" : "bypass"}
          </button>
        )}
      </div>

      {hasMainParams && (
        <div className="flex flex-col gap-3">
          {definition.colorInput && (
            <RgbColorControl
              channels={definition.colorInput.channels}
              mode={definition.colorInput.mode}
              values={pad.params}
              defaults={Object.fromEntries(definition.params.map((p) => [p.name, p.default]))}
              onChannelChange={(channel, value) => updateParam(pad.instanceId, channel, value)}
            />
          )}
          {definition.params.map((param) => (
            <SingleParamSlider
              key={param.name}
              param={param}
              value={pad.params[param.name] ?? param.default}
              color={mainColor}
              controlId={controlId({
                kind: "param",
                padId: pad.instanceId,
                scope: "main",
                paramName: param.name,
              })}
              fnControlIds={{
                freq: controlId({
                  kind: "fn",
                  padId: pad.instanceId,
                  scope: "main",
                  paramName: param.name,
                  field: "freq",
                }),
                amp: controlId({
                  kind: "fn",
                  padId: pad.instanceId,
                  scope: "main",
                  paramName: param.name,
                  field: "amp",
                }),
                offset: controlId({
                  kind: "fn",
                  padId: pad.instanceId,
                  scope: "main",
                  paramName: param.name,
                  field: "offset",
                }),
              }}
              isFocusActive={focusZone === "params"}
              focusedControlId={focusedControlId}
              onChange={(value) => updateParam(pad.instanceId, param.name, value)}
            />
          ))}
        </div>
      )}

      {hasSecondary && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">source</span>
          <SourceSelector
            key={pad.instanceId}
            appliedSourceId={selectedSourceId}
            controlId={sourceControlId}
            isFocusActive={focusZone === "params" && focusedControlId === sourceControlId}
            onApply={(sourceId) => updateSecondarySource(pad.instanceId, sourceId)}
          />

          {selectedSecondaryDefinition && selectedSecondaryDefinition.params.length > 0 && (
            <div className="flex flex-col gap-3 mt-1">
              {selectedSecondaryDefinition.params.map((param) => (
                <SingleParamSlider
                  key={param.name}
                  param={param}
                  value={pad.secondaryParams?.[param.name] ?? param.default}
                  color={`${sourceColor}99`}
                  controlId={controlId({
                    kind: "param",
                    padId: pad.instanceId,
                    scope: "secondary",
                    paramName: param.name,
                  })}
                  fnControlIds={{
                    freq: controlId({
                      kind: "fn",
                      padId: pad.instanceId,
                      scope: "secondary",
                      paramName: param.name,
                      field: "freq",
                    }),
                    amp: controlId({
                      kind: "fn",
                      padId: pad.instanceId,
                      scope: "secondary",
                      paramName: param.name,
                      field: "amp",
                    }),
                    offset: controlId({
                      kind: "fn",
                      padId: pad.instanceId,
                      scope: "secondary",
                      paramName: param.name,
                      field: "offset",
                    }),
                  }}
                  isFocusActive={focusZone === "params"}
                  focusedControlId={focusedControlId}
                  onChange={(value) => updateSecondaryParam(pad.instanceId, param.name, value)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
