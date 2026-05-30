# `prev()`

> Referencia el fotograma anterior del buffer de salida actual, como atajo para bucles de retroalimentación sin nombrar `o0`–`o3` explícitamente.

## Parameters

None.

## Role in the Pipeline

`prev` is a **source** that samples the previous frame of whichever buffer the chain is writing to. It is functionally similar to `src(o0)` when the chain ends in `.out(o0)`, but avoids hard-coding buffer names.

Use it when building self-referential feedback where the output buffer is implicit or when prototyping quick feedback loops.

> **TODO:** Detailed behavior (exact buffer resolution, interaction with `render()`, multi-buffer edge cases) not found in primary sources. Prefer [`src`](src.md) with explicit buffer names for multi-buffer patches.

## Composition Examples

```js
// Feedback: diferencia entre el frame actual y el anterior
shape(4, 0.8).diff(prev().scale(0.9)).out(o0)

// Voronoi con acumulación temporal
voronoi(10, 0).diff(prev().scale(0.9)).out(o0)

// Equivalente explícito con src (más predecible en multi-buffer)
voronoi(10, 0).diff(src(o0).scale(0.9)).out(o0)
```

## Common Uses & Pitfalls

- **Prefer `src(buffer)`** when working with multiple buffers (`o0`–`o3`); `prev()` may be ambiguous about which buffer it reads in complex sketches.
- **Feedback damping**: pair with [`blend`](../blend/blend.md) or small transform amounts; undamped `prev()` loops saturate quickly.
- **Clipping**: like `src`, reading a buffer returns values clamped to [0, 1].

## Related Functions

- [`src`](src.md) — explicit buffer read; recommended for production patches
- [`diff`](../blend/diff.md) — common pairing for temporal difference effects
- [`scale`](../geometry/scale.md) — slight scale on `prev()` creates zoom feedback
