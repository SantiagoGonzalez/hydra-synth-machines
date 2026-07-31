# Param panel — rediseño (plan)

> Estado: **planificación**. La UI actual funciona; este doc captura problemas UX y dirección propuesta.

**Archivos actuales:** `param-panel.tsx`, `pad-param-panel.tsx`, `param-slider.tsx`, `source-selector.tsx`, `global-faders.tsx`

**Skill de referencia:** `skills/param-panel.skill.md`

---

## Problemas reportados

| Área | Problema | Severidad |
|------|----------|-----------|
| Discoverability | Botones poco reconocibles (bypass, fn, etc.) | Media |
| Botón **fn** | Muy chico, bajo contraste (`text-[10px]`, `border-white/10`) | Alta |
| Input numérico | Muy chico, difícil de leer (`text-[10px]` en `param-slider.tsx`) | Alta |
| Sliders horizontales | Menos convencidos en columna alta y angosta | Media |
| Atajo a input | No hay shortcut directo para editar valor numérico | Media |
| Params RGB (`solid`, `color`) | Solo sliders r/g/b; sin HEX ni picker | Media |

## Lo que funciona bien (mantener)

- **Source selector** (`source-selector.tsx`): navegable, comprensible — usar como referencia de claridad.
- Flujo chips → detail pad → params.
- Navegación por teclado (`focusZone`, `focusedControlId`, ↑/↓, ←/→).

---

## Dirección propuesta: faders verticales

El panel es **más alto que ancho**. Orientación vertical (estilo fader de mesa) podría:

- Aumentar área táctil del control
- Liberar espacio horizontal para labels, valores y botones (fn, bypass)
- Unificar lenguaje visual con **GlobalFaders** y futuros controles de **proyección**

```
┌─────────────────┐
│  frequency      │
│  ┌──┐  1.234    │  ← valor grande + stepper opcional
│  │██│  [fn]     │  ← fader vertical + fn visible
│  │██│           │
│  └──┘           │
└─────────────────┘
```

### Tradeoffs faders verticales

| Pro | Contra |
|-----|--------|
| Más “VJ desk”, mejor en columna estrecha | Refactor de `SingleParamSlider` + Radix (hoy horizontal) |
| Más espacio para fn / valor | Menos params visibles sin scroll |
| Coherente con globals y proyección | Modo fn (3 sub-sliders) necesita layout propio |

**Recomendación:** spike en un solo param antes de migrar todo el panel.

---

## Number stepper (complemento al slider)

| Opción | Pro | Contra |
|--------|-----|--------|
| Solo input + slider | Menos UI | Input chico sigue siendo problema |
| Stepper ± junto al valor | Precisión fina, legible | Más clicks para rangos grandes |
| Input grande + stepper + fader | Máxima controlabilidad | Más altura por param |
| Doble click / Enter para editar | Atajo sin UI extra | Menos discoverable |

**Atajo propuesto:** con foco en un control escalar, `Enter` o `/` enfoca el input numérico (hoy solo click).

---

## Controles RGB: HEX + color picker + sliders (conviven)

Para pads con parámetros **r / g / b** (y opcionalmente **a**), las tres vías editan el **mismo estado** en el store — no son modos excluyentes.

### Funciones alcanzadas

| Función | Params | ¿HEX + picker? | Notas Hydra |
|---------|--------|----------------|-------------|
| `solid` | r, g, b, a ∈ [0, 1] | **Sí** | Color plano; caso ideal |
| `color` | r, g, b ∈ [0, 2] | **Sí** | Multiplicadores de canal; picker mapea a [0,1]; valores &gt;1 vía sliders |
| `shift` | r, g, b, a (offsets) | **No** | No es color sRGB; mantener solo sliders |

Detección vía metadata en `hydra-registry.ts` (propuesta):

```ts
colorInput?: {
  channels: ("r" | "g" | "b")[]
  alphaParam?: "a"
  mode: "unit" | "multiplier"  // unit → 0–1, multiplier → 0–2 en color()
}
```

### Layout propuesto (bloque único arriba de sliders r/g/b)

```
┌──────────────────────────────────┐
│  [■]  #44ff88    [picker]        │  ← swatch + HEX + input type=color
├──────────────────────────────────┤
│  r  ████████░░  0.27             │  ← sliders existentes (SingleParamSlider)
│  g  ██████████  1.00             │
│  b  ██████░░░░  0.53             │
│  a  ██████████  1.00   (solid)   │
└──────────────────────────────────┘
```

### Sincronización (una fuente de verdad: `pad.params`)

| Acción usuario | Efecto |
|----------------|--------|
| Mueve slider **r** | Actualiza swatch, HEX y resto de canales en UI |
| Escribe **#RRGGBB** (+ Enter/blur) | Parse → `r,g,b` (÷255); invalida draft si mal formado |
| **Color picker** nativo | Mismo que HEX; emite r,g,b en [0,1] |
| **#RRGGBBAA** (opcional fase 2) | Setea también `a` en `solid` |

### Utilidades (`lib/color-param.ts` — propuesto)

- `rgbToHex(r,g,b)` / `hexToRgb(hex)` — canales normalizados 0–1
- Validación: `#RGB`, `#RRGGBB`, opcional `#RRGGBBAA`
- `mode: multiplier`: picker solo escribe min(r,g,b, 1) o muestra swatch “clampado” con hint si algún canal &gt;1

### Teclado / foco

- HEX input cuenta como `isEditableTarget` (no robar atajos del launchpad)
- Tab: swatch → HEX → picker → sliders r → g → b
- Entrada en HEX con foco en bloque color: `Enter` commit (G-02 compatible)

### Criterios de aceptación (G-07)

1. En pad **solid**, picker/HEX/sliders siempre muestran el mismo color.
2. Cambiar HEX actualiza canvas vía `updateParam` en los tres canales.
3. Sliders siguen funcionando igual (incl. modo **fn** por canal si aplica — fn en r/g/b es fase posterior).
4. `shift` no muestra bloque HEX/picker.

### Archivos tocados (implementación futura)

- `lib/hydra-registry.ts` — `colorInput` en `solid` y `color`
- `lib/color-param.ts` — conversión HEX ↔ RGB
- `components/launchpad/rgb-color-control.tsx` — bloque compuesto
- `components/launchpad/pad-param-panel.tsx` — render condicional
- `skills/param-panel.skill.md` — contrato

---

## G-08 — Spike swatches (nota + go/no-go)

> **Fecha:** 2026-07-31 · **Estado:** spike cerrado · **Veredicto:** **GO — grid custom** (sin librería)

### Contexto

Feedback post-G-07: el picker nativo es aceptable como v1, pero conviene poder elegir color desde una **paleta de swatches** (no reemplaza picker/HEX/sliders — se suma). G-09 resolvió el lag del picker con `updateParams` atómico; los swatches deben usar el mismo commit `{ r, g, b }`.

### Candidatas evaluadas

| Criterio | **Grid custom** | **`react-colorful@5.6.1`** | **`@uiw/react-color-swatch@2.10.3`** |
|----------|-----------------|------------------------------|--------------------------------------|
| **Peso bundle (gzip)** | **0 B** | 4 655 B (entry `main`, picker completo) — [bundlephobia](https://bundlephobia.com/package/react-colorful@5.6.1) | 1 924 B (swatch) + 2 163 B (`@uiw/color-convert`, dep obligatoria) ≈ **4 087 B** — [swatch](https://bundlephobia.com/package/@uiw/react-color-swatch@2.10.3) · [convert](https://bundlephobia.com/package/@uiw/color-convert@2.10.3) |
| **API / control** | HEX en paleta → `hexToRgb` → `updateParams({r,g,b})` | **No trae swatches** — es picker HSV; para swatches puros no aporta | `colors[]` configurable; `onChange` emite `HsvaColor` → requiere `hsvaToHex` de `@uiw/color-convert` antes de `hexToRgb` |
| **a11y** | Costo nuestro: `<button>` por swatch, `aria-label`, flechas opcionales | Picker con a11y documentada, pero **irrelevante** para swatches | `div` + `onClick`; sin teclado built-in; `rectRender` permite mejorar pero sigue siendo trabajo manual |
| **Dark UI** | Control total (`border-white/10`, mono, tamaño táctil) | Estilos del picker HSV; no encaja con “solo swatch” | Theme vía `rectRender` / `rectProps`; estilos base del lib pueden pelear con el panel |
| **Integración G-07** | Directa: `clampChannel` en `mode: multiplier`; misma fuente `pad.params` | N/A para swatches | Mapeo indirecto HSVA→HEX→RGB; duplica conversión que ya tenemos en `lib/color-param.ts` |
| **Mantenimiento** | 0 deps; ~40–60 LOC en `rgb-color-control` o subcomponente | Dep estable (0 deps propias) pero **sobredimensionado** para el caso | +2 paquetes scoped, peer `@babel/runtime`; activo (250k dl/sem) pero peso ≈ picker completo de react-colorful sin ventaja clara |

### Mapeo a modelo G-07 (verificado en papel)

```
click swatch (#RRGGBB)
  → hexToRgb(hex)           // lib/color-param.ts
  → clamp por mode          // multiplier → [0,1]
  → updateParams(id, {r,g,b})  // un compile (G-09)
```

Convive con HEX, picker nativo y sliders; no introduce estado espejo.

### Recomendación

| Veredicto | Vía | Motivo |
|-----------|-----|--------|
| **GO** | **Grid custom** | Swatches puros son botones con `backgroundColor`; 0 KB; API alineada con `hexToRgb` + `updateParams`; dark UI y a11y bajo control; las libs evaluadas no aportan valor proporcional al peso (~4 KB gzip cada una) ni eliminan trabajo de integración. |
| **No-go** | `react-colorful` | Es un picker HSV, no swatches — G-07 ya cubre picker con `<input type=color>`. |
| **No-go** | `@uiw/react-color-swatch` | Peso total comparable a un picker completo; conversión HSVA redundante; a11y/teclado igualmente a implementar; peer `@babel/runtime` extra. |

### Paleta inicial propuesta (implementación posterior)

Paleta fija VJ (~16 colores), grid 4×4 debajo del bloque HEX/picker:

`#000000` `#ffffff` `#ff2056` `#e12afb` `#8e51ff` `#2b7fff` `#00b8db` `#00bc7d` `#5ea500` `#ff8904` `#fb64b6` `#00bcff` `#00d5be` `#9ae600` `#ffdf20` `#808080`

(Inspirada en el demo oficial de `@uiw/react-color-swatch`; no implica usar el lib.)

### Alcance bloque de implementación (G-10)

- Sub-fila de swatches en `rgb-color-control.tsx` (o `color-swatch-grid.tsx` si supera ~60 LOC).
- Solo `solid` y `color` (misma detección `colorInput` que G-07).
- Sin persistencia de paletas custom (fuera de scope — escalaría a favoritos/preset).
- Tests manuales: click swatch → canvas + HEX + sliders sincronizados; `color` clamp [0,1] en swatch.

---

## Botones — mejoras concretas

| Control | Hoy | Propuesta |
|---------|-----|-----------|
| **fn** | `text-[10px]`, borde tenue | Mín. 28px touch target; estado fn con fondo `yellow-400/20` más marcado |
| **bypass** | Mismo patrón que fn | Icono + label corto; tooltip con atajo `B` |
| Labels param | `text-[9px]` | Subir a 11–12px o usar tokens B-02 |

---

## Fases sugeridas

### Fase 1 — Quick wins (sin cambiar orientación)
- [ ] Tipografía fn, valor, labels (+2–4px)
- [ ] Contraste botones (fn, bypass, #)
- [ ] Atajo `Enter` / `/` → focus input del control enfocado
- [ ] A-02: copy bypass vs quitar cadena
- [x] **G-07:** HEX + color picker en `solid` / `color` (convive con sliders)

### Fase 2 — Primitiva `ParamFader`
- [ ] Componente vertical reutilizable (pad params + globals)
- [ ] Spike: un param en vertical; validar modo fn

### Fase 3 — Migración panel completo
- [ ] Reemplazar sliders horizontales en `param-slider.tsx`
- [ ] Alinear `global-faders.tsx` con misma primitiva
- [ ] Scrollbar thin (`skills/ui-scrollbar-thin.skill.md`)

### Fase 4 — Polish
- [ ] Stepper opcional (feature flag o solo en params con `step` fino)
- [ ] Collapse secciones: Chain / Detail / Global

---

## Spike G-03 (2026-07-31) — **descartado**

**Resultado:** piloto en un solo param (vertical) mezclado con el resto horizontal **no se ve bien** en uso real. Código revertido; faders verticales se implementarán con la **épica G** (G-04 primitiva + G-06 migración completa), no como spike aislado.

**Hallazgos conservados (input para G-06):**

| Pro | Contra |
|-----|--------|
| Radix `orientation="vertical"` viable sin deps nuevas | Un solo vertical entre horizontales rompe coherencia visual |
| Mayor área táctil en columna alta | Modo fn sigue necesitando layout propio (sub-sliders horizontales) |
| Encaja con mental model VJ desk | Panel completo vertical ≈ más scroll; no maximizar params visibles |

**Siguiente paso:** G-04 primitiva `ParamFader` → migrar panel entero (G-06) en una sola pasada, no piloto parcial.

---

## Spike G-03 — notas técnicas (archivado)

**Layout piloto (texto):**

```
┌─────────────────────────────┐
│ frequency          [#][val] │  ← label + fn + input (igual que horizontal)
│              pilot          │
│            ┌──┐             │
│            │██│  h-28       │  ← Radix Slider orientation=vertical
│            │██│             │
│            └──┘             │
├─────────────────────────────┤
│ sync  ────────────○         │  ← params 2+ siguen horizontales
│ offset ───────────○         │
└─────────────────────────────┘
```

**Implementación:** `param-fader.tsx` envuelve `SingleParamSlider` con `layout="vertical"` (solo afecta modo escalar; modo fn conserva sub-sliders horizontales).

### Pros observados

| Pro | Detalle |
|-----|---------|
| Radix vertical viable | Mismo primitivo `@radix-ui/react-slider`; sin dependencia nueva |
| Área táctil mayor | `h-28` (~112px) vs track horizontal `h-4` |
| Coherencia VJ desk | Encaja con columna alta del param panel |
| API compartida | `ParamFader` reutiliza header, fn toggle, input numérico y `onChange` del store |
| Teclado intacto | `data-control-id`, foco ↑↓ y ←→ nudge sin cambios en el piloto |

### Contras observados

| Contra | Detalle |
|--------|---------|
| Altura por param | Un fader vertical ≈ +80px vs slider horizontal; panel completo requeriría más scroll |
| Modo fn híbrido | Si el primer param está en fn, el piloto muestra 3 sub-sliders horizontales (no vertical) — layout inconsistente en ese edge case |
| Mezcla visual | Primer param vertical + resto horizontal se siente transitorio (esperado en spike) |
| Globals sin alinear | `global-faders.tsx` sigue horizontal nativo (`input type=range`) |

### Recomendación G-06 (migración panel completo)

**Go condicional** — proceder a G-04/G-06 si:

1. Se extrae primitiva `ParamFader` compartida (pad + globals) con altura configurable.
2. Modo fn del primer param tiene layout dedicado (p.ej. colapsar sub-sliders o drawer).
3. Se acepta ~1.5–2× scroll en panel con muchos params.

**No-go inmediato** si el objetivo es maximizar params visibles sin scroll — los faders verticales consumen altura.

**Siguiente paso sugerido:** G-04 primitiva compartida → piloto en 2–3 params + un global (speed) antes de G-06.

---

## Decisiones abiertas

1. ¿Fn en modo escalar muestra solo botón, o también preview de la curva?
2. ¿Stepper en todos los params o solo escalares con `step` ≤ 0.01?
3. ¿Globals y pad params comparten exactamente el mismo componente?
4. ¿HEX con alpha (`#RRGGBBAA`) en v1 o solo `#RRGGBB` + slider `a`?
5. ¿Picker clampa `color()` a [0,1] o permite arrastrar y seguir editando &gt;1 en sliders?

---

## Referencias backlog

- Epic **E** (UI componentes) — pads
- Epic **G** — param panel (`tasks/backlog.md`)
- Epic **B-02** — design system / tokens
