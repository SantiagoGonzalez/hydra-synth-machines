import { getFunctionDef, getSourceOptions, type HydraParam } from "@/lib/hydra-registry"
import { GLOBAL_FADERS, type GlobalFaderId, type GlobalFaderValues } from "@/lib/global-faders"
import { isParamFn, type ParamValue } from "@/lib/param-value"
import type { ActivePad } from "@/stores/chain-store"

export const FN_FIELD_RANGES = {
  freq: { min: 0.01, max: 10, step: 0.01, default: 1 },
  amp: { min: -5, max: 5, step: 0.05, default: 0.5 },
  offset: { min: -5, max: 5, step: 0.05, default: 0 },
} as const

export type ParamScope = "main" | "secondary"
export type FnField = keyof typeof FN_FIELD_RANGES

export type ControlAddress =
  | { kind: "param"; padId: string; scope: ParamScope; paramName: string }
  | { kind: "fn"; padId: string; scope: ParamScope; paramName: string; field: FnField }
  | { kind: "source"; padId: string }
  | { kind: "global"; faderId: GlobalFaderId }

export interface ControlDescriptor {
  id: string
  address: ControlAddress
  label: string
  min: number
  max: number
  default: number
  value: number
  options?: string[]
}

function paramControl(
  padId: string,
  scope: ParamScope,
  param: HydraParam,
  value: ParamValue
): ControlDescriptor {
  return {
    id: controlId({ kind: "param", padId, scope, paramName: param.name }),
    address: { kind: "param", padId, scope, paramName: param.name },
    label: param.name,
    min: param.min,
    max: param.max,
    default: param.default,
    value: isParamFn(value) ? value.offset : value,
  }
}

function fnFieldControls(
  padId: string,
  scope: ParamScope,
  paramName: string,
  value: ParamValue
): ControlDescriptor[] {
  if (!isParamFn(value)) return []

  return (Object.keys(FN_FIELD_RANGES) as FnField[]).map((field) => {
    const range = FN_FIELD_RANGES[field]
    return {
      id: controlId({ kind: "fn", padId, scope, paramName, field }),
      address: { kind: "fn", padId, scope, paramName, field },
      label: `${paramName}.${field}`,
      min: range.min,
      max: range.max,
      default: range.default,
      value: value[field],
    }
  })
}

export function controlId(address: ControlAddress): string {
  switch (address.kind) {
    case "param":
      return `param:${address.padId}:${address.scope}:${address.paramName}`
    case "fn":
      return `fn:${address.padId}:${address.scope}:${address.paramName}:${address.field}`
    case "source":
      return `source:${address.padId}`
    case "global":
      return `global:${address.faderId}`
  }
}

/** Describe los controles que pueden recibir teclado hoy y MIDI en el futuro. */
export function buildControlList(
  pad: ActivePad | null,
  globalFaders: GlobalFaderValues,
  sourceDraftId: string | null = null
): ControlDescriptor[] {
  const controls: ControlDescriptor[] = []

  if (pad) {
    const definition = getFunctionDef(pad.functionId)
    if (definition) {
      for (const param of definition.params) {
        const value = pad.params[param.name] ?? param.default
        controls.push(paramControl(pad.instanceId, "main", param, value))
        controls.push(...fnFieldControls(pad.instanceId, "main", param.name, value))
      }

      if (definition.secondarySourceId) {
        const options = getSourceOptions().map((option) => option.id)
        const appliedSourceId = pad.secondarySourceId ?? definition.secondarySourceId
        const sourceId = sourceDraftId ?? appliedSourceId
        controls.push({
          id: controlId({ kind: "source", padId: pad.instanceId }),
          address: { kind: "source", padId: pad.instanceId },
          label: "source",
          min: 0,
          max: Math.max(0, options.length - 1),
          default: Math.max(0, options.indexOf(definition.secondarySourceId)),
          value: Math.max(0, options.indexOf(sourceId)),
          options,
        })

        const secondaryDefinition = getFunctionDef(appliedSourceId)
        if (secondaryDefinition) {
          for (const param of secondaryDefinition.params) {
            const value = pad.secondaryParams?.[param.name] ?? param.default
            controls.push(paramControl(pad.instanceId, "secondary", param, value))
            controls.push(...fnFieldControls(pad.instanceId, "secondary", param.name, value))
          }
        }
      }
    }
  }

  for (const fader of GLOBAL_FADERS) {
    controls.push({
      id: controlId({ kind: "global", faderId: fader.id }),
      address: { kind: "global", faderId: fader.id },
      label: fader.label,
      min: fader.min,
      max: fader.max,
      default: fader.default,
      value: globalFaders[fader.id],
    })
  }

  return controls
}

export function valueToNormalized(value: number, min: number, max: number): number {
  if (max <= min) return 0
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

export function normalizedToValue(normalized: number, min: number, max: number): number {
  return min + Math.min(1, Math.max(0, normalized)) * (max - min)
}

export function nudgeByFraction(control: ControlDescriptor, fraction: number): number {
  if (control.options && control.options.length > 0) {
    const step = fraction === 0 ? 0 : fraction > 0 ? 1 : -1
    return Math.min(control.max, Math.max(control.min, control.value + step))
  }
  const normalized = valueToNormalized(control.value, control.min, control.max)
  return normalizedToValue(normalized + fraction, control.min, control.max)
}
