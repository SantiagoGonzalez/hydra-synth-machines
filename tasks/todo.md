# Todo — sesión 2026-07-31 (oleada Fase 0b + 0c)

> Plan: hydra-planner · [`priorizacion.md`](./priorizacion.md) · [`backlog.md`](./backlog.md)
> **Estado:** listo para implementar (hydra-implementer). Double-check con lectura real de código + fuente de `hydra-synth@1.4.0`.

---

## Objetivo del día

Cerrar **Fase 0b** (G-07 RGB: HEX + picker + sliders) y **Fase 0c** (audio MVP: motor + mic UI + modo ♪ en params). Bloque 2 desbloquea al 3. Un commit por bloque, chat nuevo por bloque (o modo oleada 1→2→3 con commit entre cada uno).

> **Notas de double-check (hallazgos que cambian el plan):**
> - **G-07:** hoy **no existe** detección de grupos RGB. `pad-param-panel.tsx` (L96–139) mapea `definition.params` 1:1 a `SingleParamSlider`. Hay que **introducir** la metadata `colorInput` en el registry y el render condicional; no hay patrón previo que imitar salvo `source-selector` (claridad).
> - **J-01 (motor):** verificado en `node_modules/hydra-synth/src/hydra-synth.js`: `this.detectAudio` es **mutable** (L43), `_initAudio()` (L212) crea `this.synth.a = new Audio({numBins:4, parentEl: this.canvas.parentNode})`, y `tick()` (L427) hace `if(this.detectAudio===true) this.synth.a.tick()`. → **Se puede encender audio sin recrear la instancia Hydra** (lazy `_initAudio()` + flag). `_initAudio` es método interno (underscore): citarlo, no inventarlo; riesgo de cambio en upgrade.
> - **J-02 (mic/FFT):** `Audio` (`src/lib/audio.js`) pide `getUserMedia({audio:true})` **en el constructor** (L48–49) → el prompt de permiso ocurre al primer `_initAudio()` (perfecto para opt-in). Anexa un canvas `100×80` abajo-derecha (L41); `show()/hide()` togglean `display` (L167–176). `fft` arranca en `[0,0,0,0]` (L142) → `a.fft[i]` es seguro aun sin datos. **No hay método de teardown del stream** (limitación, ver Bloque 2 Riesgos).
> - **J-03:** patrón a imitar = `emitParamExpression` rama `fn` (`lib/param-value.ts` L53–62) que emite `({time}) => ...`. Favoritos serializan `params: Record<string, ParamValue>` como JSON plano; el modo audio persiste **solo si** `normalizeParamValue` (L37–41) lo reconoce al restaurar.
> - **Teclado:** `isEditableTarget` (`hooks/use-launchpad-keys.ts` L69–74) ya excluye `INPUT` (salvo `type="range"`) y `SELECT` → los nuevos inputs HEX (`type="text"`) y picker (`type="color"`) quedan protegidos sin tocar el hook.
> - Se sobrescribe el `todo.md` anterior (oleada G-02/C-04/B-01/H-02 → **done**).

---

## Bloque 1 — G-07 · RGB: HEX + color picker + sliders

**Decisión:** modelar el grupo de color como **metadata declarativa** en el registry (`colorInput`) y renderizar un bloque compuesto nuevo `rgb-color-control.tsx` **encima** de los sliders r/g/b/a existentes, con `pad.params` como **única fuente de verdad**. HEX y picker escriben los tres canales vía `updateParam` (uno por canal); los sliders siguen bindeados a los mismos params → sincronización automática por re-render. Nombre del componente: **`components/launchpad/rgb-color-control.tsx`** (coincide con la spec `param-panel-redesign.md` L141). Utilidades de conversión en **`lib/color-param.ts`** (kebab-case).
**Descartado:**
- Detección por nombres de param (heurística `r/g/b`) en el componente: frágil (colisiona con `shift`, que tiene r/g/b pero **no** es sRGB). Se usa metadata explícita en el registry → `shift` no la declara y no muestra bloque color.
- Modo excluyente (picker **o** sliders): la spec pide que **convivan** editando el mismo estado. No se hace toggle.
- Alpha en HEX (`#RRGGBBAA`) y `a` en el picker: **fuera de v1** (decisión #9). El canal `a` de `solid` queda como slider normal debajo.
- fn/audio por canal en el bloque color: fase posterior; v1 usa `scalarPreview` para el swatch y **sobrescribe a número** si el canal estaba en fn/audio al editar HEX/picker (spec criterio 3).
**Archivos (rutas confirmadas):**
- `lib/hydra-registry.ts` — extender `HydraFunctionDef` (L15–23) con `colorInput?: { channels: ("r"|"g"|"b")[]; alphaParam?: "a"; mode: "unit" | "multiplier" }`. Setear en `solid` (L78–88): `{ channels:["r","g","b"], alphaParam:"a", mode:"unit" }`. En `color` (L173–182): `{ channels:["r","g","b"], mode:"multiplier" }`. **No** tocar `shift`.
- `lib/color-param.ts` **(nuevo)** — `rgbToHex(r,g,b)` (canales 0–1 → `#RRGGBB`), `hexToRgb(hex)` (→ `{r,g,b}` en 0–1, valida `#RGB` y `#RRGGBB`, retorna `null` si inválido). En `mode:"multiplier"` el picker **clampa** a [0,1] (decisión #9); si algún canal >1, `rgbToHex` clampa para el swatch (hint opcional "clamped").
- `components/launchpad/rgb-color-control.tsx` **(nuevo)** — props: `channels`, `mode`, valores actuales (números vía `scalarPreview`), `onChannelChange(channel, value)`. Render: swatch + `<input type="text">` HEX (draft + commit en Enter/blur, patrón de `param-slider.tsx` L119–140) + `<input type="color">`. Emite `updateParam` por canal.
- `components/launchpad/pad-param-panel.tsx` — dentro de `hasMainParams` (L96), **antes** del `.map` de sliders (L98): si `definition.colorInput`, renderizar `<RgbColorControl>` conectado a `updateParam(pad.instanceId, ch, val)`. Los sliders r/g/b/a se siguen renderizando igual (sin regresión).
- (doc) `skills/param-panel.skill.md` — anotar el contrato `colorInput` (opcional, si el implementer tiene margen).
**Pasos:**
- [x] Agregar tipo `colorInput` a `HydraFunctionDef` y setearlo en `solid` y `color`.
- [x] Crear `lib/color-param.ts` con `rgbToHex`/`hexToRgb` + validación + clamp multiplier.
- [x] Crear `rgb-color-control.tsx` (swatch + HEX + picker; draft/commit; clamp).
- [x] Render condicional en `pad-param-panel.tsx` (bloque arriba de sliders).
- [x] Verificar sync bidireccional slider ↔ HEX ↔ picker en `solid` y `color`.
**Criterio de hecho:**
- [x] En `solid` y `color`: HEX, picker nativo y sliders muestran **el mismo color** y quedan sincronizados.
- [x] Editar HEX/picker actualiza el canvas vía `updateParam` en los 3 canales.
- [x] `color` (multiplier): picker/HEX clampan a [0,1]; valores >1 solo por slider (sin romper el swatch).
- [x] Sliders por canal siguen funcionando (sin regresión); `a` de `solid` intacto.
- [x] `shift` **no** muestra bloque HEX/picker.
**Tests manuales:**
1. Activar pad `solid` → abrir params → escribir `#44ff88` + Enter: swatch, picker y sliders r/g/b se actualizan y el canvas cambia.
2. Mover slider `g` en `solid`: HEX y picker reflejan el nuevo valor al instante.
3. Activar pad `color` → subir slider `r` a 1.8: el swatch muestra clamp (no rompe); bajar por picker vuelve a ≤1.
4. Activar pad `shift`: confirmar que **no** aparece el bloque color.
**Riesgos:**
- Canal en modo `fn`/`audio` (objeto, no número): el swatch usa `scalarPreview`; editar HEX/picker sobrescribe a número (pérdida silenciosa del fn de ese canal) → aceptable v1, documentar en tooltip/hint.
- Redondeo 0–1 ↔ 0–255 puede "saltar" el último dígito del slider (`step 0.01`) — usar `Math.round` consistente en `color-param.ts`.
- `<input type="color">` no soporta alpha → alpha de `solid` queda solo en slider (esperado, decisión #9).
- Foco/atajos: confirmar que HEX y picker no roban `1–5`/`Z` (ya cubierto por `isEditableTarget`, pero test rápido).
**Escalación:** si el sync entre tres vías genera loops de render o el draft de HEX pelea con el re-render del store, **parar y re-planear** el modelo de estado (posible draft local en el componente vs commit atómico). No introducir un store de color separado sin avisar.
**Modelo sugerido:** **Opus** (M; componente nuevo + metadata + conversión con edge cases de clamp).
**Commit:** `feat(params): agrega HEX y color picker para solid y color`

---

## Bloque 2 — J-01 + J-02 · Motor audio + mic UI

**Decisión:** encender audio **sin recrear** la instancia Hydra: `createHydraEvaluator` mantiene refs a `hydra` y expone `setAudioEnabled(enabled)` y `setFftVisible(visible)`. `setAudioEnabled(true)` hace **lazy init** (`if (!synth.a) hydra._initAudio()`), setea `hydra.detectAudio = true` y **re-ejecuta el código actual** (`run(lastCode, true)`) para rebindear `a`; `setAudioEnabled(false)` setea `detectAudio = false` y `synth.a?.hide()`. Se agrega `a: s.a` a la whitelist de `buildBoundFunctions`. Estado UI en `chain-store` (`audioEnabled`, `fftVisible`) cableado desde `hydra-canvas.tsx` con el **mismo patrón que `setSpeed`/`setBpm`** (useEffect por dependencia). Toggle mic + botón FFT en un componente nuevo **`audio-controls.tsx`** dentro de `param-panel.tsx` (junto a `GlobalFaders`).
**Descartado:**
- **Recrear el evaluador** al togglear mic (opción del spec Nivel 1): descarta el contexto WebGL, reflash y complejidad de re-hidratar `compiledCode`. La vía lazy-init es más limpia y ya está soportada por el runtime.
- Meter el toggle dentro de `global-faders.tsx`: ese componente es de **faders** (`type=range`); un toggle mic es un botón → componente propio para no mezclar responsabilidades.
- Incluir `audioEnabled`/`fftVisible` en el **snapshot de undo** (`ChainSnapshot`): un undo no debe re-disparar el prompt de permisos. Quedan **fuera** de `captureSnapshot`.
- `setBins/scale/smooth/cutoff` en UI: es **J-04**, fuera de scope (queda `numBins:4` de `_initAudio`).
**Archivos (rutas confirmadas):**
- `lib/chain-evaluator.ts`
  - `buildBoundFunctions` (L26–97): agregar `a: s.a`.
  - Guardar `hydra` en el closure (ya existe, L111) y trackear `let lastCode = EMPTY_CODE` actualizado en `run()`.
  - Interfaz `HydraEvaluator` (L10–23): añadir `setAudioEnabled(enabled: boolean): void` y `setFftVisible(visible: boolean): void`.
  - Implementar: `setAudioEnabled` → `if (enabled) { if (!synth.a) hydra._initAudio(); hydra.detectAudio = true; run(lastCode, true) } else { hydra.detectAudio = false; synth.a?.hide() }`. `setFftVisible` → `enabled ? synth.a?.show() : synth.a?.hide()` (con guard si `!synth.a`).
- `stores/chain-store.ts`
  - Estado: `audioEnabled: boolean` (default `false`), `fftVisible: boolean` (default `false`).
  - Acciones: `setAudioEnabled(v)`, `setFftVisible(v)` (set simple; **no** `pushHistory`).
  - **No** agregarlos a `captureSnapshot` (L57–63) ni a `restoreSnapshot`.
- `components/launchpad/hydra-canvas.tsx` — dos `useEffect` nuevos (patrón L83–91): `[audioEnabled, isReady]` → `evaluatorRef.current?.setAudioEnabled(audioEnabled)`; `[fftVisible, isReady]` → `setFftVisible(fftVisible)`. Leer `audioEnabled`/`fftVisible` del store.
- `components/launchpad/audio-controls.tsx` **(nuevo)** — botón "Mic" (toggle `audioEnabled`) con indicador activo (privacidad) y botón "FFT" (toggle `fftVisible`, deshabilitado si `!audioEnabled`).
- `components/launchpad/param-panel.tsx` — renderizar `<AudioControls />` (antes o después de `<GlobalFaders />`, L69).
**Pasos:**
- [x] Whitelist: `a: s.a` en `buildBoundFunctions` + track `lastCode` en `run()`.
- [x] Métodos `setAudioEnabled`/`setFftVisible` en el evaluador (lazy `_initAudio`, flag, re-run).
- [x] Estado `audioEnabled`/`fftVisible` + acciones en `chain-store` (fuera de undo).
- [x] `useEffect` de cableado en `hydra-canvas.tsx`.
- [x] `audio-controls.tsx` + montaje en `param-panel.tsx`.
- [x] Probar con favorito/código `osc(10,0.1,()=>a.fft[0]*4).out()`.
**Criterio de hecho:**
- [x] Mic **opt-in**: sin togglear, **no** hay pedido de permisos ni stream (default #10).
- [x] Con mic activo, `a.fft` está disponible en el evaluador y una cadena con `()=>a.fft[0]*4` reacciona.
- [x] Botón FFT muestra/oculta el visualizador (`a.show()/hide()`).
- [x] Denegar permiso **no rompe** el canvas (sigue renderizando; sin datos FFT).
**Tests manuales:**
1. Cargar la app: DevTools → confirmar que **no** hay prompt de mic hasta tocar el toggle.
2. Activar "Mic" → aceptar permiso → activar "FFT": aparece el meter abajo-derecha y responde al sonido.
3. Pegar/activar un patch con `()=>a.fft[0]` (o favorito) hablando/con música: el visual reacciona.
4. Recargar, activar "Mic" y **denegar**: el canvas sigue vivo; el meter no muestra datos (sin crash).
5. Undo/redo con mic activo: **no** re-dispara el prompt de permisos.
**Riesgos:**
- **Teardown de stream:** `Audio` no expone stop; al desactivar mic el stream **sigue vivo** (indicador del SO queda encendido). v1: solo `detectAudio=false` + `hide()`. Teardown real (`synth.a.stream?.getTracks().forEach(t=>t.stop())`) queda para J-04/polish — anotar como limitación conocida.
- **Re-init duplicado:** llamar `_initAudio()` más de una vez anexa **otro** canvas (audio.js L41) y crea otro `AudioContext` (leak). El guard `if (!synth.a)` lo evita → **no** re-init en cada toggle.
- Detección de permiso denegado: `Audio` no expone callback de error (solo `console.log`, L69). v1 no puede reflejar "denegado" en la UI con precisión → toggle queda optimista. **Gap** documentado.
- `_initAudio` es API interna de `hydra-synth` (underscore): un upgrade podría romperlo. Fijar expectativa en `audio-reactivity.md`.
- El canvas del meter puede aparecer aunque `isDrawing=false` (elemento anexado, transparente): si molesta, llamar `synth.a.hide()` inmediatamente tras `_initAudio()`.
**Escalación:** si `hydra._initAudio()` no existe o falla en `1.4.0` (o el rebind de `a` no surte efecto tras `run(lastCode, true)`), **parar** y evaluar recrear el evaluador con `detectAudio:true` como plan B (avisar antes de cambiar el enfoque). No forzar `makeGlobal`.
**Modelo sugerido:** **Composer** (S+S; cambios acotados siguiendo patrones existentes).
**Commit:** `feat(audio): habilita microfono opt-in y visualizador fft`

---

## Bloque 3 — J-03 · Modo audio ♪ en `ParamValue`

**Decisión:** extender `ParamValue` con una tercera variante `{ kind: "audio", bin, scale, offset }`, **paralela** a `fn`, imitando el pipeline de `fn(time)`: el compilador delega en `emitParamExpression`, que emite una arrow **guardada** `() => (a && a.fft ? a.fft[bin] : 0) * scale + offset`. El guard degrada a valor base (offset) sin mic/`a` sin lanzar error. UI: tercer botón **♪** en `SingleParamSlider` junto a `#`/`fn`, con selector de `bin` (0…3) + sliders `scale`/`offset` (layout espejo del modo fn). Bins fijos en **4** (constante `DEFAULT_AUDIO_BINS`, coincide con `numBins:4` de `_initAudio`).
**Descartado:**
- Emitir `a.fft[bin]` **sin guard**: si `a`/`fft` no existen (mic off) rompe la cadena. Se emite siempre con guard (spec criterio: degrada a valor base).
- Cambiar la firma del compilador: `chain-compiler.ts` ya delega en `emitParamExpression` (L37, L52, L71–72) → **no** necesita tocarse.
- Modo ♪ por **teclado** (3-way `#`/`fn`/`♪`): el toggle keyboard actual (`toggleFocusedParamMode`, chain-store L419–458) es 2-way #↔fn. v1: ♪ **solo por UI**; el atajo sigue #↔fn. Extender el keyboard queda para polish.
- Selector dinámico de bins según `a.setBins`: es J-04. v1 fija 4.
**Archivos (rutas confirmadas):**
- `lib/param-value.ts`
  - `interface ParamAudioValue { kind: "audio"; bin: number; scale: number; offset: number }`; `export type ParamValue = number | ParamFnValue | ParamAudioValue`.
  - `DEFAULT_AUDIO_VALUE` (`{ kind:"audio", bin:0, scale:1, offset:0 }`) y `DEFAULT_AUDIO_BINS = 4`.
  - `isParamAudio(v)` (guard).
  - `scalarPreview` (L31–34): rama audio → `return value.offset`.
  - `normalizeParamValue` (L37–41): reconocer `isParamAudio` y devolver tal cual (clave para favoritos).
  - `emitParamExpression` (L44–63): rama audio → `` `() => (a && a.fft ? a.fft[${bin}] : 0) * ${scale} + ${offset}` `` con redondeo a 4 decimales en `scale`/`offset` (patrón L50–52).
- `lib/launchpad-controls.ts`
  - `paramControl` value (L45): `isParamFn(value) ? value.offset : (isParamAudio(value) ? value.offset : value)` (evita `[object Object]`).
  - `buildControlList`: v1 **no** agrega sub-controles de bin/scale al keyboard (solo el control base con offset). Anotar si se decide exponerlos.
- `components/launchpad/param-slider.tsx`
  - Botón **♪** junto a `#`/`fn` (L105–142). Toggle: fijo→audio usa `offset = valor actual`.
  - Render del modo audio (espejo del bloque fn L145–202): botones de `bin` 0…`DEFAULT_AUDIO_BINS-1` + sliders `scale` (rango tipo `FN_FIELD_RANGES.amp`) y `offset`.
- `stores/chain-store.ts`
  - `restoreFromFavorite` (L845–857): ya usa `normalizeParamValue`; con el guard nuevo, el modo audio persiste. Verificar que `p.params` audio pase el `Object.entries` sin romper.
  - Auditar `setControlNormalized` (L365–417: `typeof current !== "number"` ya cubre audio → set `.offset` OK), `toggleFocusedParamMode` (L419–458: rama `typeof current === "number"` → a fn; si `current` es audio, hoy lo pasaría a `.offset` número — aceptable, el atajo saca de ♪ a escalar), `cycleFocusedFnShape` (L485–516: `isParamFn` guard → no-op en audio, OK).
- `lib/chain-compiler.ts` — **sin cambios** (delega en `emitParamExpression`).
**Pasos:**
- [x] Extender `param-value.ts` (tipo, guard, defaults, `scalarPreview`, `normalizeParamValue`, `emitParamExpression`).
- [x] Ajustar `paramControl` en `launchpad-controls.ts` (offset de audio).
- [x] UI ♪ en `param-slider.tsx` (toggle + bin + scale/offset).
- [x] Auditar acciones del store que ramifican por tipo (lista arriba).
- [x] Probar compilación, reacción en vivo y serialización de favorito.
**Criterio de hecho:**
- [x] Cualquier param numérico alterna fijo / fn / **♪** (bin + scale + offset).
- [x] Con mic (Bloque 2) la cadena reacciona; **sin** mic el modo ♪ degrada a `offset` sin error.
- [x] Favoritos serializan el modo audio y **favoritos viejos** (número/fn) siguen restaurando bien.
- [x] `chain-preview`/`compiledCode` muestran la arrow `() => (a && a.fft ? a.fft[i] : 0)*s+o`.
**Tests manuales:**
1. Pad `osc` → param `frequency` → botón ♪ → bin 0, scale 40, offset 10: con mic activo el visual pulsa con los graves.
2. Desactivar mic: la cadena no rompe (frequency ≈ offset).
3. Guardar favorito con un param en ♪ → recargar → restaurar: el param vuelve en modo ♪ con bin/scale/offset correctos.
4. Restaurar un favorito **viejo** (sin audio): sin errores, params fijos/fn intactos.
5. Con foco en un control ♪, `#`/`fn` por teclado: no crashea (sale de ♪ a escalar).
**Riesgos:**
- `paramControl` sin la rama audio → `value` sería objeto → NaN en navegación por teclado. Cubierto arriba; **verificar**.
- Si J-03 se implementa sin Bloque 2 (`a` no está en whitelist), la arrow lanza `ReferenceError` por `a` no declarado. **Dependencia dura de Bloque 2** — no mergear J-03 solo.
- `bin` fuera de rango si en el futuro se bajan los bins (<4): el guard `a.fft[bin]` devuelve `undefined` → `undefined*scale = NaN`. Endurecer: `(a && a.fft && a.fft[bin] != null ? a.fft[bin] : 0)`.
- UI: el modo audio agrega altura al panel (como fn); aceptable, no migrar a vertical acá (eso es G-06).
**Escalación:** si Hydra **no** invoca la arrow por frame para ese parámetro (algún arg posicional que no acepta función), **parar**: verificar en `docs/hydra-skills-index/` / runtime antes de forzar. Lección existente: *"run() no es por frame"* — el que anima es la arrow, no un re-`run`.
**Modelo sugerido:** **Opus** (M; toca tipos núcleo, compilador, store y UI; edge cases de serialización).
**Commit:** `feat(audio): agrega modo audio por parametro con bin y scale`

---

## Review (al cerrar sesión)
- [ ] Actualizar estados en `backlog.md`: G-07, J-01, J-02, J-03 → `done` (o `in-progress` si parcial).
- [ ] Mover decisiones #9 y #10 de "abiertas" a **Decisiones** con fecha en `backlog.md`.
- [ ] Lecciones en `lessons.md` si hubo correcciones (ej. lazy `_initAudio`, guard de `a.fft`, teardown de stream).
- [ ] Actualizar `docs/planning/audio-reactivity.md` (estado real: motor on, modo ♪ hecho; teardown pendiente) y `docs/hydra-skills-index/audio/audio.md` (quitar TODO de indexado FFT si se confirma).
- [ ] Un commit por bloque cerrado.

## Handoff
Plan listo — bloques 1–3. Nuevo chat → `/hydra-implementer` → un bloque por sesión (o modo oleada 1→2→3 con commit entre cada uno). **Bloque 3 depende del Bloque 2** (no mergear J-03 sin `a` en whitelist).
