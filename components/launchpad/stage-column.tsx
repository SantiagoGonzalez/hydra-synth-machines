"use client"

// Columna del escenario: canvas Hydra con letterbox y preview compacto de la cadena

import { HydraCanvas } from "@/components/launchpad/hydra-canvas"
import { PreviewCanvas } from "@/components/launchpad/preview-canvas"
import { ChainPreview } from "@/components/launchpad/chain-preview"

export function StageColumn() {
  return (
    <div className="min-h-0 min-w-0 flex flex-col gap-2">
      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        <HydraCanvas />
        <PreviewCanvas />
      </div>
      <ChainPreview compact />
    </div>
  )
}
