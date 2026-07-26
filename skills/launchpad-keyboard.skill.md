# Skill: launchpad-keyboard

## Purpose
Guía para atajos de teclado del launchpad: tabs, disparo posicional, panel de params y la capa de direcciones reutilizable por MIDI.

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

## Disparo posicional (fase 2)

Modelo implementado: **posicional por defecto**, sin overrides ni persistencia.

| Fila grilla | Teclas (tab activo) |
|-------------|---------------------|
| Fila 1 (cols 0–7) | Q W E R T Y U I |
| Fila 2 (cols 0–7) | A S D F G H J K |
| Fila 3 | Acciones de params: Z, X, B |

- `lib/pad-key-map.ts` define el mapa físico y las etiquetas visibles.
- `lib/pad-grid-order.ts` es la única fuente del orden: registro → slots base → extras.
- La celda AddPad y placeholders no reciben tecla.
- Los pads muestran su tecla asignada y solo las primeras 16 celdas reciben binding.
- Los extras que exceden la grilla 8×2 se operan con mouse.

### Acciones de teclado

| Tecla | Acción |
|-------|--------|
| Q–I / A–K | Tap: toggle + select; mantener ≥250ms: momentary hasta soltar |
| Shift + tecla de pad | Armar/desarmar un pad inactivo para preview |
| Alt + tecla de pad | Seleccionar sin toggle |
| Ctrl+click | Aplicar el pad armado |
| Space | Abrir AddPad de la categoría activa y enfocar su búsqueda |
| 1–5 | Cambiar tab de categoría |
| Shift+1–4 | Cambiar el output editado: o0–o3 |
| P / O | Mostrar el foco de params / volver al foco de pads |
| ↑ / ↓ | Recorrer los controles del panel de params |
| ← / → | Ajustar 1% del rango; Shift ajusta 10% |
| Ctrl+← / → | Recorrer pads activos de la cadena |
| Z / X / B | Alternar scalar/fn, enfocar source, bypass del pad |
| Enter | Aplicar el draft de source enfocado o el pad armado |
| Escape | Desarmar el pad |
| Shift+Backspace/Delete | Eliminar el slot extra seleccionado |

### Guardas

- Ignorar repeticiones automáticas de teclas.
- No disparar atajos en inputs editables u overlays Radix abiertos.
- Los botones activados por mouse pierden foco después del pointerup, para no bloquear la grilla.
- Usar `event.code` para conservar las posiciones físicas entre layouts de teclado.

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
- **Focus model** — `focusZone` + `focusedControlId` viven en el store y no dependen del foco DOM.
- **MIDI** — `lib/launchpad-controls.ts` expone ControlAddress y valores normalizados reutilizables.

---

## Failure Modes

| Issue | Fix |
|-------|-----|
| 1–5 no cambia tab | hook no montado o target es input |
| Typing en search dispara tab | verificar `isEditableTarget` |
| AZERTY rompe mapeo | usar `event.code` Physical keys |

---

## Composition Notes

- **Store**: `selectedSlotId`, `focusZone`, `focusedControlId`, `selectControlList`
- **Grid**: `pad-band-and-grid.skill.md` — orden de celdas
- **Layout**: footer cheatsheet en `launchpad-layout.skill.md`
