# Subchains — fuentes anidadas como parámetro

> Estado: **planificación**. Extender el modelo actual de **una sola fuente secundaria** a **mini-cadenas** compilables dentro del argumento de modulate/blend.

Referencias: `lib/chain-compiler.ts`, `components/launchpad/source-selector.tsx`, `docs/hydra-skills-index/composition-guide.md`

---

## Problema

Hoy, funciones con fuente secundaria (`modulate`, `add`, `blend`, …) solo permiten **un generador atómico**:

```js
// Compilado actual
modulate(osc(60, 0.1, 0), 0.1)

// Lo que Hydra permite (y el usuario quiere armar con pads)
modulate(noise(10).scale(2).hue(0.3), 0.1)
add(gradient(1).rotate(0.1), 0.5)
```

**Estado en código:**

| Capa | Hoy |
|------|-----|
| `ActivePad` | `secondarySourceId` + `secondaryParams` (un solo `functionId`) |
| `SourceSelector` | Chip único: `osc`, `noise`, `src:o1`, … |
| `buildSecondarySourceFragment` | Emite **una** llamada `fn(params)` |

---

## Concepto: subchain

Una **subchain** es una cadena Hydra **sin `.out()`** — fragmento de expresión que se inserta como primer argumento (o argumento textura) del pad padre.

```
Pad principal:  modulate( ?, amount )
                      ↑
Subchain:         noise(10) → scale(2) → hue(0.3)
                  (compila a: noise(10).scale(2).hue(0.3))
```

### Vocabulario (`docs/glosario-hydra.md`)

| Término | Significado |
|---------|-------------|
| **Chain principal** | `activePads[]` del output actual |
| **Subchain** | Mini-cadena embebida en un pad con `secondarySourceId` |
| **Pad padre** | Pad que consume la subchain (ej. `modulate`) |
| **Pad hijo** | Paso dentro de la subchain |

---

## Modelo de datos (propuesta)

```ts
interface ActivePad {
  instanceId: string
  functionId: string
  params: Record<string, ParamValue>
  /** @deprecated migrar a secondaryChain */
  secondarySourceId?: string
  secondaryParams?: Record<string, ParamValue>
  /** Nueva: pasos ordenados de la fuente compuesta */
  secondaryChain?: SubChainPad[]
  activatedAt: number
  isBypassed?: boolean
}

/** Mismo shape que ActivePad pero scoped a la subchain (sin anidar infinito en v1) */
type SubChainPad = Omit<ActivePad, "secondaryChain">
```

**Migración v1 → subchain:**

```ts
// Si secondaryChain vacío pero hay secondarySourceId:
secondaryChain = [{
  instanceId: `${parentId}-sub-0`,
  functionId: secondarySourceId,
  params: secondaryParams ?? defaults,
  category: ...,
  activatedAt: 0,
}]
```

**Reglas de compilación:**

1. Subchain debe empezar con categoría `source` (o `src(oN)`).
2. Pasos siguientes: geometry, color — **no** blend/modulate anidados en v1 (evitar recursión).
3. Sin `.out()` — solo fragmento encadenado con `.`.
4. Si `secondaryChain` vacío → fallback `secondarySourceId` del registry (comportamiento actual).

```ts
function compileSubChain(pads: SubChainPad[]): string | null {
  // Misma lógica que compileChainToBuffer pero sin outCall
  // Reutilizar buildCallFragment por paso
}
```

**Emisión:**

```js
modulate(compileSubChain(pad.secondaryChain), amount)
```

---

## UI (propuestas)

### A — Modo “Edit subchain” (recomendado v1)

En `pad-param-panel`, debajo del `SourceSelector`:

```
┌─ Source (subchain) ─────────────┐
│ [noise] → [scale] → [hue]  [+]  │  ← chips ordenados
│ [ Edit subchain ]               │  ← abre panel / drawer
└─────────────────────────────────┘
```

- **Edit subchain** → `focusZone: "subchain"` + mini grilla filtrada (sources, geometry, color) o lista de pasos
- Mismos controles que pad principal: params, bypass por paso, reorder
- **Apply** vuelve al pad padre (patrón igual que source draft)

### B — Reutilizar pad band completo (más potente, más pesado)

Segunda fila de pads dedicada a la subchain del pad seleccionado — “segundo launchpad” local al pad.

### C — Solo lista + Add step (MVP mínimo)

Dropdown “Add step” (rotate, scale, …) sin grilla; suficiente para 2–3 pasos.

**Recomendación:** **C** para spike → **A** para producto.

---

## Funciones afectadas (registry)

Todas con `secondarySourceId` en `lib/hydra-registry.ts`:

- **Modulate:** `modulate`, `modulateScale`, `modulateRotate`, `modulateHue`, `modulatePixelate`, `modulateRepeat`, `modulateKaleid`, `modulateScroll`
- **Blend:** `blend`, `add`, `layer`, `mult`, `diff`, `sub`, `mask`

`src(oN)` sigue siendo un “paso fuente” de un solo nodo en la subchain.

---

## Impacto en otros sistemas

| Sistema | Cambio |
|---------|--------|
| `chain-compiler.ts` | `compileSubChain`, refactor `buildSecondarySourceFragment` |
| `chain-store` | `updateSubChain`, add/remove/reorder sub-pads |
| `launchpad-controls` | Controles para params de subchain (`scope: "subchain"`) |
| `favorites-store` | Serializar `secondaryChain` en snapshot |
| `chain-preview` | Syntax highlight anidado o tooltip |
| `use-launchpad-keys` | `focusZone === "subchain"` |
| Proyección | Sin cambio si `compiledCode` sigue siendo string puro |

---

## Límites v1 (recomendados)

| Límite | Razón |
|--------|-------|
| Profundidad **1** | Sin subchain dentro de subchain |
| Sin blend/modulate **dentro** de subchain | Evita árbol recursivo y UI explosiva |
| Máx. **8 pasos** por subchain | Performance + UX |
| Misma categoría de tabs que compose | source → geometry → color |

v2: subchain con modulate anidado (árbol), editor de código del fragmento.

---

## Backlog (Epic L)

| ID | Ítem | Esfuerzo |
|----|------|----------|
| L-01 | Tipo `secondaryChain` + migración desde `secondarySourceId` | M |
| L-02 | `compileSubChain` en chain-compiler | M |
| L-03 | UI MVP: lista de pasos + add/remove/reorder | M |
| L-04 | Params por paso hijo (reusar `SingleParamSlider`) | M |
| L-05 | `focusZone: subchain` + atajos | S–M |
| L-06 | Favoritos / persistencia subchain | S |
| L-07 | Vista en `chain-preview` (fragmento anidado) | S |

**Esfuerzo épica total:** L (M–L) · **Prioridad:** media-alta (potencia composición sin live coding completo)

---

## Relación con otras épicas

| Epic | Relación |
|------|----------|
| **C-01** (editor código) | Subchain = fragmento editable en código; round-trip más difícil |
| **K** (scene bank) | Independiente |
| **G** (param panel) | Subchain vive en param panel / drawer |
| **J** (audio) | Modo ♪ en params de pasos hijos |

**Orden sugerido:** después de **G-01** (legibilidad panel) y antes o en paralelo con **C-01**. No requiere proyección.

---

## Ejemplos compilados objetivo

```js
// modulate con subchain
osc(40, 0.1, 0)
  .modulate(noise(10).scale(1.2).rotate(0.05), 0.08)
  .out()

// add con buffer + procesado
voronoi(5, 0.3)
  .add(src(o1).pixelate(20, 20), 0.4)
  .out(o0)
```

---

## Decisiones abiertas

1. ¿Subchain se edita inline en param panel o en drawer/modal full-height?
2. ¿Reorder por drag o solo Alt+←/→ en chips de subchain?
3. ¿Permitir `src(oN)` + pasos geometry encadenados en la misma subchain? (**sí**, recomendado)
4. ¿Bypass por paso dentro de subchain? (**sí**, misma semántica que chain principal)

---

## Criterios de aceptación (MVP)

1. Pad `modulate` con subchain `noise → scale` compila y se ve en canvas.
2. Cambiar params del paso hijo recompila sin tocar chain principal.
3. Favorito guardado restaura subchain.
4. Sin subchain definida, comportamiento idéntico al actual (una fuente).
