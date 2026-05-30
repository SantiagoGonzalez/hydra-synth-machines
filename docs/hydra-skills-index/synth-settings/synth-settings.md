# Synth Settings & Globals

> Control de renderizado, tiempo, resolución y salida de buffers.

## Output & Render

| Function | Purpose |
|----------|---------|
| `.out()` | Render chain to default/main output |
| `.out(o0)` … `.out(o3)` | Write to buffer `o0`–`o3` |
| `render()` | Display all active buffers (split view when multiple) |
| `update()` | Force update cycle |
| `hush()` | Clear/stop output |

## Timing & Globals

| Global | Purpose |
|--------|---------|
| `time` | Elapsed seconds — use in `() => Math.sin(time)` |
| `speed` | Global speed multiplier |
| `bpm` | Beats per minute for tempo-synced patches |
| `mouse` | Mouse position (interactivity) |
| `width`, `height` | Viewport dimensions |

## Configuration

| Function | Purpose |
|----------|---------|
| `setResolution(w, h)` | Change canvas resolution |
| `setFunction(name, fn)` | Custom function registration |

> **TODO:** Exact signatures for `setFunction`, `update`, and `hush` side effects not detailed in Hydra Book sections used for this index.

## Role in the Pipeline

These are **not chain transforms** — they configure the synth or terminate chains. Every patch ends with `.out()` (optionally targeting a buffer) and often `render()` when using multiple buffers.

## Composition Examples

```js
osc(40, 0, 1).out(o0)
noise(3, 0).out(o1)
osc(40, 0, 1).modulate(noise(3, 0)).out(o2)
render()

// Animación con time
osc(() => 10 + Math.sin(time) * 5, 0.1, 0).out()

// Velocidad global
speed = 2
```

## Common Uses & Pitfalls

- **Buffer order**: declare dependencies first (`o0` before `src(o0)` in `o1`).
- **`render()`** required to see multi-buffer debug layout.
- Writing to buffers **clips** RGB to [0, 1] — affects [`src`](../sources/src.md) reads.

## Related Functions

- [`src`](../sources/src.md) — read `o0`–`o3`
- [`blend`](../blend/blend.md) — feedback damping
- [`arrays`](../arrays/arrays.md) — sequenced parameters
