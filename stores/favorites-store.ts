// Store persistido para cadenas favoritas del launchpad

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ActivePad } from "@/stores/chain-store"

export interface FavoriteChain {
  id: string
  name?: string
  activePads: ActivePad[]
  compiledCode: string
  thumbnailDataUrl?: string
  savedAt: number
}

interface FavoritesState {
  favorites: FavoriteChain[]
  saveFavorite: (data: Omit<FavoriteChain, "id" | "savedAt">) => void
  removeFavorite: (id: string) => void
  renameFavorite: (id: string, name: string) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],

      saveFavorite: (data) => {
        const id = `fav-${Date.now()}`
        const newFav: FavoriteChain = { id, savedAt: Date.now(), ...data }
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
    { name: "hydra-favorites" }
  )
)
