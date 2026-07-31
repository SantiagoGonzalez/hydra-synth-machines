# Tasks — planificación e implementación

Índice de documentos de trabajo del launchpad. Sirven para retomar contexto sin depender del chat.

| Documento | Contenido |
|-----------|-----------|
| [backlog.md](./backlog.md) | Backlog v0: épicas, fases, decisiones abiertas |
| [lessons.md](./lessons.md) | Patrones y errores a no repetir |
| [../docs/glosario-hydra.md](../docs/glosario-hydra.md) | Vocabulario Hydra ↔ launchpad |
| [../docs/planning/hydra-registry-gaps.md](../docs/planning/hydra-registry-gaps.md) | Desajustes registry / compilador / runtime (ej. `modulateScroll`) |
| [../docs/planning/param-panel-redesign.md](../docs/planning/param-panel-redesign.md) | Rediseño param panel (faders verticales, fn, stepper) |
| [../docs/planning/projection-controls.md](../docs/planning/projection-controls.md) | Dimmer y controles de proyección |
| [../docs/planning/hydra-globals.md](../docs/planning/hydra-globals.md) | Faders globales sin efecto + gaps `bpm`, `setResolution` |
| [../docs/planning/audio-reactivity.md](../docs/planning/audio-reactivity.md) | Audio reactivo Hydra (`a.fft`), integración launchpad |
| [../docs/planning/scene-composition.md](../docs/planning/scene-composition.md) | Scene bank + PNG/assets en composición |
| [../docs/planning/subchains.md](../docs/planning/subchains.md) | Subchains como fuente de modulate/blend |

## Skills relacionados (specs de implementación)

| Tema | Skill |
|------|-------|
| Atajos de teclado | `skills/launchpad-keyboard.skill.md` |
| Ventana de proyección | `skills/projection.skill.md` |
| Panel de params | `skills/param-panel.skill.md` |
| Arquitectura UI | `skills/launchpad-components.skill.md` |
| Visión VJ / usuario | `docs/vj-synth-conceptual.md` |
| API Hydra por función | `docs/hydra-skills-index/index.md` |

## Convención al agregar ítems

1. Nuevo requerimiento → entrada en `backlog.md` con ID (`A-01`, `D-03`, etc.).
2. Decisión tomada → mover de “abiertas” a sección **Decisiones** en `backlog.md` con fecha.
3. Corrección recurrente → una línea en `lessons.md`.
4. Desajuste registry/runtime → `docs/planning/hydra-registry-gaps.md`.
5. UX param panel / proyección / globals → docs en `docs/planning/`.
