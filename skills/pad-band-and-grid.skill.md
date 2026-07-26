# Skill: pad-band-and-grid

## Purpose
Guía para la banda inferior de pads del launchpad: tabs por categoría, grilla fija 8×2, slots ordenados, pad "+" y placeholders. Reemplaza el layout anterior de `SectionRow` + `FunctionGroup`.

## Inputs
- Cambios en disposición de pads, tabs o grilla
- Nuevos comportamientos de overflow (filas extra por slots `+`)
- Ajustes visuales de celda (altura, glow, selección)

## Outputs
- `pad-band.tsx`, `pad-tab-bar.tsx`, `pad-grid.tsx` actualizados
- Grilla estable lista para mapeo posicional de teclado (fase futura)

## Preconditions
- `CATEGORIES` y `getRegistryByCategory()` en `lib/hydra-registry.ts`
- `chain-store` con `padSlots`, `toggleSlot`, `addSlot`, `removeSlot`, `holdSlot`, `releaseSlot`, `selectSlot`
- `AddPad` y `Pad` en `components/launchpad/`

---

## Architecture

### Layout Model

```
PadBand (section, flex-col, min-h-0)
├── PadTabBar + toolbar (Shuffle, Clear)
└── scroll area (flex-1 overflow-y-auto)
    └── PadGrid (solo tab activo)
        ├── slots ordenados por registro (8 cols × N rows)
        ├── celda AddPad
        └── placeholders hasta mínimo 16 celdas
```

### Tab Bar (`pad-tab-bar.tsx`)

- 5 tabs = `CATEGORIES`: source, geometry, color, modulate, blend
- Cada tab: número (1–5), punto de color, label, badge con contador de activos
- ARIA: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Teclado: `useLaunchpadKeys` en `PadBand` mapea `Digit1`–`Digit5`

### Pad Grid (`pad-grid.tsx`)

**Orden de slots** (estable para futuro mapeo QWERTYUI / ASDFGHJK):
1. Para cada función en `getRegistryByCategory(category)` (orden del registro)
2. Append slots base (`!isExtra`) de ese `functionId`
3. **Al final de la grilla:** todos los slots `isExtra` en orden de inserción (`padSlots` preserva orden)
4. Celda `AddPad` después del último slot
5. Placeholders tenues hasta `max(16, slots + 1)` celdas

> **Invariante:** posición de celda estable = ancla del futuro mapeo de teclado posicional. Los extras no se agrupan bajo su función; van al final.

> **Extensión futura:** reordenado manual de la cadena (drag o botones ↑/↓ en `ChainChips`).

**Sizing** (no cuadrado):
```tsx
const GRID_COLS = 8
const MIN_ROW_PX = 64
const rowCount = Math.ceil(totalCells / GRID_COLS)

<div
  className="grid grid-cols-8 gap-1 h-full"
  style={{ gridTemplateRows: `repeat(${rowCount}, minmax(${MIN_ROW_PX}px, 1fr))` }}
>
```

- Celdas: `min-w-0 min-h-0` (sin `aspect-square`)
- Pads apaisados: ancho = 1/8 banda; alto = fracción del alto de la banda
- Overflow: scroll vertical en la banda cuando filas × 64px > alto disponible

### Pad Interactions (`pad.tsx`)

| Gesto | Efecto |
|-------|--------|
| Tap corto (< 250ms) | `toggleSlot` + `selectSlot` |
| Long-press (≥ `MOMENTARY_HOLD_MS` = 250ms) | `holdSlot` — activa ESE slot como momentary al final de la cadena |
| Pointer up / leave (tras long-press) | `releaseSlot` — desactiva el slot momentary |
| Ctrl/Alt+click | solo `selectSlot` |
| Shift+click (inactivo) | `armSlot` — staging preview en mini-canvas PiP |
| Shift+click (armado) | `disarmSlot` |
| Right-click | solo `selectSlot` (`preventDefault`); botón secundario no togglea |

**Visual (jerarquía tipográfica):**
- Label de función dominante: `text-[12px]` semibold; categoría secundaria `text-[9px]`
- Activo: borde color categoría + glow **inset** (`boxShadow` animado) + dot `w-2 h-2` superior derecha
- Seleccionado: `ring-2 ring-inset ring-white/60`
- Armado: borde punteado amarillo + pulso inset
- Bypasseado (`isBypassed`, prop desde `pad-grid`): borde/fondo atenuados, sin glow, label tachado, badge "byp" ámbar inferior izquierda
- `chainPosition`: badge destacado `text-[10px]` con fondo tintado por categoría, inferior derecha (solo activos)
- `overflow-hidden` en el pad para contener animaciones

### Slot Labels

```ts
// "#2" solo si hay más de un slot para el mismo functionId
const slotsForFn = padSlots.filter(s => s.functionId === slot.functionId)
return slotsForFn.length > 1 ? `#${index + 1}` : ""
```

---

## Store Actions (relevantes)

| Action | Uso en banda |
|--------|----------------|
| `toggleSlot(slotId)` | tap corto en pad |
| `selectSlot(slotId)` | foco para ParamPanel |
| `holdSlot(slotId)` | long-press: activa el slot presionado como momentary |
| `releaseSlot(slotId)` | pointer up/leave: apaga el slot si `momentarySlotId === slotId` |
| `addSlot(functionId)` | AddPad picker |
| `removeSlot(slotId)` | X en slots `isExtra` |
| `clearAll()` | toolbar Clear |

**Modo T/M eliminado** — `PadSlot.mode` y `setSlotMode` ya no existen; momentary es un gesto (long-press) con estado transitorio `momentarySlotId` en el store.

---

## Steps

**Agregar función al tab:**
1. Entrada en `HYDRA_REGISTRY` con `category` correcta
2. Slot base en `initPadSlots()`
3. Aparece en orden de registro dentro del tab correspondiente

**Agregar slot extra:**
1. Usuario abre AddPad → elige función
2. `addSlot(functionId)` → `isExtra: true`, `isActive: false`
3. Slot aparece **al final de la grilla** (no bajo su grupo de función)
4. Si total celdas > 16, crece a 3ª+ fila

**Ajustar altura de pads:**
- Modificar `MIN_ROW_PX` o proporción `grid-rows-[2fr_1fr]` en page
- No reintroducir `aspect-square`

---

## Heuristics

- **8 columnas fijas** — ancla para mapeo posicional futuro (fila 1 = QWERTYUI)
- **Orden estable** — siempre orden del registro, no alfabético ni por uso
- **Placeholders** — celdas vacías dashed; mantienen grilla visual de 16 mínimo
- **Un tab visible** — `PadGrid` montado solo para `activeCategory` (performance)
- **Momentary sin slots extra** — `holdSlot`/`releaseSlot` operan sobre el slot presionado; el legacy `activatePad`/`deactivatePad` (creaba slots huérfanos) fue eliminado

---

## Failure Modes

| Issue | Causa | Solución |
|-------|-------|----------|
| Glow invade vecinos | box-shadow externo | inset + overflow-hidden |
| Solo 1 fila visible | aspect-square en celdas | landscape grid + h-full |
| Tab sin pads | categoría vacía en registro | verificar HYDRA_REGISTRY |
| AddPad no lista fn | category mismatch | revisar `getRegistryByCategory` |
| Selección no actualiza panel | falta selectSlot | wire en toggle y modifier click |

---

## Composition Notes

- **Reemplaza**: `skills/section-rows-and-add-pad.skill.md` (obsoleto)
- **Parent**: `skills/launchpad-components.skill.md`
- **Related**: `skills/launchpad-keyboard.skill.md`, `skills/launchpad-layout.skill.md`
- **No modifica**: compiler, evaluator, favorites-store
