# Skill: launchpad-components

## Purpose
Guía para iterar sobre los componentes del launchpad VJ — layout de 3 zonas, banda de pads con tabs, panel de parámetros, canvas Hydra y cadena compilada en tiempo real. Define la arquitectura actual, convenciones de datos y reglas de extensión.

## Inputs
- Feature request or bug fix description
- (optional) New `HydraFunctionDef` entries or categories to support

## Outputs
- Modified or new component files under `components/launchpad/`
- Updated store/compiler logic if needed
- Working launchpad with visual feedback

## Preconditions
- `hydra-synth` package available (dynamic import via `chain-evaluator.ts`)
- `HYDRA_REGISTRY` in `lib/hydra-registry.ts` has the function definitions
- `chain-store.ts` Zustand store is the single source of truth for pad slots and chain state

## Architecture Overview

### Layout (3 zones)

Spec de referencia: `components/launchpad/layout-reference.txt`

```
app/launchpad/page.tsx              ← shell fijo h-screen, desktop-only (lg+)
├── StageColumn (~68%)              ← canvas 16:9 letterbox + ChainPreview compacto
├── ParamPanel (minmax(380px, 30%)) ← detalle del pad seleccionado + activos + faders
└── PadBand (tercio inferior)       ← tabs 1–5 + grilla 8×2 + shuffle/clear
```

Grid principal: `grid-rows-[2fr_1fr]` (superior / banda de pads). Zona superior: `grid-cols-[1fr_minmax(380px,30%)]`.

### Component Tree

```
app/launchpad/page.tsx
├── components/launchpad/
│   ├── stage-column.tsx        ← HydraCanvas + ChainPreview compact
│   ├── param-panel.tsx         ← PadParamPanel + chips activos + GlobalFaders
│   ├── pad-band.tsx            ← tab state, momentary handlers, shuffle/clear
│   ├── pad-tab-bar.tsx         ← 5 tabs con contador de activos (role=tablist)
│   ├── pad-grid.tsx            ← grilla 8×2 por categoría, placeholders, AddPad
│   ├── add-pad.tsx             ← "+" con Popover + Command palette
│   ├── pad.tsx                 ← pad atómico: toggle/momentary, selección, glow inset
│   ├── param-slider.tsx        ← sliders horizontales + valor editable + PadParamPanel
│   ├── global-faders.tsx       ← SPEED/BRIGHT/DECAY/AMOUNT (local state, sin cablear)
│   ├── chain-preview.tsx       ← código compilado tokenizado; prop compact
│   ├── hydra-canvas.tsx        ← WebGL, letterbox 16:9, heart + fullscreen
│   ├── favorites-dialog.tsx    ← biblioteca de favoritos en modal (header)
│   └── hydra-thumbnail.tsx     ← thumbnail estático para favoritos
hooks/
└── use-launchpad-keys.ts       ← teclas 1–5 → cambio de tab
```

> Layout de pads y grilla: `skills/pad-band-and-grid.skill.md`
> Layout shell y proporciones: `skills/launchpad-layout.skill.md`
> Param panel (detalle, chips, faders): `skills/param-panel.skill.md`
> Teclado: `skills/launchpad-keyboard.skill.md`
> Favoritos: `skills/favorites-library.skill.md`
> Scroll minimalista: `skills/ui-scrollbar-thin.skill.md`

### Data Flow

```
[User taps Pad] → toggleSlot + selectSlot (o solo selectSlot con modificador)
    → padSlots[] actualizado → deriveActivePads() → compileChain → compiledCode
    → HydraCanvas.run(compiledCode)
    → ChainPreview tokeniza compiledCode
    → ParamPanel muestra selectDetailPad (seleccionado o activo más reciente)
```

### Key Types (`stores/chain-store.ts`)

- `PadSlot extends ActivePad`: `{ isActive, isExtra, mode, ... }`
- **`padSlots[]`** es la fuente de verdad; **`activePads[]`** derivado
- **`selectedSlotId: string | null`** — pad enfocado en ParamPanel; persiste aunque se apague
- **`setSlotMode(slotId, mode)`** — toggle/momentary en el store (no estado local)
- Selectors: `selectDetailPad`, `selectMostRecentActivePad`, `selectIsPadActive`, `selectActivePadInstance`
- `initPadSlots()` crea **1 slot base por función** del registro (`functionId-1`); extras vía `addSlot`

### Chain Compilation (`lib/chain-compiler.ts`)

1. Pads ordenados por `activatedAt`
2. Si el primer pad no es source → prepend `solid(0,0,0)`
3. Sources adicionales ignoradas (linear chain v1)
4. Modulate/blend usan `secondarySourceId` + `secondaryParams` del pad
5. Termina en `.out()` o `.out(oN)`

## Steps (when modifying the launchpad)

1. **Identify layer** — UI (component), data (store), layout (page shell), o compiler
2. **Check existing pattern** — seguir convenciones de esta skill antes de inventar
3. **Modify store first** — nuevo estado en `chain-store.ts` con selectors granulares
4. **Update compiler** — si cambia el formato de salida
5. **Wire component tree** — respetar las 3 zonas y `min-h-0` en contenedores flex/grid
6. **Verify reactivity** — `compiledCode` dispara canvas + preview
7. **Update skills** — si cambia arquitectura, actualizar skills relacionadas

## Heuristics

- **Viewport fijo**: `h-screen overflow-hidden`; scroll interno por zona (`overflow-y-auto` / `overflow-x-auto`)
- **Desktop-only**: gate `lg:hidden` en page; no optimizar mobile salvo aviso
- **Tabs = categorías**: SOURCE → GEOMETRY → COLOR → MODULATE → BLEND (teclas 1–5)
- **Grilla 8×2**: pads apaisados (`gridTemplateRows: repeat(N, minmax(56px, 1fr))`); sin `aspect-square`
- **Selección vs activación**: click = toggle + select; Ctrl/Alt+click o right-click = solo select
- **Glow inset**: animación `boxShadow` con `inset` + `overflow-hidden` — no desborda la celda
- **Sliders horizontales** en ParamPanel con input numérico editable (Enter/blur commit)
- **Global faders**: estado local en `global-faders.tsx` — pendiente cablear al compiler
- **Color convention**: `CATEGORY_COLORS` única fuente de colores pad/token
- **Component size**: < 250 líneas por componente
- **File naming**: kebab-case para `.ts`/`.tsx` nuevos

## Examples

**Agregar función al registro:**
1. Entrada en `HYDRA_REGISTRY`
2. `initPadSlots()` la incluye automáticamente
3. Aparece en el tab de su categoría en `PadGrid`; `AddPad` la lista en el picker

**Seleccionar pad sin togglear:**
```ts
selectSlot(slotId)  // desde chip en ParamPanel o Ctrl+click en Pad
```

**Leer pad para el panel de detalle:**
```ts
const detailPad = useChainStore(selectDetailPad)
// selectedSlotId ?? pad activo más reciente
```

## Failure Modes

| Issue | Solution |
|-------|----------|
| Canvas negro tras toggle | Verificar `compileChain`; fallback `solid(0,0,0)` |
| Glow desborda grilla | Usar `inset box-shadow` + `overflow-hidden` en `pad.tsx` |
| Solo se ve 1 fila de pads | Quitar `aspect-square`; usar `h-full` + `gridTemplateRows` en `pad-grid.tsx` |
| Cadena larga rompe layout | `min-w-0` en `StageColumn`; scroll horizontal con `scrollbar-thin` |
| Param panel vacío | Verificar `selectedSlotId` y `selectDetailPad`; activar o seleccionar un pad |
| Teclas 1–5 no cambian tab | Revisar `useLaunchpadKeys`; guardas de input/modificadores |

## Composition Notes

- **Depends on**: `docs/hydra-skills-index/` para API Hydra
- **Depends on**: `skills/machines.skill.md` para concepto de instrumento
- **Sub-skills**: `pad-band-and-grid`, `launchpad-layout`, `launchpad-keyboard`, `param-panel`, `favorites-library`, `ui-scrollbar-thin`
- **Removed (v1 layout)**: `machine-layout.tsx`, `section-row.tsx` — reemplazados por `pad-band` + `pad-grid`
