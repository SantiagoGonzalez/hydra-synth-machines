# Skill: param-panel

## Purpose
Guía para el panel lateral de parámetros del launchpad: selección de pad, edición de params por instancia, fuente secundaria (modulate/blend) y faders globales. Documenta el estado actual y el roadmap de refactor.

## Inputs
- Cambios en UX de selección o edición de parámetros
- Nuevos tipos de control (knobs, XY, macros)
- Cableado de faders globales al compilador
- Bug fixes en sliders o chips de pads activos

## Outputs
- Componentes bajo `components/launchpad/param-panel.tsx`, `param-slider.tsx`, `global-faders.tsx`
- Integración con `chain-store` (`updateParam`, `selectSlot`, `selectDetailPad`)

## Preconditions
- Layout 3 zonas montado (`skills/launchpad-layout.skill.md`)
- `selectedSlotId` + `selectDetailPad` en `stores/chain-store.ts`
- `HYDRA_REGISTRY` con `HydraParam` (min/max/step/default) por función

---

## Architecture

### Component split (intencional pero mejorable)

```
ParamPanel (param-panel.tsx)          ← shell: layout, selección, chips activos
├── PadParamPanel (param-slider.tsx)  ← detalle de UN pad: header (nombre + bypass) + sliders
│   ├── SingleParamSlider             ← Radix horizontal + input numérico editable
│   └── SourceSelector (source-selector.tsx) ← fuente secundaria con draft + Apply/Cancel
└── GlobalFaders (global-faders.tsx)  ← SPEED/BRIGHT/DECAY/AMOUNT (local state)
```

| Archivo | Responsabilidad | Líneas ~ |
|---------|-----------------|----------|
| `param-panel.tsx` | Orquestación, empty state, chips | 77 |
| `param-slider.tsx` | Sliders + header detalle (bypass) | 307 |
| `source-selector.tsx` | Selector de fuente secundaria diferido | 111 |
| `global-faders.tsx` | Faders globales desacoplados | 86 |

> **Nota:** `PadParamPanel` vive en `param-slider.tsx` por herencia del layout anterior. Refactor futuro: renombrar/mover a `pad-param-panel.tsx` y dejar `param-slider.tsx` solo para `SingleParamSlider`.

### Layout placement

- Columna derecha del grid superior: `grid-cols-[1fr_minmax(380px,30%)]`
- `aside` con `overflow-y-auto` (candidato: `scrollbar-thin`)
- Scroll vertical independiente del canvas y la banda de pads

### Three blocks (top → bottom)

1. **Chain chips** — cadena completa ordenada por `activatedAt` vía `ChainChips` compartido; click → `selectSlot`; resalta pad en detalle
2. **Detail** — `PadParamPanel` para el pad resuelto por `selectDetailPad` (armed > selected > reciente)
3. **Global** — `GlobalFaders` separados por `border-t`

### Staging (armed state)

- `armSlot(slotId)` — único punto de entrada (shift+click en pad; futuro shift+tecla)
- Pad armado NO está en `activePads`; preview vía `previewCode = compile(activePads + armed)`
- El armado recibe un `activatedAt` sintético posterior al último pad activo para que el preview lo evalúe al final de la cadena, igual que Apply
- `previewCode` se evalúa SOLO en el mini-canvas PiP (`preview-canvas.tsx`), con instancia Hydra propia montada mientras `armedSlotId != null`
- El canvas principal (`hydra-canvas.tsx`) corre únicamente `compiledCode`; no cambia hasta Apply
- Apply disponible en dos lugares: banner "ARMED" del ParamPanel y footer del PiP → `applyArmedSlot`
- `disarmSlot` desmonta el mini-canvas (libera su contexto WebGL vía `dispose` del evaluador)

### ParamValue (escalar | fn(time))

- Tipo: `ParamValue = number | { kind: "fn"; shape; freq; amp; offset }` en `lib/param-value.ts`
- Toggle `#` / `fn` por parámetro en `SingleParamSlider` (`text-[10px]`, igual que los chips de shape `sin/cos/tan/linear`)
- Compilador emite `({time}) => offset + amp * Math.sin(time * freq)` (variantes sin/cos/tan/linear)
- Global faders siguen escalares

### Extensión futura: arrays (seq)

El mismo `ParamValue` puede extenderse con `{ kind: "seq"; values: number[]; fast: number }`.
El compilador emitiría `[a,b,c].fast(x)` según `docs/hydra-skills-index/arrays/arrays.md`.
Fase posterior a fn(time); no inventar firmas hasta verificar en el índice Hydra.

---

## Selection Model

### `selectDetailPad` (store selector)

```ts
// Prioridad:
// 1. padSlots.find(selectedSlotId) — incluso si isActive === false
// 2. activePad más reciente (max activatedAt)
// 3. null → empty state
```

### Cómo se selecciona un pad

| Origen | Acción |
|--------|--------|
| Click normal en pad | `toggleSlot` + `selectSlot` |
| Ctrl/Alt+click o right-click | solo `selectSlot` |
| Chip "Active" en panel | `selectSlot(instanceId)` |

### Comportamiento clave

- La selección **persiste** si el pad se apaga (útil para re-editar antes de re-activar)
- `clearAll` y `removeSlot` resetean `selectedSlotId` a `null`
- `restoreFromFavorite` resetea selección

---

## PadParamPanel (detalle)

### Main params

- Un `SingleParamSlider` horizontal por cada `HydraParam` del `HydraFunctionDef`
- Valor desde `pad.params[name] ?? param.default`
- Update: `updateParam(instanceId, name, value)` → recompila chain

### Secondary source (modulate / blend) — selección diferida

- Visible si `def.secondarySourceId` está definido en el registro
- `SourceSelector` (`source-selector.tsx`): grilla agrupada de chips `text-[11px]` (target ≥28px) — generadores (`grid-cols-3`) vs buffers `src:o0..o3` (`grid-cols-4`), vía `getSourceOptions()`
- **Draft local**: clickear una fuente distinta NO recompila; guarda borrador (borde amarillo dashed, distinto de la aplicada en color source sólido) y muestra "Apply source" / "Cancel"
- Recién Apply llama `updateSecondarySource(instanceId, sourceId)` — resetea `secondaryParams` a defaults y recompila
- El draft se descarta al cambiar de pad: el selector se monta con `key={pad.instanceId}`
- Sliders secundarios: `updateSecondaryParam(instanceId, name, value)`
- Color secundario: `CATEGORY_COLORS["source"]` atenuado

### Bypass (por pad activo)

- Toggle "bypass" junto al nombre de la función en el header de `PadParamPanel`; visible solo si el slot está activo
- `toggleBypass(instanceId)` → el pad sigue en `activePads` (conserva `activatedAt` y params) pero `chain-compiler` lo saltea al emitir fragmentos
- Si TODOS los pads de un buffer quedan bypasseados → buffer tratado como cadena vacía (sin bloque)
- `isBypassed` se resetea al desactivar el pad (`toggleSlot` off, `releaseSlot`, `clearAll`); se **persiste** en favoritos como parte del snapshot
- Visual: nombre tachado en el header, chip atenuado/tachado en `ChainChips`, badge "byp" + atenuación en el pad

### Instance label

```ts
// "rotate #2" si hay >1 slot activo del mismo functionId
activeOfSameType = padSlots.filter(s => s.functionId === pad.functionId && s.isActive)
```

### Empty / no-params states

- Panel shell: "no pad selected" si `detailPad === null`
- PadParamPanel: "no params" si `params.length === 0` y sin secondary

---

## SingleParamSlider

- **Orientación:** horizontal (optimizado para columna angosta)
- **Debounce:** `requestAnimationFrame` en drag (mantener 60fps)
- **Input editable:** draft local; commit en blur o Enter; clamp a min/max
- **Keyboard guard:** inputs del panel no deben capturar teclas 1–5 del launchpad (`useLaunchpadKeys` usa `isEditableTarget`)

---

## GlobalFaders (estado actual)

```ts
// global-faders.tsx — useState local, NO conectado al store ni compiler
{ speed, brightness, decay, amount }
```

- UI funcional pero **sin efecto** en `compiledCode`
- Duplica concepto de params globales que deberían vivir en store
- Refactor futuro: mover a `chain-store` o capa de "machine globals" y pasar a `compileChain`

---

## Data Flow

```
PadParamPanel slider drag
  → updateParam / updateSecondaryParam
  → padSlots map update
  → deriveActivePads → compileChain
  → compiledCode → HydraCanvas + ChainPreview

Chip click
  → selectSlot
  → selectDetailPad recalcula
  → PadParamPanel re-render con nuevo pad
```

---

## Known Limitations (deuda técnica)

| Limitación | Impacto |
|------------|---------|
| `PadParamPanel` en `param-slider.tsx` | Naming confuso; acopla shell y detalle |
| Global faders locales | No afectan output Hydra |
| Sin indicador visual de pad inactivo seleccionado | Usuario puede editar params de pad apagado sin feedback claro |
| Chips solo muestran activos (excepto detail) | Pad seleccionado inactivo no aparece en lista Active |
| Sin `scrollbar-thin` aún | Scroll nativo grueso en panel largo |
| Instance label usa solo activos | Label `#N` puede desincronizarse si detail pad está inactivo |
| Sin tests | Regresiones en clamp/input commit no detectadas |

---

## Future Steps (refactor roadmap)

### Fase 1 — Estructura y claridad

- [ ] Extraer `PadParamPanel` → `pad-param-panel.tsx`
- [ ] Renombrar `param-slider.tsx` → `single-param-slider.tsx` (o carpeta `param-controls/`)
- [ ] Añadir `scrollbar-thin` al `aside` de ParamPanel
- [ ] Badge/header del pad detail: nombre, categoría, estado activo/inactivo

### Fase 2 — Selección y UX

- [ ] Mostrar pad seleccionado en sección Active aunque esté inactivo (chip "selected")
- [ ] Resaltar chip del pad actual en lista Active
- [ ] Navegación teclado: ↑/↓ entre pads activos en panel (reutilizar `selectedSlotId`)
- [ ] Collapse/expand secciones Global vs Detail

### Fase 3 — Controles y globals

- [ ] Cablear `GlobalFaders` al store + compiler (speed → time, brightness → post-process, etc.)
- [ ] Unificar `GlobalFader` y `SingleParamSlider` en primitiva compartida
- [ ] Soporte de control types por metadata (`HydraParam` → knob, slider, toggle)

### Fase 4 — Performance y polish

- [ ] Selectors granulares: suscribir PadParamPanel solo a params del `instanceId` seleccionado
- [ ] Animación sutil al cambiar pad seleccionado
- [ ] Persistir último `selectedSlotId` en sessionStorage (opcional)

---

## Steps (when modifying)

1. **UI-only en shell** → editar `param-panel.tsx`
2. **Slider / header detalle** → editar `param-slider.tsx`; **selector de fuente** → `source-selector.tsx`
3. **Nuevo param en registry** → automático vía `def.params.map`; verificar secondary si modulate/blend
4. **Cambio de selección** → store: `selectSlot`, `selectDetailPad`; no duplicar lógica en componente
5. **Global faders** → hoy solo `global-faders.tsx`; si se cablean, tocar store + compiler
6. **Actualizar esta skill** si cambia contrato de selección o estructura de archivos

---

## Heuristics

- **Un pad en detalle** — no volver a listar todos los activos con sliders (v1 anterior); chips + detail es el patrón acordado
- **Colores:** `CATEGORY_COLORS[pad.category]` para main; source color para secondary
- **No inventar params** — solo los definidos en `HYDRA_REGISTRY`
- **RAF debounce** en sliders — no remover sin medir jank en canvas
- **Inputs numéricos** — siempre clamp; no commitear NaN
- **Refactor incremental** — extraer archivos sin cambiar behavior en el mismo PR

---

## Examples

**Leer pad para el panel:**
```tsx
const detailPad = useChainStore(selectDetailPad)
```

**Cambiar selección desde chip:**
```tsx
selectSlot(pad.instanceId)
```

**Actualizar param programáticamente:**
```tsx
updateParam(instanceId, "frequency", 30)
```

---

## Failure Modes

| Issue | Causa | Fix |
|-------|-------|-----|
| Panel vacío con pads activos | `selectedSlotId` null y ningún active reciente | activar un pad o click select |
| Slider no actualiza canvas | pad inactivo editado pero no en chain | documentar UX o auto-activar |
| Secondary params resetean | `updateSecondarySource` by design | expected; avisar en UI si se refactoriza |
| Typing en input cambia tab | falta guard en keyboard hook | `isEditableTarget` |
| Global fader sin efecto | no cableado | ver Future Steps fase 3 |

---

## Composition Notes

- **Layout:** `skills/launchpad-layout.skill.md` — columna derecha, ancho, scroll
- **Pads:** `skills/pad-band-and-grid.skill.md` — `selectSlot`, `isSelected`
- **Keyboard:** `skills/launchpad-keyboard.skill.md` — guardas en inputs del panel
- **Scroll:** `skills/ui-scrollbar-thin.skill.md` — aplicar en refactor fase 1
- **Parent:** `skills/launchpad-components.skill.md`
- **Registry:** `docs/hydra-skills-index/` para semántica de params Hydra
