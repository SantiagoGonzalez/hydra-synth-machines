# Hydra Composition Guide

> Guía mental para construir patches interactivos: fuentes, geometría, color, fusión y modulación en cadena.

This guide describes **how to think** when composing Hydra visuals — not a syntax list. For per-function detail, see the [skill index](index.md).

**Sources:** [Hydra Functions](https://hydra.ojack.xyz/functions/) · [Hydra Book](https://hydra-book.glitches.me/)

---

## 1. Mental Model

Hydra follows **modular synthesis** logic: connect generators and processors with dots, analogous to patching cables.

```
Source  →  Geometry  →  Color  →  Blend/Out  →  Buffer (o0–o3)
                ↓
           Modulate (can appear after geometry or color)
```

| Stage | Role | Examples |
|-------|------|----------|
| **Source** | Creates base texture | `osc()`, `noise()`, `shape()`, `gradient()`, `src(o1)` |
| **Geometry** | Moves/transforms UV space | `rotate()`, `scale()`, `repeat()`, `kaleid()`, `pixelate()`, `scroll()` |
| **Color** | Alters channels / HSV | `hue()`, `colorama()`, `luma()`, `color()`, `posterize()` |
| **Modulate** | Warp sampling using another texture | `modulate()`, `modulateScale()`, `modulateRotate()` |
| **Blend** | Combine chains or buffers | `layer()`, `blend()`, `add()`, `diff()`, `mult()`, `mask()` |
| **Out** | Write to screen or buffer | `.out()`, `.out(o0)`, `render()` |

**Buffers (`o0`–`o3`)** are patch points: render a sub-patch to a buffer, then `src(o1)` in another chain. This is how multi-layer compositions and feedback loops are built.

---

## 2. Order of Operations

Chain order **changes the image**. There is no commutative "filter stack" — each function rewrites UVs or colors for the next step.

### Geometry before color (recommended default)

```js
osc(30, 0, 1).kaleid(6).hue(0.2).out()   // symmetry first, then tint
```

- **Geometry first:** `kaleid`, `repeat`, `pixelate` operate on structure; `hue`/`colorama` then tint the folded pattern.
- **Color before geometry:** `hue` then `kaleid` — hue is applied before mirroring; the kaleidoscope copies already-shifted colors.

### Modulate placement

- **Early modulate** (on source): organic base texture before symmetry.
- **Late modulate** (after geometry): distorts an already structured field.

```js
// Distort first, then fold
osc(40, 0, 1).modulate(noise(3, 0)).kaleid(8).out()

// Fold first, then distort
osc(40, 0, 1).kaleid(8).modulate(noise(3, 0)).out()
```

### What breaks when reordered

| Swap | Typical effect |
|------|----------------|
| `luma` before vs after `rotate` | Mask shape rotates with texture vs fixed mask |
| `modulate` before vs after `pixelate` | Smooth warp vs blocky warp on already pixelated image |
| `blend`/`layer` vs transform | Blending merges **finished** chains — put transforms inside each branch |

---

## 3. Modulation Paradigm

Modulators are the **key component** in Hydra (Hydra Book). Two useful interpretations:

1. **Distortion:** modulator warps the base texture's sampling coordinates.
2. **Painting:** base texture's colors fill the modulator's spatial pattern (e.g. grayscale `noise` painted with `osc` colors).

### `modulate(texture, amount)`

Per-pixel lookup shift (conceptual):

```
newX = x + modulator.red   * amount
newY = y + modulator.green * amount
```

- **R → horizontal**, **G → vertical** displacement.
- **Blue ignored** by `modulate` (use [`modulateHue`](modulate/modulateHue.md) for G/B involvement).
- Grayscale modulators push mainly toward upper-left; center with `.add(solid(1,1), -0.5)` or `.brightness(-0.5)` for bidirectional flow.

### Modulate family

| Function | Effect |
|----------|--------|
| [`modulate`](modulate/modulate.md) | Translate UV by R/G |
| [`modulateScale`](modulate/modulateScale.md) | Scale UV by R/G |
| [`modulateRotate`](modulate/modulateRotate.md) | Rotate UV by modulator |
| [`modulateHue`](modulate/modulateHue.md) | Shift by (g−r, b−g) — bidirectional |
| [`modulatePixelate`](modulate/modulatePixelate.md) | Variable block size |

**Conditional modulation:** apply [`luma`](color/luma.md) to the modulator so only bright regions distort.

---

## 4. Fusion Patterns

| Operator | Behavior | When to use |
|----------|----------|-------------|
| [`layer`](blend/layer.md) | Alpha compositing | Overlays, text, `luma`-cut shapes |
| [`blend`](blend/blend.md) | Linear mix | **Feedback damping** (`blend(o0, 0.9)`) |
| [`add`](blend/add.md) | Sum RGB × amount | Grid offsets, normalize noise |
| [`diff`](blend/diff.md) | `abs(a − b)` | Feedback edges, continuous subtraction |
| [`mult`](blend/mult.md) | Multiply channels | Tinting; blocks background if opaque |
| [`mask`](blend/mask.md) | Luminance → alpha | See-through shapes over layers |

### Alpha vs luminance

- **`mult`:** multiplies RGB and A independently — opaque result hides layers below.
- **`mask`:** replaces alpha with mask luminance — proper see-through compositing with [`layer`](blend/layer.md).

### Source output ranges (blending pitfall)

| Source | Range |
|--------|-------|
| `osc`, `gradient`, `voronoi` | [0, 1] |
| `noise` | [-1, 1] |

Normalize `noise` before `layer`/`luma`: `.add(solid(1,1,1), 0.5)`. Values written to buffers are **clipped** to [0, 1] on `.out()`.

---

## 5. Time & Math-Driven Parameters

Hydra runs in real time. Animate by passing **functions** instead of numbers:

```js
osc(() => 30 + Math.sin(time) * 10, 0.1, 0).out()
```

| Global | Role |
|--------|------|
| `time` | Seconds since start |
| `speed` | Global rate multiplier |
| `bpm` | Tempo for rhythmic patches |
| `mouse` | Cursor position for interaction |

**Patterns:**

- `Math.sin(time)`, `Math.cos(time)` — smooth oscillation
- `() => fast([a,b,c])` — stepped sequences ([`arrays`](arrays/arrays.md) — TODO detail)
- Small per-frame increments in feedback: `.hue(0.003)` on `src(o0)`

Keep modulation `amount` and feedback `blend` factors **small** when using `time`-driven feedback — instability grows quickly.

---

## 6. Feedback Loops

Classic pattern: read buffer, transform, write back.

```js
src(o0).scroll(0.003, 0.006)
  .layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0.01)))
  .out(o0)
```

### Control runaway

| Technique | Example |
|-----------|---------|
| Blend decay | `modulate(o0).blend(o0, 0.9).out(o0)` |
| Tiny modulate | `.modulate(..., 0.003)` |
| Slight scale | `src(o0).scale(1.01)` — prevents frozen pixels in `modulateHue` |
| Diff edges | `shape(4,0.8).diff(src(o0).scale(0.9)).out(o0)` |

[`prev()`](sources/prev.md) shortcuts previous-frame read; prefer explicit [`src(o0)`](sources/src.md) in multi-buffer setups.

---

## 7. Multi-Buffer Patches

Use `o0`–`o3` as reusable textures:

```js
shape(100, 0.35, 0.25).out(o0)
osc(40, 0.1, 1).hue(-0.1).modulate(noise(1, 0), 0.5)
  .modulateRotate(osc(12, 0).kaleid(100), 4).out(o1)
src(o2).modulateHue(o1, 4).blend(o0, 0.03).out(o2)
src(o2).contrast(2).mult(src(o1)).out(o3)
render()
```

- Declare **dependencies first** (buffers referenced by `src` must be written earlier in the sketch).
- Use `render()` to preview all buffers while debugging.
- Clear a stuck buffer: `solid().out(o0)`.

---

## Future Work (traceability)

This documentation supports a future **interactive visual synthesizer** that applies each transform step-by-step. Not in scope for this pass:

- UI / layout for patch steps
- State management for patch graphs
- Live parameter sliders wired to skills index

---

## Quick Reference Links

- [Sources](index.md#sources)
- [Geometry](index.md#geometry)
- [Color](index.md#color)
- [Blend / Fusion](index.md#blend-fusion)
- [Modulate](index.md#modulate)
