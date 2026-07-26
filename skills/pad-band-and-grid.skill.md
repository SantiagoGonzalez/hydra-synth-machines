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
- `chain-store` con `padSlots`, `toggleSlot`, `addSlot`, `removeSlot`, `setSlotMode`, `selectSlot`
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
1. Para cada función en `getRegistryByCategory(category)` (orden del registro): slots base (`!isExtra`)
2. Append todos los slots `isExtra` al **final de la grilla** en orden de creación
3. Celda `AddPad` después del último slot
4. Placeholders tenues hasta `max(16, slots + 1)` celdas

> **Invariante:** posición de celda estable = ancla del futuro mapeo de teclado posicional.

**Badge de posición en cadena:**
- Solo pads activos muestran número 1..N (esquina inferior derecha)
- El `#N` de instancia (misma función) permanece abajo-izquierda / categoría

**Sizing** (no cuadrado):
```tsx
const GRID_COLS = 8
const MIN_ROW_PX = 56
const rowCount = Math.ceil(totalCells / GRID_COLS)

<div
  className="grid grid-cols-8 gap-1 h-full"
  style={{ gridTemplateRows: `repeat(${rowCount}, minmax(${MIN_ROW_PX}px, 1fr))` }}
>
```

- Celdas: `min-w-0 min-h-0` (sin `aspect-square`)
- Pads apaisados: ancho = 1/8 banda; alto = fracción del alto de la banda
- Overflow: scroll vertical en la banda cuando filas × 56px > alto disponible

### Pad Interactions (`pad.tsx`)

| Gesto | Efecto |
|-------|--------|
| Click (toggle mode) | `toggleSlot` + `selectSlot` |
| Shift+click (inactivo) | `armSlot` — staging sin activar |
| Ctrl/Alt+click | solo `selectSlot` |
| Right-click | solo `selectSlot` (`preventDefault`) |
| Pointer down (momentary) | `onMomentaryStart` + select |
| Pointer up (momentary) | `onMomentaryEnd` |

**Visual:**
- Activo: borde color categoría + glow **inset** (`boxShadow` animado)
- Seleccionado: `ring-2 ring-inset ring-white/60`
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
| `toggleSlot(slotId)` | click normal en pad toggle |
| `selectSlot(slotId)` | foco para ParamPanel |
| `setSlotMode(slotId, mode)` | botón T/M en pad |
| `addSlot(functionId)` | AddPad picker |
| `removeSlot(slotId)` | X en slots `isExtra` |
| `clearAll()` | toolbar Clear |

`padModes` local **eliminado** — `mode` vive en `PadSlot.mode` del store.

---

## Steps

**Agregar función al tab:**
1. Entrada en `HYDRA_REGISTRY` con `category` correcta
2. Slot base en `initPadSlots()`
3. Aparece en orden de registro dentro del tab correspondiente

**Agregar slot extra:**
1. Usuario abre AddPad → elige función
2. `addSlot(functionId)` → `isExtra: true`, `isActive: false`
3. Slot aparece al **final de la grilla** (después de todos los slots base), no agrupado por función
4. Si total celdas > 16, crece a 3ª+ fila

**Extensión futura — reorden manual de cadena:**
- Drag o botones ↑/↓ en `ChainChips` para cambiar `activatedAt` / índice en cadena
- Documentado; no implementado aún

**Ajustar altura de pads:**
- Modificar `MIN_ROW_PX` o proporción `grid-rows-[2fr_1fr]` en page
- No reintroducir `aspect-square`

---

## Heuristics

- **8 columnas fijas** — ancla para mapeo posicional futuro (fila 1 = QWERTYUI)
- **Orden estable** — siempre orden del registro, no alfabético ni por uso
- **Placeholders** — celdas vacías dashed; mantienen grilla visual de 16 mínimo
- **Un tab visible** — `PadGrid` montado solo para `activeCategory` (performance)
- **Momentary legacy** — `activatePad(functionId, "momentary")` crea slot extra (comportamiento heredado)

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
