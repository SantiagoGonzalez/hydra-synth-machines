# Channel accessors: `r()`, `g()`, `b()`, `a()`, `sum()`

> Extraen o operan sobre canales individuales de la textura.

## Functions

| Function | Role |
|----------|------|
| `r(amount)` | Red channel operation |
| `g(amount)` | Green channel operation |
| `b(amount)` | Blue channel operation |
| `a(amount)` | Alpha channel operation |
| `sum(amount)` | Sum/combine channels |

## Role in the Pipeline

These are **color** transforms/accessors listed in the [official function reference](https://hydra.ojack.xyz/functions/).

> **TODO:** Per-function signatures, defaults, and examples not found in primary sources. Use the interactive reference at https://hydra.ojack.xyz/functions/ for authoritative usage.

## Composition Examples

```js
// TODO: add verified examples from interactive reference
```

## Common Uses & Pitfalls

- [`modulate`](../modulate/modulate.md) displacement reads **R → X** and **G → Y** from modulator textures; channel ops may be used to isolate those channels before modulating.
- Prefer [`color`](color.md) when documentation examples explicitly set RGB weights.

## Related Functions

- [`color`](color.md) — explicit RGBA remapping
- [`shift`](shift.md) — per-channel shift (TODO detail)
- [`modulate`](../modulate/modulate.md) — consumes R/G from modulator
