// Store persistido para cadenas favoritas del launchpad (v2 multi-output)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ActivePad, OutputBuffer } from "@/stores/chain-store"
import { OUTPUT_BUFFERS } from "@/lib/chain-compiler"

export interface FavoriteChain {
  id: string
  version: 2
  name?: string
  chains: Record<OutputBuffer, ActivePad[]>
  compiledCode: string
  thumbnailDataUrl?: string
  savedAt: number
}

/** Formato legacy v1 (solo activePads en o0) */
interface FavoriteChainV1 {
  id: string
  name?: string
  activePads: ActivePad[]
  compiledCode: string
  thumbnailDataUrl?: string
  savedAt: number
  version?: 1
}

interface FavoritesState {
  favorites: FavoriteChain[]
  saveFavorite: (data: Omit<FavoriteChain, "id" | "savedAt" | "version">) => void
  removeFavorite: (id: string) => void
  renameFavorite: (id: string, name: string) => void
}

/** Migra favorito v1 → v2 (todo a o0) */
function migrateFavorite(raw: FavoriteChainV1 | FavoriteChain): FavoriteChain {
  if ("version" in raw && raw.version === 2 && "chains" in raw) {
    return raw as FavoriteChain
  }
  const v1 = raw as FavoriteChainV1
  const chains = Object.fromEntries(
    OUTPUT_BUFFERS.map((buf) => [buf, buf === "o0" ? v1.activePads : []])
  ) as Record<OutputBuffer, ActivePad[]>
  return {
    id: v1.id,
    version: 2,
    name: v1.name,
    chains,
    compiledCode: v1.compiledCode,
    thumbnailDataUrl: v1.thumbnailDataUrl,
    savedAt: v1.savedAt,
  }
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],

      saveFavorite: (data) => {
        const id = `fav-${Date.now()}`
        const newFav: FavoriteChain = { id, version: 2, savedAt: Date.now(), ...data }
        set((state) => ({ favorites: [newFav, ...state.favorites] }))
      },

      removeFavorite: (id) => {
        set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) }))
      },

      renameFavorite: (id, name) => {
        set((state) => ({
          favorites: state.favorites.map((f) => (f.id === id ? { ...f, name } : f)),
        }))
      },
    }),
    {
      name: "hydra-favorites",
      merge: (persisted, current) => {
        const p = persisted as { favorites?: (FavoriteChainV1 | FavoriteChain)[] } | undefined
        if (!p?.favorites) return current as FavoritesState
        return {
          ...(current as FavoritesState),
          favorites: p.favorites.map(migrateFavorite),
        }
      },
    }
  )
)

/** Obtiene la cadena o0 de un favorito (compat UI legacy) */
export function getFavoritePads(fav: FavoriteChain): ActivePad[] {
  return fav.chains.o0
}
