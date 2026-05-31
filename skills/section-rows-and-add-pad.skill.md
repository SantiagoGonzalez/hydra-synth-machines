# Skill: section-rows-and-add-pad

## Purpose
Guía para trabajar con el layout de secciones por categoría y el sistema de pad dinámico ("+") del launchpad. Documenta la arquitectura de `SectionRow`, `AddPad`, el modelo `PadSlot`, y cómo agregar/eliminar instancias de funciones Hydra en tiempo real.

## Inputs
- Cambios en la disposición de secciones o funciones por categoría
- Nuevos tipos de pads dinámicos o variantes del picker "+"
- Ajustes al ciclo de vida de slots (creación, activación, eliminación)

## Outputs
- Secciones renderizadas correctamente con pads agrupados por función
- Pad "+" funcional con command palette inline
- Slots extra creados/eliminados sin romper el chain

## Preconditions
- `HYDRA_REGISTRY` tiene todas las funciones (38+) organizadas por categoría
- `getRegistryByCategory(cat)` devuelve las funciones de una categoría
- `chain-store.ts` usa `PadSlot[]` como fuente de verdad (no `ActivePad[]` directamente)
- Componentes `Command` y `Popover` de shadcn/ui disponibles en `components/ui/`

---

## Architecture

### Layout Model

```
MachineLayout
├── Header (Shuffle + Clear buttons)
├── SectionRow[source]         ← labeled row, color #ff4444
│   ├── FunctionGroup[osc]     ← 3 pads base + N extras vía "+"
│   ├── FunctionGroup[noise]
│   ├── ...
│   └── AddPad                 ← pad "+" abre command palette
├── SectionRow[geometry]       ← labeled row, color #44aaff
│   ├── FunctionGroup[rotate]
│   ├── ...
│   └── AddPad
├── SectionRow[color]          ← labeled row, color #cc44ff
├── SectionRow[modulate]       ← labeled row, color #44ff88
├── SectionRow[blend]          ← labeled row, color #ffaa44
├── Global Faders
└── Param Panel (slots activos con sliders)
```

### Key Type: `PadSlot` (`stores/chain-store.ts`)

```ts
interface PadSlot extends ActivePad {
  isActive: boolean   // true = contribuye al chain compilado
  isExtra: boolean    // true = fue agregado vía "+" → puede eliminarse con X
}
```

- **Inicialización**: `initPadSlots()` crea **3 slots por función** del `HYDRA_REGISTRY`
- **`instanceId` base**: `"functionId-1"`, `"functionId-2"`, `"functionId-3"`
- **`instanceId` extra**: `"functionId-extra-{timestamp}"`
- **`activatedAt: 0`**: indica que el slot aún no ha sido activado

### Store Actions

| Action | Trigger | Efecto |
|--------|---------|--------|
| `toggleSlot(slotId)` | Tap en pad | Alterna `isActive`; asigna `activatedAt = Date.now()` al activar |
| `addSlot(functionId)` | Selección en AddPad | Crea `PadSlot` extra con `isActive: false`, lo añade a `padSlots` |
| `removeSlot(slotId)` | Click en X del pad | Elimina slot — solo si `isExtra` y no es el único del `functionId` |
| `clearAll()` | Botón Clear | Pone `isActive: false` en todos (slots permanecen visibles en UI) |

### Derivación de `activePads`

```ts
// Derivación interna del store — compiler sigue recibiendo ActivePad[]
function deriveActivePads(padSlots: PadSlot[]): PadSlot[] {
  return padSlots.filter(s => s.isActive).sort((a, b) => a.activatedAt - b.activatedAt)
}
```

El compiler (`chain-compiler.ts`) recibe `activePads` derivado y no necesita conocer `PadSlot`.

---

## Component: `section-row.tsx`

**Archivo**: `components/launchpad/section-row.tsx`

### Props

```ts
interface SectionRowProps {
  category: HydraCategory
  padSlots: PadSlot[]       // todos los slots; filtra internamente por categoría
  padModes: Record<string, "toggle" | "momentary">
  onToggleSlot: (slotId: string) => void
  onRemoveSlot: (slotId: string) => void
  onAddSlot: (functionId: string) => void
  onModeChange: (slotId: string, mode: "toggle" | "momentary") => void
  onMomentaryStart: (slotId: string) => void
  onMomentaryEnd: (slotId: string) => void
}
```

### Estructura interna

1. **Header** — dot coloreado + label uppercase (`CATEGORY_LABELS[category]`) + línea separadora horizontal
2. **FunctionGroups** — `flex-wrap gap-x-3 gap-y-2`, un `FunctionGroup` por cada función del registro en esa categoría
3. **AddPad** — al final del flex-wrap, misma alineación que los grupos

### Sub-componente `FunctionGroup`

```
FunctionGroup[rotate]
├── label "rotate" (font-mono 8px, color categoría, opacity baja si inactivo)
└── fila de pads [rotate#1] [rotate#2] [rotate#3] [extra...]
```

- Agrupación: `getRegistryByCategory(category)` → para cada función → filtra `padSlots` por `functionId`
- Si un grupo no tiene slots (edge case), se omite

### Regla de `slotLabel`

```ts
// Si hay más de 1 slot para el functionId, mostrar "#1", "#2", etc.
// Si solo hay 1, mostrar string vacío (el Pad muestra el badge de categoría como fallback)
const label = slotsForFn.length > 1 ? `#${indexInGroup + 1}` : ""
```

---

## Component: `add-pad.tsx`

**Archivo**: `components/launchpad/add-pad.tsx`

### Props

```ts
interface AddPadProps {
  category: HydraCategory
  functions: HydraFunctionDef[]   // todas las funciones de la categoría
  onAdd: (functionId: string) => void
}
```

### Comportamiento

1. **Visual**: borde dashed, ícono `<Plus />`, texto "add" — color de la categoría al hacer hover/open
2. **Tap** → abre `Popover` (shadcn, `side="top"`, `align="start"`, `sideOffset={6}`)
3. **Dentro del Popover**: componente `Command` (shadcn) con:
   - `CommandInput` para búsqueda filtrada
   - `CommandList` (`max-h-48`, scrollable)
   - `CommandItem` por función → muestra `fn.label` con color + `fn.description` en gris
4. **Selección** → ejecuta `onAdd(functionId)` + `setOpen(false)`
5. El nuevo slot aparece **inactivo** al final de su `FunctionGroup`

### Notas de implementación

- Usa estado local `const [open, setOpen] = useState(false)` dentro del componente
- `PopoverContent`: `w-48 p-0 border-white/10 bg-black/95`
- El `CommandItem` usa `onSelect` (no `onClick`) para compatibilidad con teclado

---

## Component: `pad.tsx` — Extensiones para PadSlot

**Archivo**: `components/launchpad/pad.tsx`

### Props agregadas (vs versión original)

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `slotLabel` | `string?` | `undefined` | Etiqueta de instancia, ej. `"#2"` |
| `isExtra` | `boolean?` | `false` | Muestra botón X para eliminar |
| `onRemove` | `() => void?` | `undefined` | Callback al hacer click en X |

### Botón X (eliminar slot extra)

```tsx
{isExtra && (
  <button
    onClick={handleRemove}   // stopPropagation interno
    className="absolute top-0.5 left-0.5 w-4 h-4 ..."
    title="Eliminar slot"
  >
    <X className="w-2.5 h-2.5" />
  </button>
)}
```

- Posición: `absolute top-0.5 left-0.5`
- Color: `text-white/20` → hover `text-red-400/70`
- **Crítico**: usa `e.stopPropagation()` para no activar el toggle del pad

### `slotLabel` como badge

```tsx
<span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">
  {slotLabel ?? functionDef.category.slice(0, 3)}
</span>
```

Si `slotLabel` está vacío → fallback al badge de categoría (`"src"`, `"geo"`, etc.)

---

## Steps: Agregar más funciones a una sección

1. Agregar `HydraFunctionDef` al `HYDRA_REGISTRY` en `lib/hydra-registry.ts`
2. `initPadSlots()` auto-genera 3 slots para la nueva función al inicializar el store
3. `getRegistryByCategory()` la incluye automáticamente en el `SectionRow`
4. `AddPad` la lista automáticamente en su picker sin cambios adicionales
5. Verificar que el chain compiler maneja la función correctamente

## Steps: Agregar un slot extra en runtime

1. Usuario tap "+" → abre picker → selecciona función
2. `addSlot(functionId)` en store → crea `PadSlot` con `isExtra: true`, `isActive: false`
3. El slot aparece al final del `FunctionGroup` correspondiente (inactivo)
4. El usuario puede activar/desactivar igual que los slots base
5. Click en X → `removeSlot(slotId)` → validación interna → eliminación del slot

---

## Heuristics

- **3 pads base por función** — `isExtra: false`, nunca eliminables desde la UI
- **Slots extra** — `isExtra: true`, se eliminan con el botón X (validación: no borrar el único)
- **Toggle independiente** — cada pad se activa/desactiva individualmente, sin lógica LIFO ni agrupación
- **Pad desactivado permanece visible** — `clearAll` solo pone `isActive: false`, no borra el slot
- **Chain order = `activatedAt`** — el orden en la cadena refleja el orden temporal de activación
- **Sin límite de chain** — no hay cap en la cantidad de slots activos simultáneos
- **Sources en chain** — solo la primera source activa inicia la cadena; las adicionales se ignoran (comportamiento del compiler)
- **Command palette cierra al seleccionar** — no multi-selección
- **`flex-wrap` obligatorio** — los grupos de pads deben envolver para evitar overflow horizontal
- **`gap-x-3` entre grupos, `gap-1` entre pads del mismo grupo** — separación visual que distingue grupos de instancias

---

## Failure Modes

| Issue | Causa probable | Solución |
|-------|---------------|----------|
| `AddPad` no muestra funciones | `getRegistryByCategory(cat)` retorna array vacío | Verificar que las funciones tienen el `category` correcto en el registro |
| Slot extra no aparece | `addSlot` no actualiza `padSlots` | Confirmar que el store retorna nuevo array (inmutabilidad Zustand) |
| No se puede eliminar slot | `isExtra: false` o es el único del `functionId` | La validación de `removeSlot` es correcta; mostrar feedback al usuario si aplica |
| Param panel muestra instancias confusas | Labels basados en `activeOfSameType` calculados incorrectamente | Verificar filtro por `functionId && isActive` antes de calcular índice |
| Muchos pads causan overflow horizontal | Container sin `flex-wrap` | Verificar que `FunctionGroup` usa `flex flex-wrap` o que el padre lo tiene |
| Popover detrás de otros elementos | `z-index` o `portal` mal configurado | Popover de shadcn usa portal por defecto; verificar que no hay `overflow: hidden` en ancestros |
| `toggleSlot` no actualiza el chain | `deriveActivePads` no re-ejecuta | Verificar que el store hace `set({ padSlots, activePads, compiledCode })` atómicamente |

---

## Composition Notes

- **Depende de**: `skills/launchpad-components.skill.md` para contexto general del launchpad y compiler
- **Depende de**: `docs/hydra-skills-index/` para API y parámetros de funciones Hydra
- **Usa**: shadcn `Command` + `Popover` — no inventar nuevos pickers
- **No modifica**: `HydraCanvas`, `chain-evaluator.ts`, `favorites-store.ts`
- **Relación con `launchpad-components`**: este skill es una extensión especializada; para preguntas sobre el compiler o el canvas, consultar el skill de launchpad-components
