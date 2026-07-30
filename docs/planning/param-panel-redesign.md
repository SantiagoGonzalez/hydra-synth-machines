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

---

## Referencias backlog

- Epic **E** (UI componentes) — pads
- Epic **G** — param panel (`tasks/backlog.md`)
- Epic **B-02** — design system / tokens
