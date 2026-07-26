"use client"

// Biblioteca de cadenas favoritas guardadas: muestra thumbnails con acciones de carga y borrado

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Trash2, Play, BookmarkX } from "lucide-react"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useChainStore } from "@/stores/chain-store"
import { HydraThumbnail } from "@/components/launchpad/hydra-thumbnail"
import { cn } from "@/lib/utils"

export function FavoritesLibrary() {
  const favorites = useFavoritesStore((s) => s.favorites)
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite)
  const restoreFromFavorite = useChainStore((s) => s.restoreFromFavorite)
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      className="glass-card rounded-xl border border-white/5 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      {/* Header colapsable */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
            Favorites
          </span>
          {favorites.length > 0 && (
            <span className="font-mono text-[9px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded">
              {favorites.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn("w-3.5 h-3.5 text-white/30 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {/* Contenido */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 px-4">
                <BookmarkX className="w-5 h-5 text-white/15" />
                <p className="font-mono text-[10px] text-white/20 text-center leading-relaxed">
                  no favorites saved yet
                  <br />
                  <span className="text-white/10">press ♥ on the canvas to save the current chain</span>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 pt-1">
                {favorites.map((fav) => (
                  <FavoriteCard
                    key={fav.id}
                    name={fav.name}
                    compiledCode={fav.compiledCode}
                    thumbnailUrl={fav.thumbnailDataUrl}
                    savedAt={fav.savedAt}
                    onLoad={() => restoreFromFavorite(fav.chains)}
                    onDelete={() => removeFavorite(fav.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Favorite Card ─────────────────────────────────────────────────────────────

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
      {/* Thumbnail con overlay de acciones */}
      <div className="relative">
        <HydraThumbnail thumbnailUrl={thumbnailUrl} code={compiledCode} />
        <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onLoad}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-md transition-colors"
            title="Load this chain"
          >
            <Play className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Nombre y hora */}
      <div className="flex items-center justify-between px-0.5">
        <span className="font-mono text-[9px] text-white/40 truncate flex-1">{label}</span>
        <span className="font-mono text-[8px] text-white/20 ml-1 shrink-0">{time}</span>
      </div>
    </div>
  )
}

/** Deriva una etiqueta corta a partir del código compilado */
function deriveLabel(code: string): string {
  const first = code.match(/^(\w+)\(/)?.[1] ?? "patch"
  const rest = code.match(/\.(\w+)\(/g)?.slice(0, 2).map((m) => m.slice(1, -1)) ?? []
  return [first, ...rest].join("·").slice(0, 28)
}
