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

## Disparo posicional (fase 2)

Modelo implementado: **posicional por defecto**, sin overrides ni persistencia.

| Fila grilla | Teclas (tab activo) |
|-------------|---------------------|
| Fila 1 (cols 0–7) | Q W E R T Y U I |
| Fila 2 (cols 0–7) | A S D F G H J K |
| Fila 3 (cols 0–7) | Z X C V B N M , |

- `lib/pad-key-map.ts` define el mapa físico y las etiquetas visibles.
- `lib/pad-grid-order.ts` es la única fuente del orden: registro → slots base → extras.
- La celda AddPad y placeholders no reciben tecla.
- Los pads muestran su tecla asignada; las filas posteriores a la tercera solo se controlan con mouse.

### Acciones de teclado

| Tecla | Acción |
|-------|--------|
| Q–I / A–K / Z–, | Tap: toggle + select; mantener ≥250ms: momentary hasta soltar |
| Shift + tecla de pad | Armar/desarmar un pad inactivo para preview |
| Alt + tecla de pad | Seleccionar sin toggle |
| Space | Abrir AddPad de la categoría activa y enfocar su búsqueda |
| 1–5 | Cambiar tab de categoría |
| Shift+1–4 | Cambiar el output editado: o0–o3 |
| Enter | Aplicar el pad armado |
| Escape | Desarmar el pad |
| Shift+Backspace/Delete | Eliminar el slot extra seleccionado |

### Guardas

- Ignorar repeticiones automáticas de teclas.
- No disparar atajos en inputs editables, elementos interactivos o overlays Radix abiertos.
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
