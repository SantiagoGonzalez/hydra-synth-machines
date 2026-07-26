# Skill: launchpad-keyboard

## Purpose
Guía para atajos de teclado del launchpad: implementación actual (tabs 1–5) y extensión futura (disparo posicional de pads, overrides configurables, MIDI).

## Inputs
- Nuevo binding de tecla
- Conflictos con inputs editables (sliders, Command search)
- Plan de mapeo tipo launchpad físico

## Outputs
- Handlers en `hooks/use-launchpad-keys.ts` (o sucesor)
- Comportamiento predecible sin interferir con edición de texto

## Preconditions
- `CATEGORIES` ordenado: source, geometry, color, modulate, blend
- `PadBand` expone `activeCategory` + `setActiveCategory`

---

## Current Implementation (fase 1)

**Archivo**: `hooks/use-launchpad-keys.ts`

```ts
Digit1 → CATEGORIES[0] (source)
Digit2 → geometry
Digit3 → color
Digit4 → modulate
Digit5 → blend
```

### Guardas obligatorias

```ts
if (event.ctrlKey || event.metaKey || event.altKey) return
if (isEditableTarget(event.target)) return  // input, textarea, select, contenteditable
```

- Usar **`event.code`** (no `event.key`) para layouts no-US
- `preventDefault()` solo cuando se maneja el binding

### Wiring

```tsx
// pad-band.tsx
const [activeCategory, setActiveCategory] = useState<HydraCategory>("source")
useLaunchpadKeys(setActiveCategory)
```

Footer cheatsheet en `page.tsx`: `1–5 tabs · click toggle · ctrl/alt+click select · ...`

---

## Future Phase (planificado)

### Disparo posicional de pads

Modelo acordado: **posicional por defecto, override configurable por pad**.

| Fila grilla | Teclas (tab activo) |
|-------------|---------------------|
| Fila 1 (cols 0–7) | Q W E R T Y U I |
| Fila 2 (cols 0–7) | A S D F G H J K |

- Índice de celda en `pad-grid.tsx` es el ancla del mapeo
- Orden estable: registro → slots por functionId → AddPad → placeholders

### Selección vs toggle por teclado

- Click mouse: toggle + select (implementado)
- Modificador: select only (implementado)
- Teclado futuro: definir si Space/Enter togglean celda enfocada

### Persistencia de bindings

- localStorage por slot o por celda (tab + index)
- MIDI como capa encima del mismo mapa de celdas

---

## Steps (add keyboard feature)

1. Extender `useLaunchpadKeys` o crear handler dedicado — **un solo punto de entrada**
2. Agregar guardas antes de cualquier `preventDefault`
3. Documentar en footer cheatsheet
4. Probar con AddPad CommandInput abierto y param value inputs
5. No romper selección con modificadores del OS

---

## Heuristics

- **Opt-in por zona** — solo launchpad page monta el hook
- **No global hotkeys** en docs/playground sin revisar conflictos
- **Focus model** — hoy no hay `focusedCellIndex`; agregar al store si se implementa navegación con flechas
- **selectedSlotId** ya existe para ParamPanel; reutilizar para teclado

---

## Failure Modes

| Issue | Fix |
|-------|-----|
| 1–5 no cambia tab | hook no montado o target es input |
| Typing en search dispara tab | verificar `isEditableTarget` |
| AZERTY rompe mapeo | usar `event.code` Physical keys |

---

## Composition Notes

- **Store**: `selectedSlotId`, `selectSlot`, `toggleSlot`
- **Grid**: `pad-band-and-grid.skill.md` — orden de celdas
- **Layout**: footer cheatsheet en `launchpad-layout.skill.md`
