# `osc(frequency, sync, offset)`

> Genera una textura de oscilador sinusoidal con bandas de color que se desplazan horizontalmente.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `frequency` | `60` | number | Number of wave cycles across the screen; higher = more bands |
| `sync` | `0.1` | number | Speed at which the pattern scrolls; `0` = static |
| `offset` | `0` | number (radians) | Phase offset applied differently per R/G/B channel, producing color |

## Role in the Pipeline

`osc` is a **source** — it starts a chain. It produces a full-screen sinusoidal texture with horizontal bands. No upstream input is needed.

Output range: **[0, 1]** per channel — safe to blend without normalization.

Chain downstream into geometry transforms (`.rotate()`, `.kaleid()`), color ops (`.hue()`, `.colorama()`), and modulations (`.modulate()`, `.modulateRotate()`).

## Composition Examples

```js
// Estatico: bandas blancas y negras
osc(30, 0, 0).out()

// Animado: las bandas se desplazan
osc(30, 0.1, 0).out()

// Con color: offset crea arcoíris
osc(30, 0, Math.PI / 2).out()

// Doble oscilador: uno modula al otro
osc(60, 0).modulateScale(osc(8, 0)).out()
```

## Common Uses & Pitfalls

- **Color from `offset`**: the `offset` parameter shifts the phase of R, G, B channels independently. `Math.PI/2` ≈ rainbow; `Math.PI` makes red and blue in-phase (magenta/cyan tones).
- **Animated sync**: `sync` is roughly "speed in cycles/second". Setting `sync` via `() => time * k` makes speed proportional to global time.
- **High frequency + low sync** creates fine static interference; **low frequency + high sync** produces thick scrolling bands.
- `osc` output is always **opaque** (alpha = 1), so `layer` will fully cover whatever is beneath unless you cut alpha with `luma` or `mask` first.

## Related Functions

- [`noise`](noise.md) — organic alternative source; outputs [-1, 1] unlike `osc`
- [`gradient`](gradient.md) — smooth gradient source; useful as a modulator palette
- [`modulateScale`](../modulate/modulateScale.md) — classic pairing with two `osc` calls
- [`kaleid`](../geometry/kaleid.md) — creates radial symmetry from oscillator bands
- [`hue`](../color/hue.md) — rotate colors without changing luminance
