"use client"

// Dialog modal con la biblioteca de cadenas favoritas guardadas

import { useState } from "react"
import { Bookmark, Trash2, Play, BookmarkX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useChainStore } from "@/stores/chain-store"
import { HydraThumbnail } from "@/components/launchpad/hydra-thumbnail"

interface FavoritesDialogProps {
  trigger?: React.ReactNode
}

export function FavoritesDialog({ trigger }: FavoritesDialogProps) {
  const favorites = useFavoritesStore((s) => s.favorites)
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite)
  const restoreFromFavorite = useChainStore((s) => s.restoreFromFavorite)
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="flex items-center gap-1.5 font-mono text-[9px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
          >
            <Bookmark className="w-3 h-3" />
            Favorites
            {favorites.length > 0 && (
              <span className="bg-white/10 text-white/40 px-1 py-px rounded tabular-nums">
                {favorites.length}
              </span>
            )}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm text-white/70 uppercase tracking-wider">
            Favorites
          </DialogTitle>
        </DialogHeader>
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4">
            <BookmarkX className="w-5 h-5 text-white/15" />
            <p className="font-mono text-[10px] text-white/20 text-center leading-relaxed">
              no favorites saved yet
              <br />
              <span className="text-white/10">press ♥ on the canvas to save the current chain</span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {favorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                name={fav.name}
                compiledCode={fav.compiledCode}
                thumbnailUrl={fav.thumbnailDataUrl}
                savedAt={fav.savedAt}
                onLoad={() => {
                  restoreFromFavorite(fav.activePads)
                  setOpen(false)
                }}
                onDelete={() => removeFavorite(fav.id)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface FavoriteCardProps {
  name?: string
  compiledCode: string
  thumbnailUrl?: string
  savedAt: number
  onLoad: () => void
  onDelete: () => void
}

function FavoriteCard({ name, compiledCode, thumbnailUrl, savedAt, onLoad, onDelete }: FavoriteCardProps) {
  const label = name ?? deriveLabel(compiledCode)
  const time = new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="group/card flex flex-col gap-1">
      <div className="relative">
        <HydraThumbnail thumbnailUrl={thumbnailUrl} code={compiledCode} />
        <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onLoad}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-md transition-colors"
            title="Load this chain"
          >
            <Play className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between px-0.5">
        <span className="font-mono text-[9px] text-white/40 truncate flex-1">{label}</span>
        <span className="font-mono text-[8px] text-white/20 ml-1 shrink-0">{time}</span>
      </div>
    </div>
  )
}

function deriveLabel(code: string): string {
  const first = code.match(/^(\w+)\(/)?.[1] ?? "patch"
  const rest = code.match(/\.(\w+)\(/g)?.slice(0, 2).map((m) => m.slice(1, -1)) ?? []
  return [first, ...rest].join("·").slice(0, 28)
}
