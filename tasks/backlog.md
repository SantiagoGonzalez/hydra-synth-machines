# Backlog launchpad — v0

> Última actualización: 2026-07-31 (intake feedback post-G-10).

## Leyenda


| Campo         | Valores                                                 |
| ------------- | ------------------------------------------------------- |
| **Esfuerzo**  | S (<1 día), M (1–3 días), L (>3 días)                   |
| **Prioridad** | Alta / Media / Baja                                     |
| **Estado**    | `idea` · `ready` · `in-progress` · `done` · `cancelled` |


---

## Epic A — Atajos y UX inmediata


| ID   | Ítem                                    | Estado        | Esfuerzo | Prioridad | Notas                                                                    |
| ---- | --------------------------------------- | ------------- | -------- | --------- | ------------------------------------------------------------------------ |
| A-01 | `Z` → `F` para modo función             | **cancelled** | —        | —         | Descartado: clash con pad posicional `KeyF` (#12). **Mantener** `Z`**.** |
| A-02 | Desactivar pad en cadena (panel params) | done          | S–M      | Alta      | Hints bypass (B) y remove (⇧⌫); atajo real = Shift+Backspace.            |
| A-03 | Atajo **Clear all**                     | idea          | S        | Media     | Hoy solo botón en `pad-band`; origen: feedback 2026-07-31.               |
| A-04 | Insertar pad en posición del cursor     | idea          | M        | Alta      | Explorar cadena con foco → insertar pad armado en índice (no append). Propuesta: Ctrl+Shift+Q. Quedan pocos modificadores libres; spike atajos antes de implementar. |


---



## Epic B — Documentación y design system


| ID   | Ítem                  | Estado | Esfuerzo  | Prioridad | Notas                                                               |
| ---- | --------------------- | ------ | --------- | --------- | ------------------------------------------------------------------- |
| B-01 | Glosario Hydra        | done   | S         | Alta      | Tooltips subset (outputs, chain, speed) en UI.                      |
| B-02 | Design system formal  | idea   | M         | Media     | Tokens en `app/globals.css`. Doc `docs/design-system.md` por crear. |
| B-03 | Selector de temas     | idea   | M         | Media     | `data-theme` + swap CSS vars.                                       |
| B-04 | Tema doom64 (tweakcn) | idea   | S (spike) | Baja      | Evaluar contraste en pads/canvas.                                   |


---



## Epic C — Cadena: escribir, codear, live coding


| ID   | Ítem                                   | Estado | Esfuerzo | Prioridad  | Notas                                                |
| ---- | -------------------------------------- | ------ | -------- | ---------- | ---------------------------------------------------- |
| C-01 | Editar cadena como código              | idea   | L        | Media      | Editor; sync con pads.                               |
| C-02 | Live coding estilo Hydra               | idea   | L        | Media-baja | REPL vía `chain-evaluator.ts`.                       |
| C-03 | Overlay código sobre canvas            | idea   | S–M      | Media      | Toggle CSS; reutilizar `chain-preview`.              |
| C-04 | Undo/redo cadena (Ctrl+Z/Y, 5 niveles) | done   | M        | Alta       | Store + UI Ctrl/Cmd+Z y Ctrl/Cmd+Y (o ⇧Z).           |
| C-05 | Copy/paste en ChainPreview             | done   | S–M      | Alta       | Copy en compact + Ctrl/Cmd+C en zona chain (fase 0). |
| C-06 | Persistencia chain en localStorage     | idea   | S–M      | Media      | Auto-save sesión (complemento favoritos). Evaluar tradeoffs: tamaño JSON multi-output, debounce, corrupción, sync con undo. Patrón `favorites-store` (zustand persist). |
| C-07 | Preview lazy en modal favoritos        | idea   | M        | Media      | Hoy `HydraThumbnail` = img estática o texto de código. Pedido: preview visual de cada cadena (lazy eval Hydra al abrir/hover). Tradeoffs: N instancias WebGL, memoria, tiempo de apertura. |



### C-05 — Copy/paste en ChainPreview

**Estado hoy** (`components/launchpad/chain-preview.tsx`):


| Feature             | Estado                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| Botón **Copy**      | Solo si `compact={false}` — el stage usa `compact` → **sin botón visible** |
| Texto seleccionable | No (`spans` tokenizados; difícil seleccionar bloque completo)              |
| **Paste**           | No existe                                                                  |
| Atajo Ctrl+C        | No                                                                         |


**Copy — quick wins (Fase 0):**

- [ ] Mostrar botón copy también en modo `compact`
- [ ] `user-select: text` + área seleccionable (textarea read-only o `<pre>` con código plano toggle)
- [ ] Atajo `Ctrl+C` / `Cmd+C` con foco en preview (o siempre cuando `focusZone === chain`?)
- [ ] Feedback “copied” en compact (icono Check, igual que hoy)

**Paste — fases:**


| Fase   | Comportamiento                                                             | Depende de         |
| ------ | -------------------------------------------------------------------------- | ------------------ |
| **v1** | Pegar en **playground** / editor externo solo (copy out)                   | C-05 copy          |
| **v2** | Pegar en preview → **evaluar** código raw (`run()` directo, sin sync pads) | C-01 override      |
| **v3** | Pegar → **parse** a pads (round-trip)                                      | C-01 dual / parser |


**Recomendación:** ship **copy** pronto (S); **paste v2** como puerta al editor C-01, no antes — pegar sin modelo claro rompe pads↔código.

**Criterio de hecho (copy):** usuario copia `compiledCode` completo desde el preview bajo el canvas en un click o Ctrl+C.

---



## Epic D — Composición, escena y proyección


| ID   | Ítem                                           | Estado | Esfuerzo | Prioridad | Notas                                                                        |
| ---- | ---------------------------------------------- | ------ | -------- | --------- | ---------------------------------------------------------------------------- |
| D-01 | Multi-output + cross-buffer                    | done   | —        | —         | `o0`–`o3`, `src(oN)`.                                                        |
| D-02 | Editar oN mientras se proyecta oM              | idea   | M        | Alta      | `editingOutput` vs `projectedOutput`.                                        |
| D-03 | Ventana de proyección                          | ready  | M        | Alta      | `skills/projection.skill.md`.                                                |
| D-04 | Escena > canvas Hydra                          | idea   | L        | Baja      | Capa DOM alrededor del canvas.                                               |
| D-05 | Optimización para proyector                    | idea   | M        | Media     | `setResolution`, pixel ratio.                                                |
| D-06 | Dimmer / blackout proyección                   | idea   | S–M      | Alta      | Fader sobre capa DOM del canvas. Ver `docs/planning/projection-controls.md`. |
| D-07 | PNG / imagen vía Hydra `initImage` + `src(sN)` | idea   | M        | Media     | Assets en `public/` o upload. Ver `scene-composition.md`.                    |
| D-08 | Capas DOM estáticas (PNG, logos) en stage      | idea   | M        | Media     | Composición escena > canvas; con D-03.                                       |
| D-09 | Biblioteca de assets + upload                  | idea   | M–L      | Baja      | IndexedDB o carpeta proyecto.                                                |


---



## Epic E — UI componentesf (pads)


| ID   | Ítem                       | Estado | Esfuerzo | Prioridad | Notas                                              |
| ---- | -------------------------- | ------ | -------- | --------- | -------------------------------------------------- |
| E-01 | Rediseño botones pad       | idea   | S–M      | Media     | Label centrado; función más grande; fn en esquina. |
| E-02 | Consistencia design system | idea   | M        | Media     | Depende de B-02.                                   |
| E-03 | Tabs categoría pads legibles| idea   | S        | Media     | `pad-tab-bar`: texto pequeño (9px), discoverability baja. Colores y números OK; evaluar tamaño, labels, contraste. Origen: feedback 2026-07-31. |


---



## Epic G — Param panel (rediseño)

> Spec: `docs/planning/param-panel-redesign.md`


| ID   | Ítem                                        | Estado | Esfuerzo | Prioridad | Notas                                                                                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------- | ------ | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-01 | Tipografía y contraste (fn, valor, botones) | done   | S        | Alta      | param-slider + pad-param-panel (2026-07-31).                                                                                                                                                                                                                                                                          |
| G-02 | Atajo focus → input numérico                | done   | S        | Media     | `/` y `Enter` en zona params; `Escape` cancela edición.                                                                                                                                                                                                                                                               |
| G-03 | Spike faders verticales                     | idea   | M        | Alta      | Piloto aislado descartado (2026-07-31); hacer con épica G/G-06.                                                                                                                                                                                                                                                       |
| G-04 | Primitiva `ParamFader` compartida           | idea   | M        | Media     | Pad params + globals + proyección.                                                                                                                                                                                                                                                                                    |
| G-05 | Number stepper (evaluar)                    | idea   | S–M      | Baja      | Tradeoffs en planning doc.                                                                                                                                                                                                                                                                                            |
| G-06 | Migrar panel completo a vertical            | idea   | M–L      | Media     | Tras validar G-03.                                                                                                                                                                                                                                                                                                    |
| G-07 | RGB: HEX + color picker + sliders           | done   | M        | Alta      | Conviven las 3 vías; `solid` + `color`. Ver planning doc.                                                                                                                                                                                                                                                             |
| G-08 | Spike: color por **swatches / paleta**      | done   | S        | Media     | Spike cerrado 2026-07-31: **go grid custom** (0 KB). Ver `param-panel-redesign.md` §G-08. Impl → **G-10**. |
| G-09 | Perf del color picker nativo                | done   | S        | Media     | Fix 2026-07-31: `updateParams` atómico — compile por evento picker 3×→1× (medido con script store). rAF no necesario. |
| G-10 | Swatches de color (grid custom)             | done   | S        | Media     | 2026-07-31: 5 tabs (4 cromáticos + grises), 12 swatches/tab; sin picker nativo. `lib/color-palettes.ts` + `color-swatch-grid.tsx`. |
| G-11 | Curar paleta swatch (colores VJ)            | idea   | S        | Media     | Post-G-10: wedges HSL genéricos poco usable; curar colores o paleta fija VJ. Origen: feedback 2026-07-31. |
| G-12 | Discoverability tabs de paleta              | idea   | S        | Media     | Labels `R–N`/`A–V` difíciles de leer/entender; mejorar tipografía, labels completos o tooltips. Origen: feedback 2026-07-31. |
| G-13 | Randomizer + reset de color                 | idea   | S        | Media     | Botones en bloque color: random (r,g,b) + reset a defaults del pad. Complementan swatches. Origen: feedback 2026-07-31. |
| G-14 | Spike: swatches para **gradient**           | idea   | S        | Baja      | ¿Aplicable? `gradient` hoy solo `speed` en registry; color interno al shader Hydra. Evaluar tradeoffs vs extender API/color stops. Origen: feedback 2026-07-31. |


**Mantener sin cambiar:** `source-selector.tsx` (referencia de claridad).

**Feedback oleada G-07 (2026-07-31):** picker nativo aceptable como primer approach; siguiente iteración orientada a **swatches** (G-08) + investigar **perf** del nativo (G-09).

**Feedback post-G-10 (2026-07-31):** polish swatches → G-11–G-13; gradient swatches → spike G-14.

### G-14 — Spike swatches para gradient (tradeoffs)

**Estado hoy:** `gradient` en registry solo expone `speed`; el color del gradiente es interno al shader Hydra (no `colorInput`).

| Opción | Pros | Contras |
|--------|------|---------|
| **No aplicar swatches** | Cero trabajo; Hydra gradient es procedural animado | Usuario no elige colores del gradiente |
| **Extender registry** (params r/g/b o stops) | Reutiliza `RgbColorControl` / swatches | ¿Hydra `gradient()` acepta color args? Verificar API oficial antes de inventar |
| **Swatches como preset de `solid`+blend** | No toca gradient | No es gradient real |

**Criterio spike:** documentar API Hydra + recomendación go/no-go; si go, definir si es v2 registry o workaround.

---



## Epic H — Globales Hydra y synth settings

> Spec: `docs/planning/hydra-globals.md`


| ID   | Ítem                                | Estado | Esfuerzo | Prioridad | Notas                                                               |
| ---- | ----------------------------------- | ------ | -------- | --------- | ------------------------------------------------------------------- |
| H-01 | Cablear `speed` al evaluador        | done   | S        | **Alta**  | `setSpeed` en evaluador + `useEffect` en hydra-canvas (2026-07-31). |
| H-02 | Cablear BRIGHT / FEEDBACK (globals) | done   | S–M      | Alta      | Brightness CSS; feedback en compilador; amount eliminado.           |
| H-03 | Exponer `bpm` en UI                 | done   | S        | Media     | Fader BPM + `setBpm` en evaluador (patrón H-01).                    |
| H-04 | `setResolution` modo proyector      | idea   | M        | Media     | Con D-05.                                                           |


---



## Epic J — Audio reactivo

> Spec: `docs/planning/audio-reactivity.md`


| ID   | Ítem                                               | Estado | Esfuerzo | Prioridad | Notas                                                |
| ---- | -------------------------------------------------- | ------ | -------- | --------- | ---------------------------------------------------- |
| J-01 | `detectAudio` + exponer `a` en evaluador           | done   | S        | Alta      | Hoy `detectAudio: false`; `a` no está en whitelist.  |
| J-02 | UI mic on/off + permisos + show/hide FFT           | done   | S        | Alta      | `a.show()` / `a.hide()`.                             |
| J-03 | Modo **audio** en `ParamValue` + compilador + UI ♪ | done   | M        | Alta      | Paralelo a `fn(time)`; emite `() => a.fft[i]*scale`. |
| J-04 | Panel global audio (bins, scale, smooth, cutoff)   | idea   | S–M      | Media     | Mismo patrón que cablear globals (Epic H).           |
| J-05 | Sync FFT a ventana proyección                      | idea   | M        | Media     | Depende D-03; ver estrategias en planning doc.       |
| J-06 | Spike audio de sistema / OSC                       | idea   | L        | Media     | **v1 = solo mic.** Pregunta uso: (1) audio de **pestaña del navegador** → posible vía `getDisplayMedia` + audio (Chrome tab capture; UX rara). (2) **Otros programas locales** (DAW, Spotify) → **no** en browser puro; requiere loopback OS (BlackHole, VB-Audio) o Electron/Tauri. Documentar en spike; ver `audio-reactivity.md` Nivel 4. Origen: feedback 2026-07-31. |
| J-07 | Beat trigger (`onBeat`)                            | idea   | M        | Baja      | API interna Meyda; no documentada en Hydra UI.       |


**Hydra sí lo permite** — mic + `a.fft[]` en arrow functions. Launchpad aún no.

---



## Epic K — Scene bank (segundo launchpad / clip launcher)

> Spec: `docs/planning/scene-composition.md`


| ID   | Ítem                                          | Estado | Esfuerzo | Prioridad | Notas                                       |
| ---- | --------------------------------------------- | ------ | -------- | --------- | ------------------------------------------- |
| K-01 | Modelo `ScenePreset` + persistencia           | idea   | M        | Media     | Reutilizar o extender `favorites-store` v2. |
| K-02 | Grilla N×M de botones de escena               | idea   | M        | Media     | Muchos botones; layout configurable.        |
| K-03 | Toggle activar/desactivar escena (proyección) | idea   | M        | Alta      | Performance: disparar visual predefinido.   |
| K-04 | Favorito → slot scene bank                    | idea   | S        | Media     | Puente compose → show.                      |
| K-05 | Transición entre escenas (fade / dimmer)      | idea   | M        | Baja      | Con D-06.                                   |


**Idea a futuro** — no reemplaza launchpad de composición; segundo modo tipo APC/Ableton clips.

---



## Epic L — Subchains (fuente compuesta como parámetro)

> Spec: `docs/planning/subchains.md`


| ID   | Ítem                                                            | Estado | Esfuerzo | Prioridad | Notas                                       |
| ---- | --------------------------------------------------------------- | ------ | -------- | --------- | ------------------------------------------- |
| L-01 | Modelo `secondaryChain[]` + migración desde `secondarySourceId` | idea   | M        | Alta      | `ActivePad` anida mini-cadena.              |
| L-02 | `compileSubChain` en chain-compiler                             | idea   | M        | Alta      | Fragmento sin `.out()` para modulate/blend. |
| L-03 | UI: pasos add/remove/reorder en param panel                     | idea   | M        | Alta      | MVP lista; luego drawer “Edit subchain”.    |
| L-04 | Params por paso hijo (reusar sliders)                           | idea   | M        | Media     | `scope: "subchain"` en controls.            |
| L-05 | `focusZone: subchain` + atajos                                  | idea   | S–M      | Media     | Tras L-03.                                  |
| L-06 | Favoritos persisten subchain                                    | idea   | S        | Media     | Extender favorites v2.                      |
| L-07 | Preview fragmento anidado en chain-preview                      | idea   | S        | Baja      |                                             |


**Hoy:** una sola fuente (`osc`, `noise`, `src:oN`). **Hydra:** `modulate(noise().scale(), amt)` ya es válido.

**Límite v1:** profundidad 1; sin modulate/blend dentro de subchain.

---



## Epic F — Onboarding


| ID   | Ítem                        | Estado | Esfuerzo | Prioridad | Notas                           |
| ---- | --------------------------- | ------ | -------- | --------- | ------------------------------- |
| F-01 | Modal bienvenida / tutorial | idea   | M–L      | Media     | Estilo manual retro.            |
| F-02 | Contenido del tutorial      | idea   | S        | Media     | Glosario + ejemplo + shortcuts. |


---



## Epic I — Chore / repo


| ID   | Ítem                                       | Estado | Esfuerzo | Prioridad | Notas                                                 |
| ---- | ------------------------------------------ | ------ | -------- | --------- | ----------------------------------------------------- |
| I-01 | `.gitignore`: sacar docs y skills del repo | idea   | M        | Media     | Repo = solo código app. Ver alcance abajo.            |
| I-02 | Favicon e iconos originales                | done   | S        | Media     | 2026-07-31: `icon-hydra-3.svg` activo (swap a `-2` en `app/layout.tsx`). Assets v0 PNG reemplazados en metadata. |




### I-02 — Favicon

**Hoy:** `icon-hydra-3.svg` en `app/layout.tsx` (`APP_ICON_PATH`). Alternativas en `public/icon-hydra-2.svg`, `icon-hydra-1.svg`. `public/icon.svg` sincronizado con propuesta 3.

**Entregable:**

- Icono propio del proyecto (SVG + PNG 32×32 + apple-touch)
- Actualizar `metadata.icons` en `app/layout.tsx`
- Opcional: `favicon.ico` para compatibilidad legacy

**Esfuerzo:** S — quick win independiente del resto del backlog.

### I-01 — Detalle

**Objetivo:** el repositorio versiona únicamente código de la aplicación; documentación y skills en `.md` quedan fuera del tracking de git.

**Alcance propuesto a ignorar / dejar de trackear:**


| Ruta                              | Contenido                                             |
| --------------------------------- | ----------------------------------------------------- |
| `docs/`                           | hydra-skills-index, planning, glosario, vj-synth-*.md |
| `skills/`                         | `*.skill.md`, skills-index                            |
| `tasks/`                          | backlog, lessons, README de planificación             |
| `portable-skill-system/`          | sistema de skills portable                            |
| `.github/copilot-instructions.md` | instrucciones agente (evaluar)                        |


**Pasos técnicos (no solo** `.gitignore`**):**

1. Añadir patrones a `.gitignore` (`docs/`, `skills/`, `tasks/`, etc.).
2. `git rm -r --cached` en rutas ya trackeadas (`.gitignore` no saca archivos del índice).
3. Actualizar `.cursorrules` / referencias que apuntan a `docs/` y `skills/`.
4. Decidir si queda un `README.md` mínimo en raíz (setup, scripts) — **decisión abierta**.

**Impacto / tensiones:**

- Contradice épicas **B**, **F** y planning en `docs/planning/` si la doc solo vive en git.
- Alternativa: docs en wiki, Notion, repo `hydra-synth-docs`, o solo local.
- Los agentes de Cursor pierden skills versionadas en repo — evaluar si es deseable.

**Criterio de hecho:**

- `git status` sin `.md` de docs/skills/tasks en el árbol versionado (salvo excepciones acordadas).
- Build y app siguen funcionando sin imports a esos paths.

---



## Roadmap sugerido



### Fase 0 — Quick wins

- [x] A-02
- [x] G-01, G-02
- [x] H-01 (speed)
- [x] H-02 (brightness CSS + feedback + sin amount)
- [x] H-03 (bpm)
- [x] C-04 (store + UI Ctrl+Z)
- [x] **C-05** copy en ChainPreview (compact + selección)
- [x] **I-02** favicon original (`icon-hydra-3`; probar `-2` en layout)
- [x] B-01 tooltips (subset)



### Fase 0b — Param panel color (Epic G)

- [x] G-07 HEX + picker + sliders (`solid`, `color`)
- [x] G-08 spike swatches / paleta (lib ligera vs custom) — **go grid custom**
- [x] G-09 perf color picker nativo (`updateParams` atómico, 3×→1× compile)
- [x] G-10 swatches grid custom (5 tabs × 12 colores)



### Fase 0c — Audio MVP (Epic J)

- [x] J-01, J-02 (motor + mic UI)
- [x] J-03 (modo ♪ en params) — puede solaparse con G



### Fase 1 — Core VJ

- [ ] D-02, D-03, D-06
- [ ] C-03
- [ ] D-05, H-04
- [ ] G-03 spike faders verticales (piloto descartado; pendiente con G-06)
- [ ] D-07 PNG vía Hydra (opcional antes de D-08)



### Fase 2 — Polish + subchains

- [ ] G-04, G-06
- [ ] H-04
- [ ] B-02, B-03
- [ ] E-01, E-02
- [ ] F-01, F-02
- [ ] L-01 → L-04 (subchains MVP)



### Fase 3 — Scene bank y composición avanzada

- [ ] K-01 → K-04 (scene bank MVP)
- [ ] D-08, D-09 (capas DOM + biblioteca assets)
- [ ] K-05 transiciones
- [ ] L-05 → L-07 (subchain polish)



### Fase 4 — Repo (opcional)

- [ ] I-01 gitignore + untrack docs/skills (solo si se confirma destino de la documentación)

---



## Decisiones cerradas


| Fecha      | Decisión                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-29 | **A-01 cancelado** — mantener `Z` para modo función (clash con pad `F`).                                                                                                  |
| 2026-07-31 | **#9 G-07:** HEX solo `#RRGGBB` en v1 (sin alpha); canal `a` de `solid` queda en slider. Picker/HEX en `color()` (multiplier) clampa a [0,1]; valores >1 solo por slider. |
| 2026-07-31 | **#10 J audio:** mic **opt-in** (default off); bins default **4** (`numBins` de `_initAudio`); v1 solo micrófono (system audio = J-06).                                   |




## Decisiones abiertas


| #   | Pregunta                                                         | Opciones / default           |
| --- | ---------------------------------------------------------------- | ---------------------------- |
| 1   | A-02: bypass vs quitar cadena                                    | —                            |
| 2   | D-02: output proyectado fijo o elegible                          | —                            |
| 3   | D-06: dimmer solo en proyección o también stage                  | Ver `projection-controls.md` |
| 4   | G-03: faders verticales en todo el panel                         | Spike primero                |
| 5   | H-02: brightness = CSS vs `.brightness()`                        | —                            |
| 6   | C-01: editor por output o multi-buffer                           | —                            |
| 7   | F-01: tutorial obligatorio o opt-in                              | —                            |
| 8   | I-01: ¿dónde vive la doc fuera del repo? ¿README mínimo en raíz? | —                            |
| 11  | K: ¿una escena activa o varias en paralelo?                      | Ver `scene-composition.md`   |
| 12  | D-07 vs D-08: ¿PNG en Hydra o capa DOM primero?                  | —                            |
| 13  | L: ¿drawer vs inline? ¿modulate dentro de subchain en v2?        | Ver `subchains.md`           |
| 14  | J: ¿audio de pestaña del navegador en v2? ¿loopback OS fuera de scope? | Mic v1; tab capture vs app nativa — ver J-06 spike |


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
- **Swatches de color (G-08/G-10):** spike cerrado go grid custom; picker nativo perf resuelto en G-09 (`updateParams` atómico)

