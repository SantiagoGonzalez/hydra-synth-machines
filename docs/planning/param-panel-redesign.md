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
- [ ] **G-07:** HEX + color picker en `solid` / `color` (convive con sliders)

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
