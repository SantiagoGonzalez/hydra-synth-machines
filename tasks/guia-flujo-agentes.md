# Guía día a día — flujo plan → execute

> Cómo usar los agentes `hydra-*` en Cursor.  
> Índice de tareas: [`README.md`](./README.md)

---

## En 30 segundos

**Intake (cualquier momento — chat corto, Composer):**
```
/hydra-backloger  →  filas en backlog.md
```

**Flujo orquestado (recomendado — 1 chat pinneado):**
```
/hydra-orchestrator
  → prioritizer (si hace falta) → GATE
  → planner → GATE
  → implementer (oleada) → reviewer
```

**Flujo manual (máximo control, más chats):**
```
0. /hydra-prioritizer  →  priorizacion.md
1. /hydra-planner      →  todo.md
2. /hydra-implementer  →  oleada o bloques
3. /hydra-reviewer     →  informe
```

**No uses multitask** para el pipeline: es secuencial (cada paso necesita el `.md` del anterior).

**Regla de oro:** el plan vive en `todo.md`; el chat orquestador solo coordina. Feedback de uso → backloger, no mezclar en implementer.

---

## Cómo invocar cada agente

### Opción A — Slash command (recomendada)

En el input del Agent, escribí:

```
/hydra-backloger
```

```
/hydra-orchestrator
```

o, si preferís paso a paso:

```
/hydra-prioritizer
```

```
/hydra-planner
```

```
/hydra-implementer
```

```
/hydra-reviewer
```

Cursor debería autocompletar si el subagent está en `.cursor/agents/`.

### Opción B — Mención natural

```
Usá el subagent hydra-planner para double-check bloques 1–4
```

```
Usá hydra-implementer para el Bloque 1 de tasks/todo.md
```

### Opción C — @ archivos + rol explícito

```
@tasks/priorizacion.md @tasks/backlog.md

Actuá como hydra-planner: escribí tasks/todo.md, no implementes.
```

La opción A es la más rápida una vez que te acostumbrás.

---

## Setup por sesión

| Rol | Subagent | Modelo | Chat |
|-----|----------|--------|------|
| Intake | `hydra-backloger` | **Composer** | Chat corto ad-hoc (cualquier momento) |
| ★ Orquestar | `hydra-orchestrator` | Composer | **1 chat pinneado / oleada** |
| Priorizar | `hydra-prioritizer` | **Sonnet** | Via orquestador (o chat dedicado) |
| Planificar | `hydra-planner` | **Opus** | Via orquestador (o chat dedicado) |
| Implementar | `hydra-implementer` | Composer | Via orquestador (oleada) |
| Revisar | `hydra-reviewer` | **Sonnet** | Via orquestador (al final) |

**Costo:** Sonnet → Opus → Fable (más caro). Fable es techo/frontera (~2× Opus); **no** usarlo para “abaratar”. Deep review → Opus (o Fable si lo pedís).

### Menos ruido en el historial

1. Un chat: `/hydra-orchestrator` → renombrá `Oleada YYYY-MM-DD · [foco]` → **pin**.
2. Los subagents corren debajo; no abras un chat nuevo por cada rol.
3. Buscá estado en `tasks/*.md`, no scrolleando chats viejos.
4. Al cerrar oleada: unpin; el siguiente día = chat nuevo con mismo patrón.

### Atajos útiles

| Acción | Atajo |
|--------|-------|
| Abrir Agent | `Ctrl+I` |
| Cambiar modo (menú) | `Ctrl+.` → elegir Plan / Agent |
| Ciclar modos (en input chat) | `Shift+Tab` |
| Nuevo chat / tab agente | `Ctrl+T` o botón **+** en panel Agent |
| Cursor Settings | `Ctrl+Shift+J` |
| Inline Diffs (Keep/Undo) | Settings → Agents → Applying Changes → ON |

---

## Rutina diaria

### Opción recomendada — orquestador (1 chat)

1. **Chat nuevo** → Agent → Composer (o default del orquestador)
2. Renombrá / pin: `Oleada YYYY-MM-DD · Fase 0`
3. Pegá:

```
/hydra-orchestrator

Oleada: Fase 0, meta bloques 1–4.
priorizacion.md [vigente | re-priorizar].
Crear branch oleada/2026-07-31-fase-0.
Gates ON. Implementación en oleada. Review al final. Merge a main solo si digo merge OK.
```

4. En cada **GATE**: revisá el `.md` y respondé `sí` / ajustes.
5. Al final: leé el informe del reviewer. Fixes críticos → mismo chat o re-delegar implementer.

`full auto` / `sin gates` saltea pausas (sigue secuencial; no es multitask). **Nunca** saltea el gate de merge a `main`.

---

## Git por oleada

Una oleada = un branch. Todo el trabajo vive ahí hasta el merge.

```
prioritizer  →  git checkout -b oleada/2026-07-31-fase-0
planner      →  commit chore(tasks): plan sesión (opcional)
implementer  →  un commit por bloque (código)
reviewer     →  commit tasks/ si falta + merge a main (solo con tu OK)
```

### Naming

| Bien | Mal |
|------|-----|
| `oleada/2026-07-31-fase-0` | `Oleada-2026-07-31-Fase 0` (espacios) |

El branch se registra en `priorizacion.md` → campo `**Branch:**`.

### Gates git

| Acción | Quién | Gate |
|--------|-------|------|
| Crear branch | prioritizer | inicio oleada |
| Commits de código | implementer | automático en branch |
| Merge a `main` | reviewer | **vos decís `merge OK`** |
| `git push` | cualquiera | **solo si lo pedís** |

**Nunca** force push a `main`.

### Prompt prioritizer con branch

```
/hydra-prioritizer

@tasks/backlog.md @tasks/lessons.md

Oleada Fase 0. Creá branch oleada/2026-07-31-fase-0.
Actualizá priorizacion.md con **Branch:**. No todo.md.
```

### Prompt reviewer con merge

```
/hydra-reviewer

@tasks/todo.md

Revisá bloques 1–4. Informe primero.
Si aprobado y te digo merge OK: merge oleada/2026-07-31-fase-0 → main --no-ff.
```

---

### Priorización manual (sin orquestador)

1. Revisá si `priorizacion.md` tiene fecha reciente y refleja lo que querés hacer.
2. Si no → **chat nuevo** → Agent → **Sonnet**:
```
/hydra-prioritizer

@tasks/backlog.md @tasks/lessons.md

Actualizá priorizacion.md para [esta semana / Fase 0 / foco que indiques].
Meta conservadora si no especifico tiempo.
```
3. Revisá mapa HOY / POSPONER y meta realista.
4. **Cerrá chat.** Siguiente: planner.

### Mañana o inicio de sesión de trabajo (5–15 min)

1. Abrí `tasks/priorizacion.md` — ¿qué bloques son hoy?
2. **Chat nuevo** → Plan mode → **Opus**
3. Pegá:

```
/hydra-planner

Double-check bloques [lista] de priorizacion.md.
Escribí tasks/todo.md con Decisión/Descartado/Riesgos por bloque.
No implementes código de la app.
```

4. Revisá `tasks/todo.md` — si algo falta o está mal, corregí en el mismo chat o pedí ajuste.
5. **Cerrá o archivá** ese chat. El artefacto es el archivo.

### Implementación — modo oleada (autónomo, bloques 1–4)

Cuando el plan está cerrado y los bloques son **S**, podés encadenar en **un solo chat**:

1. **Chat nuevo** → Agent → Composer
2. Pegá:

```
/hydra-implementer

@tasks/todo.md

Modo oleada: ejecutá Bloques 1–4 en orden.
Por cada bloque: implementar → tests manuales → commit → siguiente.
Si hay escalación, pará la oleada. Al terminar, avisame para /hydra-reviewer.
```

3. Revisá commits entre bloques si querés (Keep/Undo).
4. Al terminar → **chat nuevo** → review (abajo).

**Cuándo preferir oleada vs un chat por bloque:**

| Oleada (mismo chat) | Un chat por bloque |
|---------------------|-------------------|
| Bloques S, plan con Decisión/Descartado | Bloque M/L o mucha duda |
| Querés menos fricción | Querés revisar cada diff antes del siguiente |
| Máx. ~4 bloques | Más de 4 o contexto ya pesado |
| Confiás en commits atómicos | Preferís pausar y probar en stage entre bloques |

**No uses** `/multitask` para esto — la oleada es **secuencial**, no paralela.

### Review final (post-oleada o post-sesión)

1. **Chat nuevo** → **Sonnet** → Agent (default). Opus/Fable solo si pedís *deep review*.
2. Pegá:

```
/hydra-reviewer

@tasks/todo.md

Revisá bloques 1–4 implementados hoy.
Commits de la sesión, criterios de hecho, regresiones. Informe; no fixes salvo que pida.
```

3. Si el informe marca **Crítico** → volver a implementer solo en el bloque afectado.

### Cierre de día (5 min)

- [ ] Estados en `backlog.md` (`idea` → `done` donde aplique)
- [ ] `lessons.md` si hubo corrección tuya al agente
- [ ] Opcional: copiar `todo.md` → `tasks/plans/YYYY-MM-DD.md` antes de la próxima sesión

---

## Prompts copy-paste

### Backloger — feedback de uso

```
/hydra-backloger

@tasks/backlog.md

Al probar hoy noté:
- [bug / fricción / idea 1]
- [idea 2]

Agregá al backlog con IDs nuevos. Si hay duplicado, avisá. No priorices.
```

### Orchestrator — oleada completa

```
/hydra-orchestrator

Oleada: Fase 0, meta bloques 1–4.
priorizacion.md vigente (saltear prioritizer si la fecha es de hoy).
Gates ON. Oleada implementer. Review al final.
```

### Orchestrator — full auto (menos fricción)

```
/hydra-orchestrator

Bloques 1–4. priorizacion vigente. full auto. Oleada + review.
```

### Prioritizer — oleada estándar

```
/hydra-prioritizer

@tasks/backlog.md @tasks/lessons.md

Actualizá priorizacion.md: Fase 0 quick wins, meta bloques 1–4.
HOY / SPIKE / POSPONER. Defaults para decisiones abiertas. No todo.md.
```

### Prioritizer — foco acotado

```
/hydra-prioritizer

Solo priorizá Epic H (globals) y Epic G (param panel) para los próximos 2 días.
```

### Planner — sesión estándar (Fase 0)

```
/hydra-planner

@tasks/backlog.md @tasks/priorizacion.md @tasks/lessons.md

Double-check bloques 1–4 de priorizacion.md.
Escribí tasks/todo.md. Cada bloque con Decisión, Descartado, Riesgos, Escalación.
No implementes.
```

### Planner — un solo ítem urgente

```
/hydra-planner

Planificá solo H-01 (speed). Lee docs/planning/hydra-globals.md.
Escribí un bloque en tasks/todo.md. No implementes.
```

### Implementer — bloque concreto

```
/hydra-implementer

@tasks/todo.md

Solo Bloque 1 (H-01). Seguí Decisión y Descartado del plan.
Verificá criterio de hecho. Un commit: fix(launchpad): ...
```

### Implementer — oleada 1–4

```
/hydra-implementer

@tasks/todo.md

Modo oleada: Bloques 1–4 en orden. Commit entre cada uno.
Parar si escalación. No multitask.
```

### Reviewer — post-oleada

```
/hydra-reviewer

@tasks/todo.md @tasks/backlog.md

Revisá bloques 1–4. git log de hoy. Informe con severidad; no implementes.
```

### Implementer — spike (sin UI)

```
/hydra-implementer

Solo Bloque 7 (C-04 spike) de todo.md.
Scope: API en chain-store, sin UI. No expandir.
```

### Escalación (algo salió mal)

```
El código contradice el plan en H-01 (run() no se llama por frame).
Pará implementación. Actualizá solo el Bloque 1 en todo.md con la corrección.
```

Usá planner en el **mismo chat de plan** o uno nuevo; no sigas con implementer a ciegas.

---

## Cuándo usar qué

| Situación | Qué hacer |
|-----------|-----------|
| Feedback / bug al probar | `/hydra-backloger` (Composer, chat corto) |
| Día de trabajo normal | `/hydra-orchestrator` (1 chat pinneado) |
| Empezás oleada / backlog creció | Orquestador con `re-priorizar` o `/hydra-prioritizer` |
| `priorizacion.md` vigente | Orquestador saltea prioritizer, o `/hydra-planner` |
| Historial lleno de chats | Orquestador + pin; no un chat por rol |
| "¿Qué hago hoy?" | `priorizacion.md` o prioritizer si está viejo |
| Fix chico, 1 archivo, obvio | Agent directo (sin planner) — **excepción** |
| Feature 3+ pasos o decisión de arquitectura | **Siempre** planner primero |
| Bloque S con plan cerrado | `/hydra-implementer` oleada **o** un chat por bloque |
| Terminaste 2+ bloques | `/hydra-reviewer` en **chat nuevo** |
| Bloque M/L o plan dice "Modelo: Opus" | Implementer con **Opus**, no Composer |
| Explorar repo enorme sin implementar | Agent + explore subagent, o planner |
| "Ya tengo todo.md de ayer" | Saltá planner; implementer bloque a bloque |
| El agente empieza a replanificar | Recordá: *todo.md vigente = no replanificar* |

---

## Diagrama del flujo

```
  feedback de uso ──► /hydra-backloger ──► backlog.md
                                              │
              ┌───────────────────────────────┘
              ▼
              ┌──────────────────────────────────┐
              │  CHAT MAIN (pin)                 │
              │  /hydra-orchestrator            │
              │  Composer — solo coordina        │
              └────────────┬─────────────────────┘
                           │ secuencial (no multitask)
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
 prioritizer            planner            implementer
 priorizacion.md        todo.md            commits
     │                     │                     │
     └──────── GATE ───────┘                     │
                           └────── GATE ─────────┘
                                                 ▼
                                            reviewer
                                            informe
```

Alternativa manual: chats separados por rol (más control, más ruido en historial).

---

## Tips & tricks

### 1. Un chat orquestado ≠ 4 chats sueltos

Preferí `/hydra-orchestrator` pinneado por oleada. Los subagents aíslan contexto; el main solo resume. Evitá un chat nuevo por cada `/hydra-*` — llena el historial.

Excepción: si la oleada se pone pesada o hay escalación, abrí un chat solo para el bloque problemático.

### 2. El plan es el jefe

Si implementer sugiere otro enfoque que **Descartado** en el plan → frenalo:

```
Seguí la Decisión del bloque. Si no es viable, pará y escalá.
```

### 3. Branch antes de la sesión

```bash
git checkout -b feat/fase-0-quick-wins
```

Tu red de seguridad si el agente se va de scope.

### 4. Un commit por bloque

Alineado con `priorizacion.md`. Facilita revert y review.

### 5. @ solo lo necesario

Implementer con `@todo.md` + 1–2 archivos alcanza. No @ees todo el repo.

### 6. Plan mode de verdad para planner

Plan mode evita que escriba código "de paso". Si ves edits en `.ts` durante plan → corregí o usá Plan mode.

### 7. Revisá Decisión antes de aprobar el plan

Si un bloque solo tiene checkboxes sin **Decisión/Descartado**, pedí:

```
Completá Decisión y Descartado en el Bloque N antes de implementar.
```

### 8. lessons.md al inicio

Planner e implementer leen `lessons.md`. Mantenelo corto y accionable.

### 9. Archivar planes viejos

Antes de una sesión nueva:

```
tasks/todo.md  →  tasks/plans/2026-07-31-fase0.md
```

Así no perdés historial si sobrescribís `todo.md`.

### 10. Hydra = skill index

Si el bloque toca síntesis, el implementer debe leer `docs/hydra-skills-index/`. Si no, inventa APIs.

---

## Errores comunes

| Síntoma | Causa probable | Fix |
|---------|----------------|-----|
| Implementer replanifica todo | Mismo chat que el planner | Chat nuevo + solo `@todo.md` |
| "No encuentro hydra-planner" | Subagent no cargado | Verificá `.cursor/agents/hydra-planner.md` |
| Plan sin decisiones técnicas | Planner apurado | Pedí Decisión/Descartado por bloque |
| Cambios sin Keep/Undo | Agents Window o Inline Diffs OFF | Editor Window + Inline Diffs ON |
| Scope creep | Un bloque, muchos archivos | "Solo Bloque N; no toques X" |
| Commit gigante | Varios bloques en un chat | Revert + un bloque por chat |

---

## Checklist rápida

**Antes de planificar**
- [ ] `priorizacion.md` actualizado
- [ ] Branch creado (si vas a implementar hoy)

**Después del planner**
- [ ] `todo.md` tiene Decisión + Descartado por bloque
- [ ] Tests manuales listados
- [ ] Chat de plan cerrado o archivado

**Después de cada bloque**
- [ ] Criterio de hecho verificado
- [ ] Checkbox en `todo.md`
- [ ] Commit hecho
- [ ] Chat nuevo para el siguiente bloque

**Fin de día**
- [ ] `backlog.md` estados
- [ ] `lessons.md` si aplica

---

## Referencias en el repo

| Recurso | Path |
|---------|------|
| Subagent backloger | `.cursor/agents/hydra-backloger.md` |
| Subagent orchestrator | `.cursor/agents/hydra-orchestrator.md` |
| Subagent prioritizer | `.cursor/agents/hydra-prioritizer.md` |
| Subagent planner | `.cursor/agents/hydra-planner.md` |
| Subagent implementer | `.cursor/agents/hydra-implementer.md` |
| Subagent reviewer | `.cursor/agents/hydra-reviewer.md` |
| Regla always-on | `.cursor/rules/tasks-workflow.mdc` |
| Estándares generales | `.cursorrules` |
| Backlog | `tasks/backlog.md` |
| Priorización | `tasks/priorizacion.md` |
| Sesión activa | `tasks/todo.md` |

---

## Próximo paso sugerido

Abrí un chat Agent, renombrá `Oleada YYYY-MM-DD · Fase 0`, pinealo y corré el prompt **Orchestrator — oleada completa**. Aprobá en cada GATE.
