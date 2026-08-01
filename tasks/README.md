# Tasks — planificación e implementación

Índice de documentos de trabajo del launchpad. Sirven para retomar contexto sin depender del chat.

| Documento | Contenido |
|-----------|-----------|
| [**guia-flujo-agentes.md**](./guia-flujo-agentes.md) | **Guía día a día** — orchestrator o pipeline por pasos |
| [backlog.md](./backlog.md) | Backlog v0: épicas, fases, decisiones abiertas |
| [priorizacion.md](./priorizacion.md) | Oleada activa — qué hacer ahora (escribe `hydra-prioritizer`) |
| [todo.md](./todo.md) | Checklist de la sesión activa |
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

## Agentes plan → execute

Subagents en `.cursor/agents/` (ver `.cursor/rules/tasks-workflow.mdc`).

### Pipeline

```
feedback → backloger → backlog.md → prioritizer → … → reviewer
                              ↑
                    /hydra-orchestrator (oleada; sin backloger obligatorio)
```

| Paso | Subagent | Modelo | Cuándo |
|------|----------|--------|--------|
| Intake | `/hydra-backloger` | **Composer** | Ad-hoc: feedback de uso / ideas |
| ★ Orquestar | `/hydra-orchestrator` | Composer | 1 chat pinneado / oleada |
| 0. Priorizar | `/hydra-prioritizer` | **Sonnet** | Oleada + branch `oleada/…` |
| 1. Planificar | `/hydra-planner` | **Opus** | Cada sesión (Plan mode) |
| 2. Implementar | `/hydra-implementer` | Composer | Commits en branch |
| 3. Revisar | `/hydra-reviewer` | **Sonnet** | Informe + merge (gate) |

Costo aproximado: Composer/Sonnet → Opus → Fable (más caro).

### Invocación — backloger (cualquier momento)

```
/hydra-backloger

@tasks/backlog.md

Feedback de uso:
[pegar notas / bugs / ideas]

Agregá ítems al backlog (IDs, épica, idea). No priorices ni planifiques.
```

### Invocación — orchestrator (recomendado día a día)

```
/hydra-orchestrator

Oleada: Fase 0, meta bloques 1–4.
priorizacion.md [vigente | re-priorizar].
Branch: oleada/YYYY-MM-DD-fase-0. Gates ON incl. merge.
```

Pin / renombrá el chat: `Oleada YYYY-MM-DD · [foco]`.

### Invocación — prioritizer (con branch)

```
/hydra-prioritizer

@tasks/backlog.md @tasks/lessons.md

Oleada [foco]. Creá branch oleada/YYYY-MM-DD-fase-0.
Actualizá priorizacion.md (**Branch:**). No todo.md.
```

### Invocación — planner

```
/hydra-planner

Double-check bloques [N–M] de priorizacion.md.
Escribí tasks/todo.md con Decisión/Descartado/Riesgos. No implementes.
```

### Invocación — implementer

```
/hydra-implementer

Implementá solo Bloque [N] ([ID]) de tasks/todo.md.
Commit al cerrar. No toques otros bloques.
```

### Invocación — implementer (oleada)

```
/hydra-implementer

@tasks/todo.md

Modo oleada: Bloques 1–4 en orden. Commit entre cada uno. Parar si escalación.
```

### Invocación — reviewer

```
/hydra-reviewer

@tasks/todo.md

Revisá bloques implementados. Informe primero.
Merge a main solo si digo merge OK.
```

### Archivar planes (opcional)

Al iniciar sesión nueva, copiar `todo.md` anterior a `tasks/plans/YYYY-MM-DD.md`.

---

## Convención al agregar ítems

1. Nuevo requerimiento / feedback de uso → `/hydra-backloger` o entrada manual en `backlog.md` con ID (`A-01`, `D-03`, etc.).
2. Decisión tomada → mover de “abiertas” a sección **Decisiones** en `backlog.md` con fecha.
3. Corrección recurrente → una línea en `lessons.md`.
4. Desajuste registry/runtime → `docs/planning/hydra-registry-gaps.md`.
5. UX param panel / proyección / globals → docs en `docs/planning/`.
