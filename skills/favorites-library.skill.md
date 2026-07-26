# Skill: favorites-library

## Purpose
Guía para mantener y extender el sistema de favoritos del launchpad VJ — la biblioteca persistida de cadenas Hydra guardadas con thumbnails cacheados y restauración completa del estado.

## Inputs
- Feature request or bug fix related to saving, loading, or displaying favorite chains
- (optional) New display modes, rename UX, or import/export requirements

## Outputs
- Modified files under `stores/`, `components/launchpad/`, or `app/launchpad/`
- Persisted favorites library with correct thumbnail + state restoration

## Preconditions
- `chain-store.ts` manages `ActivePad[]` as the runtime source of truth
- `favorites-store.ts` is persisted to localStorage via `zustand/middleware/persist`
- `HydraCanvas` has access to `canvasRef` for `toDataURL` capture

---

## Architecture Overview

### Component & Store Tree

```
stores/
├── favorites-store.ts      ← Zustand + persist: FavoriteChain[], saveFavorite, removeFavorite, renameFavorite
└── chain-store.ts          ← restoreFromFavorite(pads) → rebuilds padSlots, recompiles chain

components/launchpad/
├── hydra-canvas.tsx        ← Heart button: captures thumbnail + calls saveFavorite
├── hydra-thumbnail.tsx     ← Cached <img> display (static, no live canvas)
├── favorites-dialog.tsx    ← Dialog modal: grid of FavoriteCards with load/delete (header trigger)
└── favorites-library.tsx   ← Legacy collapsible component (unused in current layout; prefer dialog)
```

### UI Placement

- **Current**: `FavoritesDialog` en el header de `app/launchpad/page.tsx`
- Load cierra el dialog automáticamente (`setOpen(false)`)
- Empty state guía al botón Heart del canvas

### Data Flow

```
[Heart click in HydraCanvas]
    → canvas.toDataURL("image/webp", 0.6)          ← thumbnail captured once at save time
    → saveFavorite({ activePads, compiledCode, thumbnailDataUrl })
    → favorites-store: [newFav, ...state.favorites]
    → FavoritesDialog re-renders with new card

[Load click on FavoriteCard]
    → restoreFromFavorite(fav.activePads)           ← chain-store action
    → instanceIds regenerated (${functionId}-${now+i}) to avoid timestamp collisions
    → activatedAt regenerated in order to preserve chain sequence
    → compileChain(restored) → compiledCode updates
    → HydraCanvas evaluates new code
```

### Key Types

**`FavoriteChain`** (`stores/favorites-store.ts`):
```typescript
{
  id: string                 // "fav-${Date.now()}"
  name?: string              // optional custom label; auto-derived from code if absent
  activePads: ActivePad[]    // full snapshot of the pad state at save time
  compiledCode: string       // compiled Hydra expression string
  thumbnailDataUrl?: string  // WebP dataURL captured from canvas at save time
  savedAt: number            // Unix timestamp for display
}
```

**`ActivePad`** (from `stores/chain-store.ts`) — includes `secondarySourceId` + `secondaryParams`, so modulate/blend source choices are preserved across saves.

---

## Rules & Heuristics

- **Thumbnails are static** — `canvas.toDataURL("image/webp", 0.6)` captured once at save; `HydraThumbnail` renders a plain `<img>`, never a live canvas. This keeps WebGL context count at 1.
- **instanceId regeneration on restore** — always generate new `instanceId` and `activatedAt` in `restoreFromFavorite`; never reuse saved instanceIds.
- **Persistence key** — localStorage key is `"hydra-favorites"`. Do not rename without a migration strategy.
- **Label derivation** — `deriveLabel(code)` in `favorites-dialog.tsx` (also in legacy `favorites-library.tsx`)
- **FavoritesDialog** — primary UI; triggered from launchpad header
- **Legacy FavoritesLibrary** — collapsible inline component; kept for reference, not mounted in current page layout
- **Heart button state** — `isSaved` turns the icon pink/filled for 1.5 s as confirmation feedback. Implemented with `setTimeout`.
- **Restore is immediate** — no confirmation dialog; this is a live-performance tool.
- **Chain order preserved** — `activatedAt` values are reconstructed as `now + i` (sequential) to maintain the original chain position order.

---

## Steps (when modifying the favorites system)

1. **Adding a new field to `FavoriteChain`** — add to the interface, update `saveFavorite` call sites, consider migration for existing localStorage entries (add a default value in the store initializer)
2. **Changing the thumbnail format** — update the `toDataURL` call in `hydra-canvas.tsx`; `HydraThumbnail` accepts any image URL, so no component changes needed
3. **Adding rename UX** — `renameFavorite(id, name)` already exists in the store; wire a double-click or inline input on `FavoriteCard`
4. **Adding import/export** — serialize `favorites` array to JSON; import by calling `saveFavorite` in a loop (generates fresh ids)
5. **Changing the collapsible behavior** — legacy `FavoritesLibrary` used local `isOpen`; `FavoritesDialog` uses Radix Dialog open state

---

## Examples

**Save the current chain programmatically:**
```typescript
const thumbnailDataUrl = canvasRef.current?.toDataURL("image/webp", 0.6)
useFavoritesStore.getState().saveFavorite({ activePads, compiledCode, thumbnailDataUrl })
```

**Restore a favorite:**
```typescript
useChainStore.getState().restoreFromFavorite(favorite.activePads)
```

**Read all favorites:**
```typescript
const favorites = useFavoritesStore((s) => s.favorites)
```

**Delete a favorite:**
```typescript
useFavoritesStore.getState().removeFavorite(id)
```

**Rename a favorite:**
```typescript
useFavoritesStore.getState().renameFavorite(id, "My loop patch")
```
