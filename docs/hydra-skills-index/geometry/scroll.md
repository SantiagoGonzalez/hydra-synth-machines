# `scroll(x, y)` / `scrollX(speed)` / `scrollY(speed)`

> Desplaza las coordenadas de textura, animando o desfasando el patrón.

## Parameters

### `scroll(x, y)`

| Param | Effect |
|-------|--------|
| `x` | Horizontal scroll offset (normalized) |
| `y` | Vertical scroll offset (normalized) |

### `scrollX(speed)` / `scrollY(speed)`

Scroll along one axis; `speed` drives continuous motion when non-zero.

## Role in the Pipeline

`scroll` is a **geometry** transform. Used for animating grids, phase-shifting tiled patterns, and feedback motion. In feedback loops, small scroll values (0.003–0.01) create slow drift without discontinuities (unlike some scale-based effects).

## Composition Examples

```js
// Rejilla desplazada (mitad de celda)
var n = 4
var a = () => shape(4, 0.4).repeat(n, n)
a().add(a().scroll(0.5 / n, 0.5 / n)).out()

// Feedback con scroll
shape(4, 0.7, 0).diff(src(o0).scrollX(0.01).mask(shape(4, 0.7, 0))).out(o0)

// RGB filter: canales desplazados
pix().mult(func().color(0, 1, 0).pixelate(n, n)).scrollX(1 / n / 3).out(o2)

// Feedback layer
src(o0).scroll(0.003, 0.006).layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0.01))).out(o0)
```

## Common Uses & Pitfalls

- [`modulateScrollX`](../modulate/modulateScroll.md) achieves similar motion but involves **texture wrapping** discontinuities; plain `scroll` in feedback is often smoother.
- Scroll offsets in `repeat` stagger recipes use fractions like `0.5/n` for half-cell shifts.

## Related Functions

- [`repeat`](repeat.md) — scroll offsets create brick/polka layouts
- [`modulateScrollX`](../modulate/modulateScroll.md) — scroll amount from modulator texture
- [`src`](../sources/src.md) — feedback + scroll is a classic combination
