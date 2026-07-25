"use client"

// Atajos de teclado del launchpad: tabs numéricos (fase 1) y extensible para disparo de pads

import { useEffect } from "react"
import { CATEGORIES, type HydraCategory } from "@/lib/hydra-registry"

const TAB_KEY_MAP: Record<string, number> = {
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Digit5: 4,
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  return target.isContentEditable
}

export function useLaunchpadKeys(onTabChange: (category: HydraCategory) => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (isEditableTarget(event.target)) return

      const tabIndex = TAB_KEY_MAP[event.code]
      if (tabIndex === undefined) return

      const category = CATEGORIES[tabIndex]
      if (!category) return

      event.preventDefault()
      onTabChange(category)
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onTabChange])
}
