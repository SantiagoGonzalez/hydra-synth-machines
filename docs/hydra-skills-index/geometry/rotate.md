# `rotate(angle, speed)`

> Rota las coordenadas de textura alrededor del centro de la pantalla.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `angle` | `0` | number (radians) | Static rotation offset |
| `speed` | `0` | number | Continuous rotation speed over time |

## Role in the Pipeline

`rotate` is a **geometry** transform. Apply after a source, before or after other geometry ops depending on desired symmetry. Rotating before `kaleid` changes which wedge of the image is mirrored; rotating after `kaleid` spins the whole kaleidoscopic pattern.

## Composition Examples

```js
// Rotación continua
osc(30, 0, 1).rotate(1).out()

// Rotación estática (π/4)
shape(999, 0.4).repeat(8, 8).rotate(Math.PI / 4).out()

// Capas con rotación distinta
osc(200, 0, 1).rotate(1).layer(osc(30, 0, 1).luma(0.5, 0.01)).out()
```

## Common Uses & Pitfalls

- Angles are in **radians** (`Math.PI`, `Math.PI/2`, etc.), not degrees.
- Small `speed` values (0.01–0.1) produce slow drift; large values spin rapidly.
- Combining `rotate` with feedback (`src(o0).rotate(0.1)`) accumulates rotation each frame.

## Related Functions

- [`kaleid`](kaleid.md) — radial symmetry; order relative to `rotate` matters
- [`scale`](scale.md) — often chained before rotation for aspect control
- [`modulateRotate`](../modulate/modulateRotate.md) — rotation driven by a modulator texture
