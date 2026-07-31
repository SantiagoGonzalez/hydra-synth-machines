"use client"

// Spike G-03: variante vertical del slider escalar (fader de mesa)

import { SingleParamSlider, type ParamSliderProps } from "@/components/launchpad/param-slider"

export type ParamFaderProps = ParamSliderProps

/** Fader vertical piloto — misma API y store que SingleParamSlider en modo escalar. */
export function ParamFader(props: ParamFaderProps) {
  return <SingleParamSlider {...props} layout="vertical" />
}
