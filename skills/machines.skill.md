# Skill: machines

## Purpose
Define qué es una "machine" en el contexto de hydra-synth-machines: un layout configurado de controles interactivos (pads, sliders, faders) mapeados a funciones Hydra, formando un instrumento autocontenido para síntesis visual en vivo.

## Inputs
- Machine type or concept to implement
- (optional) Physical controller reference for layout inspiration
- (optional) Target Hydra functions or categories to expose

## Outputs
- Machine definition (layout config, control mappings, defaults)
- Components implementing the machine UI
- Store/compiler integration for the machine's control flow

## Preconditions
- Understanding of `HydraFunctionDef` and `HydraCategory` from `lib/hydra-registry.ts`
- `chain-store.ts` as the runtime state manager
- `chain-compiler.ts` as the pure function that converts state → Hydra code
- Familiarity with the launchpad component architecture (see `skills/launchpad-components.skill.md`)

## Conceptual Model

### What is a Machine?

A **machine** is a self-contained visual instrument — a configured combination of interactive controls that maps user gestures to Hydra synthesis parameters. Think of it as:

- **Hardware analogy**: a MIDI controller (Novation Launchpad, Akai APC) with a specific mapping loaded
- **Software analogy**: a virtual instrument plugin with a fixed panel of knobs and buttons

The machine abstracts away the raw code chain and presents **performance-oriented controls** that are:
- Visually organized in a spatial layout
- Mapped to specific Hydra functions and parameters
- Designed for a particular creative workflow

### Machine ≠ Patch

| Machine | Patch |
|---------|-------|
| The **instrument** (controls, layout, mappings) | The **state** (which pads are active, param values) |
| Defines what's possible | Defines what's happening now |
| Persists across sessions | Can be saved/loaded as presets |
| Analogous to synth hardware | Analogous to a preset/program |

## Machine Anatomy

Every machine consists of these layers:

```
┌─────────────────────────────────────────────────┐
│ MACHINE                                          │
├─────────────────────────────────────────────────┤
│ 1. Layout Config                                 │
│    └─ grid dimensions, control positions         │
│                                                  │
│ 2. Pad Grid                                      │
│    └─ array of pads mapped to HydraFunctionDefs  │
│    └─ each pad: toggle/momentary mode            │
│                                                  │
│ 3. Faders / Global Controls                      │
│    └─ continuous controls for global params      │
│    └─ speed, brightness, decay, amount, etc.     │
│                                                  │
│ 4. Param Panel                                   │
│    └─ per-pad detail sliders (auto from params)  │
│    └─ appears when a pad is active               │
│                                                  │
│ 5. Preview                                       │
│    └─ compiled code chain display                │
│    └─ color-coded by category                    │
│                                                  │
│ 6. Output                                        │
│    └─ WebGL canvas running hydra-synth           │
│    └─ target buffer (o0–o3)                      │
└─────────────────────────────────────────────────┘
```

### Data Pipeline

```
Machine Controls → chain-store (Zustand) → chain-compiler → chain-evaluator → Canvas
     ↑                                           ↓
     └──── param slider feedback ←── compiledCode subscription
```

## Physical References

Layout inspiration from physical MIDI controllers (see `docs/machines-layout-reference/`):

| Controller | Layout | Key Feature |
|-----------|--------|-------------|
| Novation Launchpad Mini | 8×8 RGB pads | Color-coded modes, session/note/custom layers |
| Akai APC Mini | 8×8 pads + 9 faders | Fader row below pad grid, shift modes |
| Akai APC Keys 25 | 5×8 pads + keyboard + knobs | Hybrid: pads for clips, keys for notes, knobs for params |
| ESI Xjam | 4×4 pads + 4 faders + transport | Compact, DJ-oriented, dual-deck metaphor |

**Design principle**: the current v1 machine (4×4 + 4 faders) is closest to ESI Xjam compact layout.

## Machine Types

### Current: Basic Grid (v1)

- 4×4 pad grid (16 cells from `HYDRA_REGISTRY`)
- Category filter bar (source, geometry, color, modulate, blend)
- 4 global faders (speed, brightness, decay, amount)
- Per-pad param panel with vertical sliders
- Single output buffer

### Future Possibilities

| Machine Type | Layout | Use Case |
|-------------|--------|----------|
| **Drum Machine** | 4×4 pads, step sequencer row | Rhythmic visual patterns synced to BPM |
| **Keyboard** | Piano-style keys mapped to sources | Melodic exploration of frequencies |
| **XY Performance** | Large XY touchpad + 2 param axes | Continuous gesture-based modulation |
| **Multi-Buffer Mixer** | 4 channel strips (one per buffer) | Mixing multiple visual layers |
| **Modular Rack** | Draggable modules with virtual cables | Full patch-cord routing |
| **Minimal** | 2 pads + 1 fader | Focused exploration of one concept |

## Steps (designing a new machine)

1. **Define the creative intent** — What workflow does this machine optimize for?
2. **Choose layout dimensions** — Grid size, fader count, special controls
3. **Select function subset** — Which `HydraFunctionDef` entries are exposed?
4. **Map controls** — Which pads trigger which functions? Which faders control which global params?
5. **Define defaults** — Initial pad modes, fader positions, active category filter
6. **Implement layout component** — New file in `components/launchpad/` or a new machine folder
7. **Wire to store** — Use existing `chain-store` actions or extend if machine needs new state
8. **Test chain output** — Verify `compileChain` produces valid Hydra code for all combinations
9. **Add visual polish** — Colors, animations, responsive sizing

## Heuristics

- **Physical metaphor first**: design the machine as if it were a hardware unit — what would the user's hands do?
- **Constraint enables creativity**: fewer controls in a machine → more focused exploration
- **One source minimum**: every machine must guarantee at least one source in the chain (compiler rule)
- **Category colors are sacred**: `CATEGORY_COLORS` must be the only source of control colors
- **Touch-friendly**: minimum 44px touch targets for pads; faders need enough travel distance
- **Performance mode vs edit mode**: machines should distinguish "playing" (big controls, few labels) from "configuring" (small controls, all params visible)
- **Responsive**: machines should adapt grid from 4×4 to 2×2 on mobile
- **Preset-able**: machine state (active pads + params) should be serializable for save/load

## Examples

**Create a "Minimal Drone" machine:**
- 2 source pads (osc, noise) — only one active at a time
- 1 modulate pad (modulateScale)
- 3 faders: frequency, scale, modulate amount
- No category filter (functions are pre-selected)
- Always outputs to o0

**Create a "Color Lab" machine:**
- 1 fixed source (gradient, always active)
- 4×2 grid of color functions (colorama, posterize, hue, saturate, brightness, contrast, invert, thresh)
- 2 faders: speed, amount
- Per-pad params auto-shown
- Goal: explore color transforms on a simple base

## Failure Modes

| Issue | Solution |
|-------|----------|
| Machine has no source pad active | Compiler falls back to `solid(0,0,0)` — document this to user |
| Too many active pads tank performance | Set a max active count per machine; deactivate oldest on overflow |
| Faders not affecting output | Verify faders are wired to store → compiler; check they're not local state only |
| Layout breaks on small screens | Use responsive grid (CSS grid with minmax); collapse to fewer columns |
| Machine state lost on navigation | Persist to localStorage or URL state if needed |

## Composition Notes

- **Composed with**: `skills/launchpad-components.skill.md` — implementation details for building machine UIs
- **Depends on**: `docs/hydra-skills-index/` — Hydra function knowledge for choosing pad mappings
- **Future**: machines could be defined as JSON configs loaded at runtime (not hardcoded components)
- **Future**: machine marketplace/gallery where users share machine layouts
- **Relationship**: a machine is to this app what a "rack" is to VCV Rack or a "device" is to Ableton Live
