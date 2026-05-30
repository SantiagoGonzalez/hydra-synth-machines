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
│   ├── machine-layout.tsx      ← grid orchestrator: category filter, 4×4 pads, global faders, param panel
│   ├── pad.tsx                 ← atomic pad: pointer events, toggle/momentary modes, color glow
│   ├── param-slider.tsx        ← vertical Radix slider per param + PadParamPanel wrapper
│   ├── chain-preview.tsx       ← compiled code display with color-coded tokens
│   └── hydra-canvas.tsx        ← WebGL canvas, initializes hydra-synth, evaluates code
```

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

- `ActivePad`: `{ instanceId, functionId, category, params: Record<string, number>, mode, activatedAt }`
- Actions: `activatePad`, `deactivatePad`, `togglePad`, `updateParam`, `clearAll`, `setOutputBuffer`, `markSafeCode`
- Selectors: `selectIsPadActive`, `selectActivePadInstance`

### Chain Compilation Rules (`lib/chain-compiler.ts`)

1. Pads sorted by `activatedAt` (activation order = chain order)
2. If first pad is NOT a source → prepend `solid(0,0,0)`
3. Sources after the first are skipped (linear chain v1)
4. `modulate`/`blend` pads use a hardcoded `secondarySourceId` for their inner texture
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

- **Pad grid**: 4×4 (16 cells). Filtering by category may show fewer — fill remaining with empty cells
- **Pointer capture**: Pad uses `setPointerCapture` for reliable momentary mode on touch/mouse
- **Animation budget**: param sliders use `requestAnimationFrame` debounce to maintain 60fps
- **Color convention**: `CATEGORY_COLORS` from hydra-registry is the single source of pad/token colors
- **Glow animation**: active pads pulse with framer-motion `boxShadow` keyframes
- **Global faders**: currently local state in `MachineLayout` — not yet wired to the compiler
- **Component size**: keep each component under 250 lines (project rule)
- **Comments**: complex functions get a one-line Spanish comment at the top (project rule)
- **File naming**: all new `.tsx`/`.ts` files use kebab-case

## Examples

**Add a new Hydra function to the grid:**
1. Add entry to `HYDRA_REGISTRY` in `lib/hydra-registry.ts` with id, label, category, params
2. If it's `modulate`/`blend` type, set `secondarySourceId` to a source function id
3. The grid auto-populates from `HYDRA_REGISTRY.slice(0, 16)` — adjust slicing or add pagination

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
| Multiple pads of same function | Current `togglePad` deduplicates by `functionId` — only one instance per function |
| Error in evaluated code | `hydra-canvas.tsx` catches via `onError` callback → reverts to `lastSafeCode` |
| Performance regression | Profile — likely too many store subscriptions. Use granular selectors |
| Pad not responding to touch | Verify `setPointerCapture` is called on pointerdown; check pointer event types |

## Composition Notes

- **Depends on**: `docs/hydra-skills-index/` for Hydra API knowledge when building new functions
- **Depends on**: `skills/machines.skill.md` for understanding machine architecture concepts
- **Extends**: pad grid can evolve into multi-machine layouts (see machines skill)
- **Does NOT own**: Hydra function documentation (that's in the docs skill index)
- **Relationship to organize-skill-system**: after creating sub-components or new patterns, register in index
