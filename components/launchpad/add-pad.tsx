"use client"

// Pad "+" con command palette inline para agregar nuevas instancias a una sección

import { useCallback, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import { CATEGORY_COLORS, type HydraCategory, type HydraFunctionDef } from "@/lib/hydra-registry"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface AddPadProps {
  category: HydraCategory
  functions: HydraFunctionDef[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (functionId: string) => void
}

export function AddPad({ category, functions, open, onOpenChange, onAdd }: AddPadProps) {
  const color = CATEGORY_COLORS[category]
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const handleSelect = useCallback(
    (functionId: string) => {
      onAdd(functionId)
      onOpenChange(false)
    },
    [onAdd, onOpenChange]
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <motion.div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg cursor-pointer select-none w-full h-full",
            "border border-dashed transition-colors duration-150",
            "p-1.5",
            open
              ? "border-[var(--add-color)] bg-[var(--add-color)]/10"
              : "border-white/15 bg-black/20 hover:border-[var(--add-color)]/50 hover:bg-[var(--add-color)]/5"
          )}
          style={{ "--add-color": color } as React.CSSProperties}
          whileTap={{ scale: 0.94 }}
        >
          <Plus
            className="w-4 h-4 transition-colors"
            style={{ color: open ? color : "rgba(255,255,255,0.3)" }}
          />
          <span className="font-mono text-[8px] text-white/20 uppercase tracking-wider mt-1">
            add
          </span>
        </motion.div>
      </PopoverTrigger>

      <PopoverContent
        className="w-48 p-0 border-white/10 bg-black/95"
        side="top"
        align="start"
        sideOffset={6}
      >
        <Command className="bg-transparent">
          <CommandInput
            ref={searchInputRef}
            placeholder="Search..."
            className="font-mono text-[11px] text-white/70 border-b border-white/10 h-8"
          />
          <CommandList className="max-h-48">
            <CommandEmpty className="font-mono text-[10px] text-white/30 py-4 text-center">
              No results.
            </CommandEmpty>
            <CommandGroup>
              {functions.map((fn) => (
                <CommandItem
                  key={fn.id}
                  value={fn.id}
                  onSelect={() => handleSelect(fn.id)}
                  className="font-mono text-[11px] cursor-pointer"
                >
                  <span style={{ color }}>{fn.label}</span>
                  {fn.description && (
                    <span className="ml-2 text-white/30 text-[9px] truncate">
                      {fn.description}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
