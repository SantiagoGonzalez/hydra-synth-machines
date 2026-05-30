# `modulateKaleid(texture, amount)`

> Aplica simetría kaleidoscópica con parámetros derivados del modulador.

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Modulator driving segment count or mirror strength |
| `amount` | Effect strength |

## Role in the Pipeline

**Modulate** variant of [`kaleid`](../geometry/kaleid.md). Listed in the [official function reference](https://hydra.ojack.xyz/functions/).

> **TODO:** Detailed parameters and examples not found in primary sources. Compare behavior with fixed `kaleid(n)` in editor.

## Composition Examples

```js
// TODO: add verified examples from https://hydra.ojack.xyz/functions/
```

## Common Uses & Pitfalls

- Static [`kaleid`](../geometry/kaleid.md) is well-documented; use it when learning radial symmetry before modulated variants.

## Related Functions

- [`kaleid`](../geometry/kaleid.md) — fixed segment count
- [`modulateRotate`](modulateRotate.md) — rotational modulate
- [`modulateScale`](modulateScale.md) — often chained before kaleid in Hydra Book
