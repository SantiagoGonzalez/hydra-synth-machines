# Todo — sesión 2026-07-31 (oleada post Fase 0 parcial)

> Plan: hydra-planner · [`priorizacion.md`](./priorizacion.md) · [`backlog.md`](./backlog.md)
> **Estado:** listo para implementar (hydra-implementer). Double-check de bloques 1–4 con lectura real de código.

---

## Objetivo del día

Cerrar el resto de **Fase 0** (G-02, B-01) y dejar encaminada la **deuda** con dos spikes acotados (C-04 store, H-02 doc). Un commit por bloque, chat nuevo por bloque. Meta mínima: bloques **1–3**; **4** si el ritmo acompaña.

> **Nota de double-check (inconsistencias detectadas):**
> - **C-04:** `priorizacion.md` lista "reorder pad" y "cambio de output" como disparadores de `pushHistory`. **No existe** acción de reorder en el store (el orden deriva de `activatedAt`) y el cambio de output es **navegación**, no mutación. Este plan los excluye (ver Bloque 3).
> - **B-01:** los hints de bypass y `⇧⌫ remove` **ya existen** (A-02, `pad-param-panel.tsx` L69–73/L85). No re-crear; el subset se enfoca en lo que falta (output tabs, term "chain/compiled code").
> - **H-02:** `docs/planning/hydra-globals.md` **ya contiene** opciones A/B/C y tabla por fader; el spike consolida en recomendación concreta, no re-deriva.
> - El `todo.md` anterior era de la oleada ya cerrada (H-01/C-05/G-01/A-02 → done); se sobrescribe.

---

## Bloque 1 — G-02 · Atajo focus → input numérico

**Decisión:** activar la **edición inline del input numérico ya existente** (`param-slider.tsx` L112–128, solo en modo escalar) mediante `/` (Slash) como tecla primaria y `Enter` como secundaria, **solo** cuando `focusZone === "params"` y el control enfocado es escalar. El hook expone un callback nuevo `onEditFocusedControl()`; su implementación (en `pad-band.tsx`) hace foco por DOM sobre `[data-control-id="<focusedControlId>"] input` (patrón `querySelector` ya usado en el hook para overlays) y `.select()`. En modo `fn` no hay input → no-op natural.
**Descartado:**
- `Enter` como única tecla: choca con Apply armed/source (`use-launchpad-keys.ts` L278–287). Se usa `/` como primaria y `Enter` guardado por `focusZone`.
- Registrar una función de foco desde `param-slider` hacia un store/ref global: más maquinaria; el `querySelector` sobre `data-control-id` (ya presente en L88) es mínimo y consistente.
- Añadir un stepper o cambiar el slider (G-05/G-03): fuera de scope.
**Archivos (rutas confirmadas):**
- `hooks/use-launchpad-keys.ts` — añadir `onEditFocusedControl: () => void` a `LaunchpadKeyOptions` (L34–63) y a **ambos** `optionsRef` (L119–149 y L150–180). Handler: dentro del branch sin modificadores (L253), interceptar `event.code === "Slash"` → `preventDefault()` + `onEditFocusedControl()`. Para `Enter`: **antes** del `Enter` genérico (L278), si `focusZone === "params"` → `onEditFocusedControl()` y `return` (deja intacto Apply en pads/chain).
- `components/launchpad/pad-band.tsx` — cablear `onEditFocusedControl` en la llamada a `useLaunchpadKeys`: leer `focusedControlId`/`focusZone` de `useChainStore.getState()`; si zona params, `document.querySelector('[data-control-id="'+id+'"] input')?.focus()` + `.select()`.
- `components/launchpad/param-slider.tsx` — agregar cancelación con `Escape` en el `onKeyDown` del input (L119–125): `setDraft(null)` **sin** commit. Usar un `cancelRef`/flag para que el `onBlur={commitDraft}` (L118) no confirme el valor descartado.
**Pasos:**
- [x] `use-launchpad-keys.ts`: agregar `onEditFocusedControl` a la interfaz y a ambos `optionsRef`.
- [x] `use-launchpad-keys.ts`: handler `/` (Slash) en el branch sin modificadores + guard `Enter` en `focusZone === "params"` antes del Enter genérico.
- [x] `pad-band.tsx`: implementar `onEditFocusedControl` (foco por `data-control-id` + `.select()`), acotado a `focusZone === "params"`.
- [x] `param-slider.tsx`: `Escape` cancela edición sin mutar (flag de cancelación que neutraliza `onBlur` commit).
**Criterio de hecho:**
- [x] Con `focusZone === "params"` y slider escalar enfocado: `/` o `Enter` enfoca y selecciona el input numérico.
- [x] `Escape` durante la edición restaura el valor previo sin mutar.
- [x] `Enter` en zona pads/chain **sigue** aplicando armed/source (sin regresión).
- [x] En modo `fn` (sin input), `/` no rompe nada (no-op).
**Tests manuales:**
1. Seleccionar `osc`, `P` (focus params), navegar con ↑↓ hasta un escalar; pulsar `/` → el valor queda editable y seleccionado; tipear un número + `Enter` aplica.
2. Repetir y pulsar `Escape` mientras se edita → vuelve al valor anterior.
3. Armar un pad (`Shift`+tecla), `Enter` en zona pads → aplica el armed (no abre edición).
**Riesgos:**
- **Commit al blur:** `commitDraft` (L75–83) confirma en `onBlur`; el cierre captura el `draft` viejo, así que `setDraft(null)` async + `blur()` podría igual confirmar. Mitigar con `cancelRef.current = true` leído dentro de `commitDraft`.
- Doble disparo de `Enter` (edición + Apply): el guard por `focusZone` y el `return` deben ir **antes** del Enter genérico.
- `data-control-id` del contenedor incluye el input como descendiente; verificar el selector encuentra el `<input>` (no el div).
**Escalación:** si `Enter` no puede aislarse limpiamente del Apply sin regresión, **parar** y dejar solo `/` (default seguro), anotando la limitación. No inventar nuevos bindings.
**Modelo sugerido:** Composer.
**Commit:** `feat(params): enfoca el input numérico con / y enter en zona params`

---

## Bloque 2 — B-01 · Tooltips glosario (subset 5–8)

**Decisión:** agregar **solo `title=`** (patrón nativo ya usado en `chain-preview`, `hydra-canvas`, `param-panel`) con términos de `docs/glosario-hydra.md`, priorizando lo que **hoy no tiene tooltip**. Subset objetivo (5–8): (1) tabs de output o0–o3, (2) toggle grid 2×2 (enriquecer copy), (3) estado LIVE/INIT, (4) botón copy / "compiled code", (5) fader global SPEED, (6) chip/preview "chain". Reutilizar los términos exactos del glosario (Buffer/Output, Chain, Compiled code, Bypass).
**Descartado:**
- Componente Tooltip (Radix) nuevo: cambia el patrón por 5–8 hints; `title=` es suficiente y consistente. Si se pide UX más rica → backlog (B-02).
- Re-crear hints de bypass / `⇧⌫ remove`: **ya existen** (A-02). Solo enriquecer copy si aporta, sin duplicar.
- Tooltips en todo el registry o modal tutorial (F-01): fuera de scope.
**Archivos (rutas confirmadas):**
- `components/launchpad/hydra-canvas.tsx` — tabs output (L170–184) **sin `title`** → agregar p.ej. `title="Output buffer oN — edición (Shift+N)"`; estado LIVE/INIT (L197–206) → tooltip "synth activo"; grid ya tiene `title` (L192).
- `components/launchpad/chain-preview.tsx` — botón copy ya tiene `title="Copy compiled code"` (L80); opcional: tooltip en el label "Chain" (L66) con la definición del glosario.
- `components/launchpad/global-faders.tsx` — SPEED (post H-01): `title` con "multiplicador de velocidad (speed)". **Verificar** el archivo antes de editar (no leído en el plan).
- Fuente de términos: `docs/glosario-hydra.md` (Buffer/Output L15/L32, Chain L14/L31, Compiled code L33, Bypass L37).
**Pasos:**
- [x] `hydra-canvas.tsx`: `title` en los 4 tabs de output y en el indicador LIVE/INIT.
- [x] `hydra-canvas.tsx`/`chain-preview.tsx`: revisar/enriquecer copy de grid y "chain/compiled code".
- [x] `global-faders.tsx`: `title` en SPEED (confirmar estructura del archivo primero).
- [x] Verificar coherencia de términos con `docs/glosario-hydra.md` (no cambiar los términos del glosario).
**Criterio de hecho:**
- [x] 5–8 tooltips con términos del glosario visibles en hover, sin abrir doc externa.
- [x] No se duplican los hints ya entregados por A-02.
- [x] UI en inglés (el glosario es doc-facing en español; los `title` van en inglés como el resto).
**Tests manuales:**
1. Hover sobre o0/o1/o2/o3 → aparece la explicación del buffer/output.
2. Hover sobre el botón copy y el fader SPEED → tooltip claro.
3. Ninguna regresión visual/layout (solo atributo `title`).
**Riesgos:**
- Inconsistencia de idioma: mantener `title` en inglés como el resto de la UI.
- Duplicar términos ya visibles (bypass/remove) → revisar antes de escribir.
- `global-faders.tsx` no fue leído; el implementer debe confirmar la estructura antes de tocar.
**Escalación:** si el equipo prefiere Tooltip enriquecido (Radix) en vez de `title=`, es cambio de patrón → replanificar (sale del scope S de B-01).
**Modelo sugerido:** Composer.
**Commit:** `feat(web): agrega tooltips de glosario en outputs, chain y speed`

---

## Bloque 3 — C-04 (spike) · Undo cadena en el store (sin UI)

**Decisión:** agregar historial **por referencia** al store. Como `chains` se maneja de forma **inmutable** (`updateChain` hace spread y los updaters usan `.map`), un snapshot puede guardar la **referencia** actual de `chains` + `editingOutput` + `globalFaders` **sin deep clone**. `pushHistory()` se llama al **inicio** de las mutaciones estructurales elegidas (antes del `set`); `undo()` restaura el último snapshot y re-ejecuta `syncEditingView`. Stack máx **5** (descartar el más viejo). **Sin UI** (test por consola/DevTools).
**Descartado:**
- Deep clone del estado en cada snapshot: innecesario (el store nunca muta in-place). Guardar referencias es correcto y barato.
- Centralizar `pushHistory` dentro de `updateChain`: lo comparten mutaciones que **no** deben historiar (`updateParam`/`updateSecondaryParam`). Se llama explícito en las acciones elegidas.
- `pushHistory` en `updateParam`/`updateSecondaryParam`/nudge/`setGlobalFader`: ruidoso (decisión `priorizacion.md`: **no** snapshot en slider). Excluidos.
- `pushHistory` en `setEditingOutput` (**corrección a priorizacion.md**): es navegación, no mutación; no debe historiarse. `undo()` revierte mutaciones, no cambios de vista.
- `redo`: fuera de scope hoy (backlog lo ubica en la fase UI).
**Mutaciones que disparan `pushHistory` (decisión del planner):** `toggleSlot`, `applyArmedSlot`, `removeSlot`, `toggleBypass`, `clearAll`, `updateSecondarySource`.
**Archivos (rutas confirmadas):**
- `stores/chain-store.ts` — tipo `ChainSnapshot = { chains: Record<OutputBuffer, OutputChain>; editingOutput: OutputBuffer; globalFaders: GlobalFaderValues }`; estado `history: ChainSnapshot[]` (init `[]`); helper interno `pushHistory()` (lee `get()`, agrega snapshot, recorta a 5); acción `undo()` (pop → `set({ chains, editingOutput, globalFaders, ...syncEditingView(...) })`). Añadir `history` y `undo` a `ChainState` (interfaz L144–195) y al objeto `create` (L197+). Insertar `get().pushHistory?.()` al inicio de las 6 acciones listadas.
**Pasos:**
- [x] Definir `ChainSnapshot` y agregar `history: ChainSnapshot[]` al estado (interfaz + init).
- [x] Implementar `pushHistory()` (snapshot por referencia; recorte a 5) y `undo()` (restaura + `syncEditingView`).
- [x] Llamar `pushHistory()` al inicio de `toggleSlot`, `applyArmedSlot`, `removeSlot`, `toggleBypass`, `clearAll`, `updateSecondarySource`.
- [x] Documentar en el propio spike (comentario en español de una línea) qué mutaciones historian y por qué se excluye slider/output.
**Criterio de hecho (spike):**
- [x] En consola: `useChainStore.getState().undo()` tras activar/quitar/bypass un pad **revierte** el estado visible en pads.
- [x] El stack nunca supera 5 entradas.
- [x] Mover un slider o cambiar de output **no** genera entrada de historial.
**Tests manuales (DevTools):**
1. Activar 3 pads (toggle) → `undo()` ×3 → cadena vuelve a vacío, paso a paso.
2. Bypass un pad → `undo()` → vuelve a no-bypassed.
3. Mover un slider 10 veces → `history.length` no cambia; luego un toggle sí suma 1.
**Riesgos:**
- **Referencias compartidas:** validar que ninguna acción mute `chains` in-place (todas usan `.map`/spread hoy; una regresión futura rompería el snapshot).
- `undo()` debe recomputar `padSlots/activePads/compiledCode/previewCode` vía `syncEditingView`, no solo setear `chains`.
- `removeSlot`/`applyArmedSlot` ya limpian `armedSlotId/selectedSlotId`; el snapshot no los guarda (aceptable en spike; anotar si molesta).
**Escalación:** si aparece una mutación que sí muta in-place (snapshot corrupto) o si se necesita historiar params/reorder, **parar** y replanificar el modelo de snapshot (posible deep clone selectivo). No abrir la UI Ctrl+Z (es el bloque 5, otra sesión).
**Modelo sugerido:** Opus (toca el store; decisiones de arquitectura del historial).
**Commit:** `feat(chain): agrega historial de mutaciones y undo en el store (spike)`

---

## Bloque 4 — H-02 (spike) · Auditar BRIGHT / DECAY / AMOUNT (doc)

**Decisión:** **solo documentación** — consolidar `docs/planning/hydra-globals.md` en una **recomendación concreta por fader** (brightness/decay/amount), cerrar (con default propuesto, no implementar) las decisiones abiertas #1/#2/#3 del propio doc (L118–120), y registrar que **H-01 (speed) está done**. No tocar código de globals (decisión #5 abierta).
**Descartado:**
- Implementar brightness/decay/amount: decisión #5 abierta; H-02 es diagnóstico.
- Re-derivar desde cero: el doc ya trae opciones A/B/C (L62–93) y tabla Hydra-real (L27–32); se consolida, no se reescribe.
- Tocar `bpm`/`setResolution` (H-03/H-04): fuera de scope.
**Archivos (rutas confirmadas):**
- `docs/planning/hydra-globals.md` — actualizar tabla y sección de decisiones con recomendación por fader; marcar H-01 done.
- Lectura de apoyo (no editar): `lib/global-faders.ts` (rangos: `brightness` −1..1 def 0; `decay` 0..1 def 0; `amount` 0..1 def 0.5), `docs/hydra-skills-index/color/` (`.brightness()`), `docs/hydra-skills-index/blend/` (feedback vía `src(oN).blend`), `synth-settings/synth-settings.md`.
**Entregable (tabla por fader):**
- [x] `brightness` → recomendación: `.brightness(v)` al final de la cadena **o** CSS master (elegir default, citar rango −1..1); no es global Hydra.
- [x] `decay` → recomendación: renombrar a "feedback" y cablear solo con `src(oN)` activo; o marcar como no-op documentado hasta D-06.
- [x] `amount` → recomendación: eliminar del panel **o** definir semántica concreta (p.ej. cantidad por defecto de modulate); default propuesto.
**Criterio de hecho (spike):**
- [x] `hydra-globals.md` con una recomendación **implementable** por fader y default propuesto para #1/#2/#3.
- [x] H-01 marcado como done en el doc.
- [x] **No** se modifica código de la app.
**Tests manuales:** N/A (doc). Verificación: releer el doc y confirmar que un implementer podría abrir un ticket H-02b sin ambigüedad.
**Riesgos:**
- No inventar APIs Hydra: citar skill index; si un mapeo es incierto, marcar **gap** (no afirmar).
- No cerrar la decisión #5 como "hecho" (sigue abierta); el doc propone default, no lo implementa.
**Escalación:** si al documentar surge que `amount`/`decay` no tienen semántica viable sin decisión de producto, **parar** y listar la pregunta para el usuario (no forzar un mapeo dudoso).
**Modelo sugerido:** Composer (solo doc; Opus si se quiere análisis Hydra más profundo).
**Commit:** `docs(globals): consolida recomendaciones de bright/decay/amount (H-02)`

---

## Bloque 5 — C-04 UI · Ctrl+Z undo cadena

**Decisión:** `Ctrl+Z` / `Cmd+Z` (sin Shift) llama `useChainStore.getState().undo()` desde el hook de teclado; handler temprano antes del branch `KeyZ` nudge; `isEditableTarget` excluye inputs numéricos.
**Descartado:** Ctrl+Shift+Z redo; undo en inputs editables; historiar sliders.
**Pasos:**
- [x] `use-launchpad-keys.ts`: `onUndo` en interfaz + ambos `optionsRef`; handler Ctrl/Cmd+Z antes de `KeyZ` nudge.
- [x] `pad-band.tsx`: cablear `onUndo` con check `history.length`; feedback breve "Undone" en toolbar.
**Criterio de hecho:**
- [x] Ctrl/Cmd+Z deshace hasta 5 niveles en mutaciones estructurales.
- [x] Ctrl+Z en input numérico no interceptado (`isEditableTarget`).
- [x] Sin regresión en Z+arrow nudge ni copy chain.
**Commit:** `feat(chain): agrega atajo ctrl+z para deshacer mutaciones`

---

## Bloque 6 — G-03 spike · Fader vertical piloto

**Decisión:** spike con un solo control escalar en layout vertical; `param-fader.tsx` + integración en primer param de `pad-param-panel.tsx`; hallazgos en `param-panel-redesign.md`.
**Descartado:** migrar todos los params; global-faders; stepper G-05; RGB.
**Pasos:**
- [x] Crear `param-fader.tsx` con Radix Slider `orientation="vertical"`.
- [x] Integrar piloto en primer param escalar de `pad-param-panel.tsx` (badge "pilot").
- [x] Documentar hallazgos en `docs/planning/param-panel-redesign.md`.
**Criterio de hecho:**
- [x] Un param escalar controlable con fader vertical funcional.
- [x] Navegación teclado existente no rota en el resto del panel.
- [x] Doc actualizado con recomendación go/no-go G-06.
**Commit:** `feat(params): spike de fader vertical piloto (G-03)`

---

## Review (al cerrar sesión)

- [x] Actualizar estados en `backlog.md` (G-02 y B-01 → `done` si se cerraron; C-04 spike → nota de avance; H-02 → doc actualizado).
- [ ] Registrar en `lessons.md` cualquier corrección del usuario (p.ej. si `Enter` inline generó regresión, o si reorder/output cambian el modelo de undo).
- [x] Un commit por bloque cerrado (Conventional Commits, español, con scope).
