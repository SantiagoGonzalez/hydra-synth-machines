# Registry / compilador / runtime — gaps Hydra

Auditoría de desajustes entre lo que expone el **launchpad** (`lib/hydra-registry.ts`), lo que emite el **compilador** (`lib/chain-compiler.ts`) y lo que existe en **hydra-synth**.

---

## Regla general

1. El `id` del registro se usa tal cual en el código compilado (`.${id}(...)`).
2. El evaluador (`lib/chain-evaluator.ts`) debe exponer cada símbolo usado en el código (whitelist en `buildBoundFunctions`).
3. Si Hydra solo tiene variantes por eje (`X` / `Y`) o nombres distintos, el **compilador** debe expandir o el **registro** debe alinearse.

Antes de agregar un pad nuevo: buscar el nombre en `node_modules/hydra-synth/src/glsl/glsl-functions.js`.

---

## `modulateScroll` — resuelto (2026-07-29)

### Síntoma

```
noise(...).modulateScroll is not a function
```

Código emitido (incorrecto):

```js
voronoi(5, 0.3, 0.3).hue(0.4).pixelate(20, 20)
  .modulateScroll(osc(60, 0.1, 0), 0.5, 0.5, 0, 0).out()
```

### Causa

- El pad en registry usa `id: "modulateScroll"` con 4 params (como `scroll`).
- **hydra-synth no define `modulateScroll`.** Solo existen:
  - `modulateScrollX(texture, scrollX, speed)`
  - `modulateScrollY(texture, scrollY, speed)`

### Fix

`buildModulateScrollFragment` en `lib/chain-compiler.ts` expande un pad a:

```js
.modulateScrollX(tex, scrollX, speedX).modulateScrollY(tex, scrollY, speedY)
```

Mapeo de parámetros del pad:

| Param pad | Destino |
|-----------|---------|
| `scrollX` | `modulateScrollX` arg 2 |
| `speedX` | `modulateScrollX` arg 3 |
| `scrollY` | `modulateScrollY` arg 2 |
| `speedY` | `modulateScrollY` arg 3 |

El modulador `tex` es el mismo en ambas llamadas (secundaria del pad, p. ej. `noise` u `osc`).

### Doc

- `docs/hydra-skills-index/modulate/modulateScroll.md` — nota launchpad + firmas reales.

---

## Funciones modulate en hydra-synth (referencia)

Nombres presentes en `glsl-functions.js` (verificar al actualizar dependencia):

| En runtime | En registry launchpad | Notas |
|------------|----------------------|-------|
| `modulate` | `modulate` | OK |
| `modulateScale` | `modulateScale` | OK |
| `modulateRotate` | `modulateRotate` | OK |
| `modulateHue` | `modulateHue` | OK |
| `modulatePixelate` | `modulatePixelate` | OK |
| `modulateRepeat` | `modulateRepeat` | OK en runtime |
| `modulateRepeatX` / `Y` | — | No expuestos como pads separados |
| `modulateKaleid` | `modulateKaleid` | OK en runtime |
| `modulateScrollX` / `Y` | `modulateScroll` (pad UI) | Compilador expande |
| — | — | No existe `modulateScroll` combinado |

---

## Checklist al agregar o renombrar pads

- [ ] `id` existe en hydra-synth o hay regla de expansión en `chain-compiler.ts`
- [ ] Firmas de params coinciden con inputs del GLSL (nombres y cantidad)
- [ ] Símbolo en `buildBoundFunctions` (`chain-evaluator.ts`) y en `hydra-playground.tsx` si aplica
- [ ] Entrada en `docs/hydra-skills-index/` actualizada
- [ ] Probar compile + run en launchpad (no solo `tsc`)

---

## Patrón para futuras expansiones compiler-side

Cuando el pad UI agrupa dos funciones Hydra (como `scroll` vs `scrollX`/`scrollY`):

```ts
// chain-compiler.ts
if (def.id === "modulateScroll") {
  return buildModulateScrollFragment(pad, def) ?? `${def.id}()`
}
```

Alternativa: dos pads en registry (`modulateScrollX`, `modulateScrollY`) — más fiel a Hydra, peor UX en grilla.
