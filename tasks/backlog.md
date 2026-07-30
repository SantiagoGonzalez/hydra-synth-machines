# Backlog launchpad — v0

> Última actualización: 2026-07-29 (sesión 2). Borrador vivo; agregar ideas con ID nuevo y fase sugerida.

## Leyenda

| Campo | Valores |
|-------|---------|
| **Esfuerzo** | S (&lt;1 día), M (1–3 días), L (&gt;3 días) |
| **Prioridad** | Alta / Media / Baja |
| **Estado** | `idea` · `ready` · `in-progress` · `done` · `cancelled` |

---

## Epic A — Atajos y UX inmediata

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| A-01 | `Z` → `F` para modo función | **cancelled** | — | — | Descartado: clash con pad posicional `KeyF` (#12). **Mantener `Z`.** |
| A-02 | Desactivar pad en cadena (panel params) | idea | S–M | Alta | Bypass (`B`) y quitar (`Backspace`) existen. Falta copy/descubribilidad. |

---

## Epic B — Documentación y design system

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| B-01 | Glosario Hydra | ready | S | Alta | `docs/glosario-hydra.md`. Tooltips en UI pendientes. |
| B-02 | Design system formal | idea | M | Media | Tokens en `app/globals.css`. Doc `docs/design-system.md` por crear. |
| B-03 | Selector de temas | idea | M | Media | `data-theme` + swap CSS vars. |
| B-04 | Tema doom64 (tweakcn) | idea | S (spike) | Baja | Evaluar contraste en pads/canvas. |

---

## Epic C — Cadena: escribir, codear, live coding

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| C-01 | Editar cadena como código | idea | L | Media | Editor; sync con pads. |
| C-02 | Live coding estilo Hydra | idea | L | Media-baja | REPL vía `chain-evaluator.ts`. |
| C-03 | Overlay código sobre canvas | idea | S–M | Media | Toggle CSS; reutilizar `chain-preview`. |
| C-04 | Undo cadena (Ctrl+Z, 5 niveles) | idea | M | Alta | Snapshot en `chain-store`. |

---

## Epic D — Composición, escena y proyección

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| D-01 | Multi-output + cross-buffer | done | — | — | `o0`–`o3`, `src(oN)`. |
| D-02 | Editar oN mientras se proyecta oM | idea | M | Alta | `editingOutput` vs `projectedOutput`. |
| D-03 | Ventana de proyección | ready | M | Alta | `skills/projection.skill.md`. |
| D-04 | Escena &gt; canvas Hydra | idea | L | Baja | Capa DOM alrededor del canvas. |
| D-05 | Optimización para proyector | idea | M | Media | `setResolution`, pixel ratio. |
| D-06 | Dimmer / blackout proyección | idea | S–M | Alta | Fader sobre capa DOM del canvas. Ver `docs/planning/projection-controls.md`. |

---

## Epic E — UI componentes (pads)

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| E-01 | Rediseño botones pad | idea | S–M | Media | Label centrado; función más grande; fn en esquina. |
| E-02 | Consistencia design system | idea | M | Media | Depende de B-02. |

---

## Epic G — Param panel (rediseño)

> Spec: `docs/planning/param-panel-redesign.md`

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| G-01 | Tipografía y contraste (fn, valor, botones) | idea | S | Alta | Quick win sin cambiar layout. |
| G-02 | Atajo focus → input numérico | idea | S | Media | `Enter` o `/` con control enfocado. |
| G-03 | Spike faders verticales | idea | M | Alta | Un param piloto; panel alto &gt; ancho. |
| G-04 | Primitiva `ParamFader` compartida | idea | M | Media | Pad params + globals + proyección. |
| G-05 | Number stepper (evaluar) | idea | S–M | Baja | Tradeoffs en planning doc. |
| G-06 | Migrar panel completo a vertical | idea | M–L | Media | Tras validar G-03. |

**Mantener sin cambiar:** `source-selector.tsx` (referencia de claridad).

---

## Epic H — Globales Hydra y synth settings

> Spec: `docs/planning/hydra-globals.md`

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| H-01 | Cablear `speed` al evaluador | idea | S | **Alta** | Bug percibido: faders no hacen nada. |
| H-02 | Auditar BRIGHT / DECAY / AMOUNT | idea | S | Alta | Renombrar o mapear a Hydra/CSS. |
| H-03 | Exponer `bpm` en UI | idea | S | Media | Global Hydra; no está en launchpad. |
| H-04 | `setResolution` modo proyector | idea | M | Media | Con D-05. |

---

## Epic F — Onboarding

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| F-01 | Modal bienvenida / tutorial | idea | M–L | Media | Estilo manual retro. |
| F-02 | Contenido del tutorial | idea | S | Media | Glosario + ejemplo + shortcuts. |

---

## Roadmap sugerido

### Fase 0 — Quick wins
- [ ] A-02
- [ ] G-01, G-02
- [ ] H-01 (speed)
- [ ] C-04
- [ ] B-01 tooltips (opcional)

### Fase 1 — Core VJ
- [ ] D-02, D-03, D-06
- [ ] C-03
- [ ] D-05, H-04
- [ ] G-03 spike faders verticales

### Fase 2 — Polish
- [ ] G-04, G-06
- [ ] H-02, H-03
- [ ] B-02, B-03
- [ ] E-01, E-02
- [ ] F-01, F-02

### Fase 3 — Live coding
- [ ] C-01, C-02
- [ ] D-04

---

## Decisiones cerradas

| Fecha | Decisión |
|-------|----------|
| 2026-07-29 | **A-01 cancelado** — mantener `Z` para modo función (clash con pad `F`). |

## Decisiones abiertas

| # | Pregunta | Opciones / default |
|---|----------|-------------------|
| 1 | A-02: bypass vs quitar cadena | — |
| 2 | D-02: output proyectado fijo o elegible | — |
| 3 | D-06: dimmer solo en proyección o también stage | Ver `projection-controls.md` |
| 4 | G-03: faders verticales en todo el panel | Spike primero |
| 5 | H-02: brightness = CSS vs `.brightness()` | — |
| 6 | C-01: editor por output o multi-buffer | — |
| 7 | F-01: tutorial obligatorio o opt-in | — |

---

## Ya implementado (no rehacer)

- Multi-output `o0`–`o3` + grid 2×2 (`Shift+5`)
- Cross-buffer vía `src(oN)`
- Bypass + atajos (`skills/launchpad-keyboard.skill.md`)
- `Z` fn + hold `Z`+←→ shapes
- Fix `modulateScroll` (`docs/planning/hydra-registry-gaps.md`)
- Glosario (`docs/glosario-hydra.md`)

## Deuda conocida (documentada, no bug de UI)

- **Global faders** en store sin efecto en Hydra — ver Epic H
