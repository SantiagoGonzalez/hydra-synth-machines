# Skill: launchpad-components

## Purpose
Guía para iterar sobre los componentes del launchpad VJ — el grid de pads interactivo que genera cadenas Hydra en tiempo real. Define la arquitectura existente, convenciones de datos y reglas de extensión.

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
- `chain-store.ts` Zustand store is the single source of truth for active pads

## Architecture Overview

### Component Tree

```
app/launchpad/page.tsx          ← page shell (header, two-column layout, footer)
├── components/launchpad/
│   ├── machine-layout.tsx      ← orchestrator: SectionRows per category, global faders, param panel
│   ├── section-row.tsx         ← row per category: header + FunctionGroups (3 pads each) + AddPad
│   ├── add-pad.tsx             ← "+" pad with Popover + Command palette to add extra slot instances
│   ├── pad.tsx                 ← atomic pad: pointer events, toggle/momentary, glow, isExtra X button
│   ├── param-slider.tsx        ← vertical Radix slider per param + PadParamPanel (shows instance #N)
│   ├── chain-preview.tsx       ← compiled code display with color-coded tokens
│   └── hydra-canvas.tsx        ← WebGL canvas, initializes hydra-synth, evaluates code
```

> For detailed documentation of `section-row.tsx` and `add-pad.tsx`, see `skills/section-rows-and-add-pad.skill.md`

### Data Flow

```
[User taps Pad] → chain-store.activatePad / togglePad / deactivatePad
    → store rebuilds activePads[]
    → compileChain(activePads, outputBuffer) → compiledCode
    → HydraCanvas subscribes to compiledCode → evaluatorRef.run(code)
    → ChainPreview subscribes to compiledCode → tokenizes + renders
```

### Key Types (`lib/hydra-registry.ts`)

- `HydraCategory`: `"source" | "geometry" | "color" | "blend" | "modulate"`
- `HydraParam`: `{ name, default, min, max, step }`
- `HydraFunctionDef`: `{ id, label, category, params, secondarySourceId?, description? }`
- `CATEGORY_COLORS`: maps each category to a hex color — single source for pad/token colors
- `CATEGORY_LABELS`: display names per category

### Key Types (`stores/chain-store.ts`)

- `ActivePad`: `{ instanceId, functionId, category, params: Record<string, number>, secondarySourceId?, secondaryParams?, mode, activatedAt }`
  - `secondarySourceId` — runtime-selected source for modulate/blend pads
  - `secondaryParams` — current parameter values for the selected secondary source
- `PadSlot extends ActivePad`: `{ ...ActivePad, isActive: boolean, isExtra: boolean }`
  - `isActive` — true if the slot is on and contributing to the chain
  - `isExtra` — true if created via the "+" pad; these can be removed via the X button
  - **`padSlots[]`** is the source of truth; `activePads[]` is derived: `padSlots.filter(s => s.isActive)`
- Actions:
  - `toggleSlot(slotId)` — toggle `isActive` on a specific slot (primary toggle action)
  - `addSlot(functionId)` — create a new extra slot for a function (via "+" pad)
  - `removeSlot(slotId)` — delete an extra slot (validates: must not be the last of that functionId)
  - `updateParam`, `updateSecondarySource`, `updateSecondaryParam` — param editing by `instanceId` (= `slotId`)
  - `clearAll` — sets all slots to `isActive: false` (slots remain visible)
  - `activatePad`, `deactivatePad` — legacy/momentary API (still used for momentary mode)
- Selectors: `selectIsPadActive`, `selectActivePadInstance`

### Chain Compilation Rules (`lib/chain-compiler.ts`)

1. Pads sorted by `activatedAt` (activation order = chain order)
2. If first pad is NOT a source → prepend `solid(0,0,0)`
3. Sources after the first are skipped (linear chain v1)
4. `modulate`/`blend` pads build secondary source call from `pad.secondarySourceId` + `pad.secondaryParams` (falls back to `def.secondarySourceId` defaults if not set)
5. Chain ends with `.out()` (or `.out(oN)` for non-default buffer)
6. Params rounded to 4 decimals for clean preview

### Evaluator (`lib/chain-evaluator.ts`)

- Dynamically imports `hydra-synth`
- Exposes whitelisted functions in a sandboxed `Function()` context
- Distinguishes structural changes (pad add/remove → full re-eval) from param tweaks
- Tracks `lastSafeCode` for error recovery — reverts on eval failure

## Steps (when modifying the launchpad)

1. **Identify layer** — Is the change UI-only (component), data (store), or compilation logic?
2. **Check existing pattern** — Follow the established patterns listed above before introducing new ones
3. **Modify store first** — If new state is needed, add to `chain-store.ts` with proper Zustand selectors
4. **Update compiler** — If the chain output format changes, modify `chain-compiler.ts`
5. **Update component** — Wire the new store action/selector into the component tree
6. **Verify reactivity** — Ensure `compiledCode` updates trigger both canvas re-eval and preview re-render
7. **Test edge cases** — Empty pads, only sources, only transforms, mode switches, rapid toggling

## Heuristics

- **Layout**: sections per category (Source → Geometry → Color → Modulate → Blend). No category filter bar — all sections always visible
- **Pad slots**: 3 base slots per function by default; extra slots added via "+" pad (`isExtra: true`)
- **Pointer capture**: Pad uses `setPointerCapture` for reliable momentary mode on touch/mouse
- **Animation budget**: param sliders use `requestAnimationFrame` debounce to maintain 60fps
- **Color convention**: `CATEGORY_COLORS` from hydra-registry is the single source of pad/token colors
- **Glow animation**: active pads pulse with framer-motion `boxShadow` keyframes
- **Global faders**: currently local state in `MachineLayout` — not yet wired to the compiler
- **Secondary source panel**: `PadParamPanel` shows a source-selector row + secondary sliders for pads with `secondarySourceId`. Source buttons use `CATEGORY_COLORS["source"]`
- **Instance label in param panel**: if multiple slots of the same function are active, param panel shows `"rotate #2"` etc.
- **`activePadsWithParams` filter**: includes pads with zero main params but a `secondarySourceId` (e.g. `layer`) so the param panel always opens for modulate/blend pads
- **Registry helpers**: `getSourceOptions()` for source selector lists; `getRegistryByCategory(cat)` for section rendering
- **Component size**: keep each component under 250 lines (project rule)
- **Comments**: complex functions get a one-line Spanish comment at the top (project rule)
- **File naming**: all new `.tsx`/`.ts` files use kebab-case

## Examples

**Add a new Hydra function to the grid:**
1. Add entry to `HYDRA_REGISTRY` in `lib/hydra-registry.ts` with id, label, category, params
2. If it's `modulate`/`blend` type, set `secondarySourceId` to the *default* source id — the user can change it at runtime via the source selector
3. `initPadSlots()` auto-generates 3 slots; `getRegistryByCategory()` picks it up in `SectionRow`; `AddPad` lists it automatically

**Change the secondary source for a modulate pad at runtime:**
```ts
updateSecondarySource(instanceId, "osc")  // resets secondaryParams to osc defaults
updateSecondaryParam(instanceId, "frequency", 30)  // then tweak individual params
```

**Read which source a modulate pad is currently using:**
```ts
const pad = activePads.find(p => p.instanceId === instanceId)
const sourceId = pad.secondarySourceId ?? getFunctionDef(pad.functionId)?.secondarySourceId
```
3. No slicing needed — all functions appear in their respective section rows

**Add a new control type (e.g., XY pad):**
1. Create `components/launchpad/xy-pad.tsx` (atomic, self-contained)
2. Wire to `updateParam` from `chain-store` (same interface as sliders)
3. Render conditionally in `PadParamPanel` based on param metadata

**Wire global faders to compilation:**
1. Add global params to `ChainState` in the store
2. Pass them to `compileChain` or wrap the output code with global transforms
3. Subscribe `MachineLayout` global faders to the store actions

## Failure Modes

| Issue | Solution |
|-------|----------|
| Canvas black after pad toggle | Check `compileChain` output — likely missing source; verify `SAFE_SOURCE` fallback |
| Slider jank on fast drag | Ensure RAF debounce in `SingleParamSlider`; don't subscribe to full store |
| Multiple pads of same function | Each slot is independent — multiple instances of the same function are supported. Use `addSlot(functionId)` via "+" pad. |
| Error in evaluated code | `hydra-canvas.tsx` catches via `onError` callback → reverts to `lastSafeCode` |
| Performance regression | Profile — likely too many store subscriptions. Use granular selectors |
| Pad not responding to touch | Verify `setPointerCapture` is called on pointerdown; check pointer event types |

## Composition Notes

- **Depends on**: `docs/hydra-skills-index/` for Hydra API knowledge when building new functions
- **Depends on**: `skills/machines.skill.md` for understanding machine architecture concepts
- **Extends**: pad grid can evolve into multi-machine layouts (see machines skill)
- **Does NOT own**: Hydra function documentation (that's in the docs skill index)
- **Relationship to organize-skill-system**: after creating sub-components or new patterns, register in index
