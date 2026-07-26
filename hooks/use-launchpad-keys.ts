"use client"

// Atajos del launchpad: tabs, outputs y disparo posicional de pads.

import { useEffect, useRef } from "react"
import { CATEGORIES, type HydraCategory } from "@/lib/hydra-registry"
import { cellIndexForCode } from "@/lib/pad-key-map"
import type { PadSlot } from "@/stores/chain-store"
import type { OutputBuffer } from "@/lib/chain-compiler"

const TAB_KEY_MAP: Record<string, number> = {
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Digit5: 4,
}

const OUTPUT_KEY_MAP: Record<string, OutputBuffer> = {
  Digit1: "o0",
  Digit2: "o1",
  Digit3: "o2",
  Digit4: "o3",
}

const MOMENTARY_HOLD_MS = 250

interface PendingPress {
  slotId: string
  timerId: number
  isMomentary: boolean
}

interface LaunchpadKeyOptions {
  orderedSlots: PadSlot[]
  onTabChange: (category: HydraCategory) => void
  onOutputChange: (output: OutputBuffer) => void
  onOpenAddPad: () => void
  onToggleSlot: (slotId: string) => void
  onSelectSlot: (slotId: string) => void
  onToggleArm: (slot: PadSlot) => void
  onMomentaryStart: (slotId: string) => void
  onMomentaryEnd: (slotId: string) => void
  onApplyArmed: () => void
  onDisarm: () => void
  onRemoveSelected: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  return target.isContentEditable
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.closest(
    'button, a[href], [role="button"], [role="combobox"], [role="menuitem"], [tabindex]:not([tabindex="-1"])'
  ) !== null
}

function hasOpenOverlay(): boolean {
  return document.querySelector(
    '[role="dialog"][data-state="open"], [data-radix-popper-content-wrapper] [data-state="open"]'
  ) !== null
}

export function useLaunchpadKeys({
  orderedSlots,
  onTabChange,
  onOutputChange,
  onOpenAddPad,
  onToggleSlot,
  onSelectSlot,
  onToggleArm,
  onMomentaryStart,
  onMomentaryEnd,
  onApplyArmed,
  onDisarm,
  onRemoveSelected,
}: LaunchpadKeyOptions) {
  const pendingPressesRef = useRef(new Map<string, PendingPress>())
  const optionsRef = useRef<LaunchpadKeyOptions>({
    orderedSlots,
    onTabChange,
    onOutputChange,
    onOpenAddPad,
    onToggleSlot,
    onSelectSlot,
    onToggleArm,
    onMomentaryStart,
    onMomentaryEnd,
    onApplyArmed,
    onDisarm,
    onRemoveSelected,
  })
  optionsRef.current = {
    orderedSlots,
    onTabChange,
    onOutputChange,
    onOpenAddPad,
    onToggleSlot,
    onSelectSlot,
    onToggleArm,
    onMomentaryStart,
    onMomentaryEnd,
    onApplyArmed,
    onDisarm,
    onRemoveSelected,
  }

  useEffect(() => {
    const releasePress = (code: string) => {
      const pending = pendingPressesRef.current.get(code)
      if (!pending) return

      window.clearTimeout(pending.timerId)
      pendingPressesRef.current.delete(code)
      if (pending.isMomentary) {
        optionsRef.current.onMomentaryEnd(pending.slotId)
      } else {
        optionsRef.current.onToggleSlot(pending.slotId)
        optionsRef.current.onSelectSlot(pending.slotId)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target) || isInteractiveTarget(event.target)) return
      if (hasOpenOverlay()) return

      if (event.shiftKey) {
        const output = OUTPUT_KEY_MAP[event.code]
        if (output && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault()
          optionsRef.current.onOutputChange(output)
          return
        }

        if ((event.code === "Backspace" || event.code === "Delete") && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault()
          optionsRef.current.onRemoveSelected()
          return
        }
      }

      if (!event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const tabIndex = TAB_KEY_MAP[event.code]
        if (tabIndex !== undefined) {
          const category = CATEGORIES[tabIndex]
          if (category) {
            event.preventDefault()
            optionsRef.current.onTabChange(category)
            return
          }
        }

        if (event.code === "Space") {
          event.preventDefault()
          optionsRef.current.onOpenAddPad()
          return
        }

        if (event.code === "Enter") {
          event.preventDefault()
          optionsRef.current.onApplyArmed()
          return
        }

        if (event.code === "Escape") {
          event.preventDefault()
          optionsRef.current.onDisarm()
          return
        }
      }

      const cellIndex = cellIndexForCode(event.code)
      const slot = cellIndex === undefined ? undefined : optionsRef.current.orderedSlots[cellIndex]
      if (!slot) return

      if (event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        optionsRef.current.onToggleArm(slot)
        return
      }

      if (event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        optionsRef.current.onSelectSlot(slot.instanceId)
        return
      }

      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return

      event.preventDefault()
      const code = event.code
      const timerId = window.setTimeout(() => {
        const pending = pendingPressesRef.current.get(code)
        if (!pending) return
        pending.isMomentary = true
        optionsRef.current.onMomentaryStart(pending.slotId)
      }, MOMENTARY_HOLD_MS)
      pendingPressesRef.current.set(code, {
        slotId: slot.instanceId,
        timerId,
        isMomentary: false,
      })
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      releasePress(event.code)
    }

    const handleWindowBlur = () => {
      pendingPressesRef.current.forEach((pending) => {
        window.clearTimeout(pending.timerId)
        if (pending.isMomentary) optionsRef.current.onMomentaryEnd(pending.slotId)
      })
      pendingPressesRef.current.clear()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("blur", handleWindowBlur)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("blur", handleWindowBlur)
      handleWindowBlur()
    }
  }, [])
}
