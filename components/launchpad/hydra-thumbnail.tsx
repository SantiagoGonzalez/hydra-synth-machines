"use client"

// Miniatura estática de una cadena Hydra basada en imagen cacheada o placeholder de código

import { cn } from "@/lib/utils"

interface HydraThumbnailProps {
  thumbnailUrl?: string
  code: string
  className?: string
}

export function HydraThumbnail({ thumbnailUrl, code, className }: HydraThumbnailProps) {
  if (thumbnailUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg bg-black aspect-video", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt="Hydra chain thumbnail"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Fallback: muestra el código cuando no hay thumbnail guardado
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-black/80 border border-white/5 aspect-video",
        "flex items-center justify-center p-2",
        className
      )}
    >
      <span className="font-mono text-[7px] text-white/25 text-center leading-relaxed break-all line-clamp-4">
        {code}
      </span>
    </div>
  )
}
