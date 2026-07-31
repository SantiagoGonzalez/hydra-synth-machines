# Todo — sesión 2026-07-31 (oleada G-08 / G-09)

> Plan: hydra-planner · [`backlog.md`](./backlog.md) (Epic G, L144–150) · [`priorizacion.md`](./priorizacion.md) (contexto oleada 1–3)
> **Estado:** listo para implementar (hydra-implementer). Scope fijado por el usuario (follow-ups de G-07); **no** re-prioriza la oleada anterior.
> **Branch:** no hay branch de oleada en `priorizacion.md` para estos ítems. Recomendado antes de codear: `git checkout -b oleada/2026-07-31-color-followups` (o commitear en `main` si el usuario prefiere). El planner **no** crea branch.

---

## Objetivo del día

Resolver los dos follow-ups de **G-07** (RGB HEX + picker + sliders, ya `done`):

- **G-09** — quitar el lag al arrastrar el color picker nativo (fix corto, root-cause). **Implementación real.**
- **G-08** — decidir go/no-go de "color por swatches / paleta": **SOLO SPIKE** (investigación + nota + recomendación; **no** se construye la paleta).

**Orden y oleada:** hacer **G-09 primero** (Bloque 1, fix concreto que también reduce el costo de cualquier commit multi-canal futuro), luego **G-08** (Bloque 2, nota). Son **independientes** (G-09 no depende de G-08). Recomendación: **una sola oleada** — G-09 (fix S) + G-08 (nota, sin código de UI). Commit separado por bloque: G-09 = commit de código; G-08 = commit de doc (nota del spike).

---

## Veredicto del double-check de perf (G-09) — leído en código real

**Hipótesis del backlog: CONFIRMADA a nivel store (con un matiz sobre `run()`).**

Cadena real del arrastre del picker nativo:

1. `<input type="color">` con `onChange={handlePickerChange}` — el picker nativo **emite eventos de forma continua durante el drag** (input live), no solo al soltar.
2. `handlePickerChange` (`rgb-color-control.tsx` L58–65) → `applyRgb(r,g,b)` (L37–45).
3. `applyRgb` llama **3×** `onChannelChange` (r, g, b) → en el panel eso es **3× `updateParam`** (`pad-param-panel.tsx` L105: `onChannelChange={(ch,val)=>updateParam(pad.instanceId, ch, val)}`).
4. Cada `updateParam` (`chain-store.ts` L705–714) ejecuta `updateChain` → `syncEditingView` (L172–194) → `rebuildCompiled` → `compileMultiChain` **sobre los 4 output buffers** (`chain-compiler.ts` L154–177). ⇒ **3× recompilación completa multi-output por cada evento del drag.**
5. `HydraCanvas` está suscripto a `compiledCode` (`hydra-canvas.tsx` L26) y su `useEffect` (L66–83) llama `evaluatorRef.current.run(compiledCode, …)`. `run()` (`chain-evaluator.ts` L141–170) construye un **`new Function(...)`** con ~90 claves bindeadas y lo evalúa **en cada cambio**.

**Matiz honesto (no asumir el "3×" en `run()`):** las 3 llamadas a `set()` de zustand ocurren **síncronas dentro de un mismo event handler** de React → por el batching de React 18 el **re-render y el `useEffect`/`run()` probablemente disparan 1× por evento `onChange`**, no 3×. Lo que **sí** se ejecuta 3× síncrono es `compileMultiChain` (recompila los 4 outputs 3 veces por evento). Sumado a que el picker emite muchos eventos/seg durante el drag, cada uno paga compile(×3) + `new Function`+eval. **Ese es el costo real.** (Verificar los números exactos en el paso de medición.)

**Fix más elegante (mi recomendación, difiere del backlog):**
- **Primario (root-cause): commit atómico multi-canal.** Nueva acción de store `updateParams(instanceId, patch)` que fusiona varios params en **un solo `set`** → **una sola** `syncEditingView`/`compileMultiChain`. `applyRgb` la llama **una vez** con `{r,g,b}`. Elimina el 3× (queda 1× compile por evento), es minúsculo (espeja `updateParam`), **reutilizable** (sirve a cualquier escritura multi-canal futura, p. ej. swatches de G-08) y **no** introduce estado espejo ni riesgo de desync.
- **Descartado como primario: "preview local + commit on `pointerup`"** (propuesta del backlog). El `<input type="color">` abre el diálogo nativo del SO; **no** hay un `pointerup` fiable del arrastre dentro del popup en Chrome, y agregar estado local espejo del color rompe la "única fuente de verdad = `pad.params`" que G-07 dejó establecida (riesgo de desync HEX↔picker↔sliders). Solo se consideraría si, ya con commit atómico, la medición muestra que el cuello sigue siendo la **frecuencia** de `run()`.
- **Secundario (solo si tras medir sigue laggeando): rAF-coalescing.** Colapsar los `onChange` del picker a **como máximo un commit por frame** (throttle vía `requestAnimationFrame`) dentro de `rgb-color-control.tsx`. Reduce la frecuencia de `new Function`+eval sin tocar la arquitectura ni la fuente de verdad.

---

## Bloque 1 — G-09 · Perf del color picker nativo (fix corto)

**Scope:** implementación real (fix S). No es spike.

**Decisión:** implementar el **commit atómico multi-canal** como fix primario. Añadir `updateParams(instanceId, patch: Record<string, ParamValue>)` al store (una acción, un `set`, un `compileMultiChain`) y que `RgbColorControl.applyRgb` escriba los 3 canales de una sola vez a través de un único callback. **Medir antes y después.** Dejar el **rAF-coalescing preparado como paso opcional** que se activa solo si la medición post-atómico sigue mostrando lag perceptible.

**Descartado:**
- **Preview local + commit on `pointerup`** (backlog): `pointerup` no es fiable en el popup nativo del SO; agrega estado espejo y riesgo de desync con la fuente de verdad `pad.params`. Ver veredicto arriba.
- **Debounce por tiempo (setTimeout Nms):** introduce latencia perceptible y "salto" al final; rAF es más natural para animación/drag si hiciera falta el secundario.
- **Memoizar/cachear `compileMultiChain`:** más complejo y ataca el síntoma, no la causa (el 3× redundante). El commit atómico elimina la causa con menos código.
- **Reescribir `run()` para no usar `new Function`:** fuera de scope (afecta todo el pipeline de evaluación, no solo el color); si la medición lo señala como cuello real, escalar y planificar aparte.

**Archivos (rutas confirmadas):**
- `stores/chain-store.ts`
  - Interfaz `ChainState` (junto a `updateParam`, L241): declarar `updateParams: (instanceId: string, patch: Record<string, ParamValue>) => void`.
  - Implementación (espejo de `updateParam` L705–714, un solo `set` + `updateChain`): fusionar todo el `patch` sobre `s.params` en un único `map` → una sola `syncEditingView`/`compileMultiChain`.
- `components/launchpad/rgb-color-control.tsx`
  - `applyRgb` (L37–45): en vez de 3× `onChannelChange`, construir el `patch` `{ r, g, b }` (con `clamp` por canal según `mode`) y emitirlo en **una** llamada.
  - Prop nueva sugerida `onChannelsChange(patch: Record<RgbChannel, number>)` (o renombrar la existente); mantener compat si algún otro caller usa `onChannelChange` por canal.
- `components/launchpad/pad-param-panel.tsx`
  - Wiring de `<RgbColorControl>` (L100–106): pasar el commit atómico `onChannelsChange={(patch)=>updateParams(pad.instanceId, patch)}` (obtener `updateParams` del store como se obtiene `updateParam` en L20).
- **(Medición, temporal — quitar antes del commit):** instrumentar `updateParam`/`updateParams` o `compileMultiChain` con `console.count`/`performance.now`, o usar React DevTools Profiler / Chrome Performance trace durante un drag del picker, para contar llamadas y ms por evento **antes vs después**.

**Pasos:**
- [x] **Medir baseline:** contar `updateParam` y ms de `compileMultiChain` por evento durante un drag del picker (nota breve con los números).
- [x] Agregar `updateParams(instanceId, patch)` al store (un `set`, un compile).
- [x] Cambiar `applyRgb` para emitir `{r,g,b}` en una sola llamada; wirear `updateParams` en el panel.
- [x] **Re-medir:** confirmar que el compile por evento pasó de 3× a 1× y que el drag se siente fluido.
- [x] Si sigue laggeando: agregar rAF-coalescing del `onChange` del picker (máx. 1 commit/frame) y re-medir. *(No necesario: 3×→1× suficiente.)*
- [x] Quitar toda la instrumentación temporal.

**Criterio de hecho:**
- [x] Arrastrar el color picker nativo se siente fluido (sin stutter perceptible) en `solid` y `color`.
- [x] Un evento `onChange` del picker produce **una sola** `compileMultiChain` (verificado por medición), no tres.
- [x] HEX, picker y sliders siguen sincronizados (sin regresión de G-07); la fuente de verdad sigue siendo `pad.params`.
- [x] `color` (multiplier) sigue clampando a [0,1] en picker/HEX; valores >1 solo por slider.
- [x] Sin instrumentación temporal ni `console.*` en el diff final.

**Tests manuales:**
1. Pad `solid` → abrir params → **arrastrar** el picker rápido: el canvas sigue el color sin tirones; HEX y sliders r/g/b se actualizan.
2. Pad `color` → arrastrar picker: fluido; el swatch clampa a [0,1] y no rompe.
3. Escribir HEX `#44ff88` + Enter y mover un slider: siguen sincronizados (el commit atómico no rompió las otras vías).
4. (Si se agregó rAF) soltar el picker: el color final queda **exacto** (el último frame se commitea, sin quedar "una posición atrás").

**Riesgos:**
- **Último frame perdido con rAF:** si se agrega el coalescing, garantizar que el **valor final** del drag se commitea (flush en el último evento / on blur), o el color queda ligeramente desfasado.
- **Regresión de sync:** el commit atómico debe fusionar sobre `s.params` **sin pisar** otros params del pad (usar spread `{ ...s.params, ...patch }`), igual que hace `updateParam` con un solo campo.
- **`updateParams` y undo:** `updateParam` hoy **no** hace `pushHistory` (los params están fuera del snapshot de undo, por diseño). `updateParams` debe seguir el **mismo** criterio (no `pushHistory`) para no cambiar el comportamiento de undo.
- **Otros callers de `onChannelChange`:** si se renombra la prop, verificar que ningún otro componente la use (hoy solo `pad-param-panel.tsx`).

**Escalación:** si la medición muestra que, con commit atómico **y** rAF, el cuello real es `run()`/`new Function` por frame (no el compile), **parar y re-planear**: optimizar el pipeline de evaluación es un bloque aparte (afecta a todo, no solo el color). Lección vigente: *"run() no es por frame"* — acá el drag sí fuerza `run()` por evento, distinto del caso de animación por arrow.

**Modelo sugerido:** **Composer** (S; cambio acotado que espeja un patrón existente + medición).

**Commit:** `fix(params): evita recompilaciones al arrastrar el color picker`

---

## Bloque 2 — G-08 · Spike: color por swatches / paleta (SOLO SPIKE)

**Scope:** **SOLO SPIKE / NO UI.** Entregable = **nota de investigación + recomendación go/no-go**. **No** se construye la paleta ni se instala ninguna librería en este bloque. La implementación real de swatches queda para un **bloque posterior** condicionado al resultado de este spike.

**Decisión:** producir una **nota comparativa** (en `docs/planning/param-panel-redesign.md`, sección nueva "G-08 spike swatches", o `docs/planning/color-swatches-spike.md` si el implementer prefiere separarlo) que evalúe **librería ligera vs grid custom** para elegir color desde una **paleta de swatches** (no un picker HSV completo), con **recomendación explícita go/no-go** y, si es go, cuál de las dos vías.

**Descartado (dentro del spike):**
- **Construir la paleta ahora:** viola el scope de spike. Solo investigación + decisión.
- **Reemplazar el picker nativo de G-07:** el nativo es aceptable como v1 (feedback). Los swatches **se suman**, no reemplazan.
- **Datos de peso inventados:** cualquier métrica de bundle/a11y debe **verificarse en el spike** (bundlephobia + repo real), no darse por cerrada acá.

**Criterios a comparar (matriz del spike):**
| Criterio | Qué medir |
| --- | --- |
| **Peso bundle** | KB gzipped del subcomponente **realmente importado** (tree-shaking), no del paquete entero. Verificar en bundlephobia. |
| **API / control** | ¿Emite HEX / rgb que mapea limpio a `hexToRgb` (`lib/color-param.ts`) y al **commit atómico `updateParams`** por canal (r,g,b)? ¿Swatches configurables (nuestra paleta)? |
| **a11y** | Navegación por teclado, roles/ARIA, foco visible — sin chocar con `isEditableTarget` (`use-launchpad-keys.ts`) ni con los atajos 1–5/Z. |
| **Dark UI** | ¿Themeable a la estética del panel (bordes `white/10`, mono, dark) sin pelear con estilos propios del lib? |
| **Integración modelo G-07** | Encaja con `mode: "unit"` (solid) vs `mode: "multiplier"` (color, clamp [0,1]) y con `colorInput` del registry. |
| **Mantenimiento** | Dependencias, actividad del repo, tipos TS, riesgo de upgrade. |

**Candidatas a investigar (métricas a VERIFICAR en el spike — no cerradas):**
- **Grid custom** (baseline): botones de swatch propios (~pocas líneas), escriben vía `updateParams` atómico; **0 KB** de dependencia, control total de a11y/dark UI. Para *swatches puros* suele ser suficiente — el spike debe justificar si vale la pena un lib.
- **`react-colorful`**: reputado ~2,8–3,1 KB gzip, sin deps, hooks, tree-shakeable (WebSearch 2026 — verificar). **No** trae componente de swatches nativo (habría que construirlos sobre sus primitivas) → para *solo swatches* aporta poco frente al grid custom.
- **`@uiw/react-color`** (`@uiw/react-color-swatch`): trae componente de swatches drop-in; el subpaquete rondaría ~25 KB unpacked (verificar gzip real importado). Evaluar si el peso se justifica vs grid custom.
> Nota: los números de arriba vienen de una búsqueda web de referencia y **deben confirmarse en el spike** (bundlephobia + prueba de import real). No instalar nada para "probar" fuera del spike.

**Archivos (solo doc):**
- `docs/planning/param-panel-redesign.md` — sección nueva "G-08 — Spike swatches (nota + go/no-go)". (O `docs/planning/color-swatches-spike.md` nuevo, kebab-case.)
- `tasks/backlog.md` — al cerrar, reflejar el resultado en la fila G-08 (ver Review). **No** marcar G-08 como `done` salvo que el go/no-go quede cerrado; si el resultado es "go", abrir el ítem de implementación (nuevo ID o nota en G-08).

**Pasos:**
- [x] Verificar en bundlephobia el peso gzip **realmente importado** de las candidatas (react-colorful, @uiw/react-color-swatch) vs grid custom (0).
- [x] Probar (en papel / sandbox mental, sin instalar en la app) el mapeo de cada opción a `hexToRgb` + `updateParams` atómico y a `mode` unit/multiplier.
- [x] Chequear a11y (teclado/ARIA/foco) y themeabilidad dark de cada opción.
- [x] Escribir la matriz comparativa + **recomendación go/no-go** (y si go, qué vía y con qué paleta inicial).
- [x] Definir el alcance del bloque de implementación posterior (si aplica) para el backlog.

**Criterio de hecho:**
- [x] Existe una nota con la **matriz** (peso, API, a11y, dark UI, integración, mantenimiento) para grid custom vs al menos 1 lib.
- [x] Hay una **recomendación go/no-go explícita** y, si es go, la vía elegida y una paleta inicial propuesta.
- [x] Ninguna métrica queda "inventada": cada dato de peso/a11y cita fuente o se marca verificado en el spike.
- [x] **No** se agregó código de UI ni dependencias a la app en este bloque.

**Tests manuales:** N/A (spike de investigación). Verificación = la nota responde go/no-go con datos verificables y el implementer/usuario puede decidir el siguiente bloque sin re-investigar.

**Riesgos:**
- **Scope creep:** la tentación de "ya que estoy, armo el grid". No: esto es solo la nota. Si el go es obvio y trivial (grid custom), igualmente **cerrar el spike** y abrir un bloque de implementación aparte.
- **Métricas obsoletas:** pesos de libs cambian por versión — fechar la nota y linkear bundlephobia.
- **a11y del picker nativo vs swatches:** los swatches propios heredan la responsabilidad de a11y que el nativo daba gratis; anotarlo como costo del "go custom".

**Escalación:** si durante el spike aparece que los swatches requieren un modelo de "paletas guardadas / persistencia" (más allá de una paleta fija), **parar**: eso excede G-08 (se acerca a favoritos/preset) y necesita su propio ítem de backlog — no decidirlo dentro del spike.

**Modelo sugerido:** **Composer** (spike de investigación + redacción de nota; sin código de app). Opus solo si el usuario quiere una comparación de arquitectura más profunda.

**Commit:** `docs(params): nota spike de swatches de color (go/no-go)`

---

## Review (al cerrar sesión)
- [x] **G-09:** actualizar fila G-09 en `backlog.md` → `done` (con nota del fix atómico y números de medición); quitar/actualizar la línea de "Deuda conocida" (L432) sobre perf del picker.
- [x] **G-08:** reflejar el resultado del spike en la fila G-08 de `backlog.md`. Si **go** → abrir ítem de implementación (nuevo ID o sub-nota) y dejar G-08 como spike cerrado; si **no-go** → anotar motivo. **No** marcar `done` por el planner (lo cierra el implementer/reviewer).
- [x] Lecciones en `lessons.md` si hubo correcciones (p. ej. "commit atómico multi-canal para evitar N× compile en escrituras agrupadas"; "picker nativo `<input type=color>` no da `pointerup` fiable → coalescer por rAF, no por pointerup").
- [x] Un commit por bloque cerrado (G-09 código; G-08 doc).

## Handoff
Plan listo — **Bloque 1 (G-09)** y **Bloque 2 (G-08)**. Nuevo chat → `/hydra-implementer`.
- **G-09** = implementación real (commit atómico `updateParams`; medir antes/después; rAF solo si hace falta).
- **G-08** = **SOLO SPIKE** (nota + go/no-go; sin UI ni dependencias).
- Independientes; recomendado una sola oleada (G-09 → G-08). Branch sugerido `oleada/2026-07-31-color-followups` (o `main` si el usuario prefiere).
