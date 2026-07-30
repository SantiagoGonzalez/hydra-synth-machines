# Backlog launchpad — v0

> Última actualización: 2026-07-29. Borrador vivo; agregar ideas con ID nuevo y fase sugerida.

## Leyenda

| Campo | Valores |
|-------|---------|
| **Esfuerzo** | S (&lt;1 día), M (1–3 días), L (&gt;3 días) |
| **Prioridad** | Alta / Media / Baja |
| **Estado** | `idea` · `ready` · `in-progress` · `done` |

---

## Epic A — Atajos y UX inmediata

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| A-01 | `Z` → `F` para modo función | idea | S | Alta | Solo con `focusZone === params`. **Conflicto:** `KeyF` es pad posicional #12. Ver `skills/launchpad-keyboard.skill.md`. |
| A-02 | Desactivar pad en cadena (panel params) | idea | S–M | Alta | **Bypass** (`B`, botón) y **quitar** (`Backspace` → `removeSlot`) ya existen. Falta copy/descubribilidad: “Bypass” vs “Quitar de cadena”. |

---

## Epic B — Documentación y design system

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| B-01 | Glosario Hydra | ready | S | Alta | Ver `docs/glosario-hydra.md`. Tooltips en UI pendientes. |
| B-02 | Design system formal | idea | M | Media | Tokens en `app/globals.css` (oklch + shadcn). Doc `docs/design-system.md` por crear. |
| B-03 | Selector de temas | idea | M | Media | `data-theme` + swap CSS vars; migrar hardcodes (`neon-green`, etc.). |
| B-04 | Tema doom64 (tweakcn) | idea | S (spike) | Baja | Evaluar contraste en pads/canvas; no bloqueante. |

---

## Epic C — Cadena: escribir, codear, live coding

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| C-01 | Editar cadena como código | idea | L | Media | Editor (Monaco/CodeMirror); sync con pads. |
| C-02 | Live coding estilo Hydra | idea | L | Media-baja | REPL vía `chain-evaluator.ts`; riesgo de romper modelo pad↔código. |
| C-03 | Overlay código sobre canvas | idea | S–M | Media | Toggle CSS estilo hydra.ojack.xyz; reutilizar tokenize de `chain-preview.tsx`. |
| C-04 | Undo cadena (Ctrl+Z, 5 niveles) | idea | M | Alta | Snapshot `chains` + `editingOutput` en `chain-store`; no mezclar con undo del browser. |

### Decisión pendiente C-01 / C-02

| Enfoque | Descripción |
|---------|-------------|
| **Pads-first** (actual) | Código = vista compilada; editor = override temporal |
| **Code-first** | Pads = generador; edición manual hasta “re-sync” |
| **Dual** | AST/diff — costoso |

**Recomendación fase 1:** editor read-write con compile-on-blur + aviso si no round-trip a pads.

---

## Epic D — Composición, escena y proyección

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| D-01 | Multi-output + cross-buffer | done | — | — | `o0`–`o3`, `src(oN)` en blends. |
| D-02 | Editar oN mientras se proyecta oM | idea | M | Alta | Separar `editingOutput` vs `projectedOutput`. |
| D-03 | Ventana de proyección | ready | M | Alta | Spec en `skills/projection.skill.md` — **no implementado**. |
| D-04 | Escena &gt; canvas Hydra | idea | L | Baja | Capa DOM alrededor del canvas; motor sigue siendo WebGL. |
| D-05 | Optimización para proyector | idea | M | Media | `setResolution`, pixel ratio, modo performance. |

### Limitaciones Hydra (proyección)

| Tema | Limitación | Implicancia |
|------|------------|-------------|
| Buffers | Máx. 4 (`o0`–`o3`) | Planificar composición |
| WebGL | 1 contexto por ventana | Proyección = segunda instancia; feedback puede divergir al inicio |
| Resolución | Por defecto = tamaño canvas | Proyector → `setResolution` o fullscreen |
| Performance | GPU + complejidad shader | Muchos pads + feedback = drops |
| Clip buffers | RGB [0, 1] | Afecta `src(oN)` y mezclas |

**Conclusión:** no rediseñar el motor; dos modos de vista (launchpad con UI vs proyección limpia) y dos outputs conceptuales (editando vs proyectando).

---

## Epic E — UI componentes

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| E-01 | Rediseño botones pad | idea | S–M | Media | Label centrado; nombre función más grande; badge `fn` esquina inferior. `components/launchpad/pad.tsx`. |
| E-02 | Consistencia design system | idea | M | Media | Depende de B-02. |

---

## Epic F — Onboarding

| ID | Ítem | Estado | Esfuerzo | Prioridad | Notas |
|----|------|--------|----------|-----------|-------|
| F-01 | Modal bienvenida / tutorial | idea | M–L | Media | Estilo manual retro (diseño primero); shortcuts + ejemplo; `localStorage` “no mostrar”. |
| F-02 | Contenido del tutorial | idea | S | Media | Glosario B-01 + patch ejemplo + flujo pad→chain→apply. |

---

## Roadmap sugerido

### Fase 0 — Quick wins
- [ ] A-01, A-02
- [ ] C-04
- [ ] B-01 (tooltips opcionales)

### Fase 1 — Core VJ
- [ ] D-02, D-03
- [ ] C-03
- [ ] D-05

### Fase 2 — Polish
- [ ] B-02, B-03
- [ ] E-01, E-02
- [ ] F-01, F-02
- [ ] B-04 (spike)

### Fase 3 — Live coding
- [ ] C-01, C-02
- [ ] D-04

---

## Decisiones abiertas

| # | Pregunta | Opciones / default |
|---|----------|-------------------|
| 1 | A-02: “desactivar” = bypass, quitar, o ambos con nombres distintos | — |
| 2 | D-02: ¿público ve output fijo o el performer elige? | — |
| 3 | C-01: ¿editor solo del output actual o `compiledCode` multi-buffer? | — |
| 4 | F-01: ¿tutorial obligatorio primera vez o siempre desde `?`? | — |
| 5 | A-01: ¿`F` solo con foco params? | **Default recomendado: sí** |

---

## Ya implementado (no rehacer)

- Multi-output `o0`–`o3` + grid 2×2 (`Shift+5`)
- Cross-buffer vía `src(oN)` en fuentes secundarias
- Bypass en compilador + UI parcial (`B`, botón en param panel)
- `chain-preview` con syntax highlight
- Atajos documentados en `skills/launchpad-keyboard.skill.md`
- Fix `modulateScroll` → ver `docs/planning/hydra-registry-gaps.md`
