# Array Utilities: `fast`, `smooth`, `ease`, `offset`, `fit`

> Funciones para secuenciar y suavizar parámetros numéricos a lo largo del tiempo.

## Functions

| Function | Purpose (from reference taxonomy) |
|----------|-----------------------------------|
| `fast(arr)` | Rapid stepping through array values |
| `smooth(arr)` | Smooth interpolation between values |
| `ease(arr)` | Eased transitions |
| `offset(arr)` | Phase-offset sequencing |
| `fit(val, min, max, newMin, newMax)` | Remap numeric range |

## Role in the Pipeline

**Array** utilities are used as **arguments** to source/transform functions, often with arrow functions:

```js
osc(() => fast([10, 20, 30]), 0.1, 0).out()
```

Listed in the [official function reference](https://hydra.ojack.xyz/functions/) under Array.

> **TODO:** Exact calling conventions and array syntax not found in Hydra Book chapters fetched for this index. See [official learning: sequencing](https://hydra.ojack.xyz/docs/docs/learning/sequencing/).

## Composition Examples

```js
// TODO: verify array patterns from https://hydra.ojack.xyz/docs/docs/learning/sequencing/arrays
```

## Common Uses & Pitfalls

- Alternative to `() => Math.sin(time)` for non-sinusoidal parameter animation.
- [`time`](synth-settings.md) and [`speed`](synth-settings.md) globals affect timing of sequences.

## Related Functions

- [`osc`](../sources/osc.md) — common target for sequenced frequency
- [`bpm`](../synth-settings/synth-settings.md) — tempo sync
- [`modulate`](../modulate/modulate.md) — modulate amount can be sequenced
