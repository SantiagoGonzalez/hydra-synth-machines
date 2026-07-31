# Globales Hydra — estado actual y gaps

> Estado: **planificación** + diagnóstico. H-01 (`speed`) **done** (2026-07-31). BRIGHT/DECAY/AMOUNT siguen sin cablear.

---

## Síntoma reportado (histórico)

Al mover **SPEED / BRIGHT / DECAY / AMOUNT** en el param panel, la imagen no cambiaba (excepto SPEED tras H-01).

## Causa (confirmada en código)

| Capa | Estado |
|------|--------|
| UI `global-faders.tsx` | OK — actualiza store |
| `chain-store.globalFaders` | OK — `setGlobalFader` |
| Navegación teclado | OK — en `buildControlList` |
| `chain-compiler.ts` | **No lee** `globalFaders` (salvo `speed` vía evaluador) |
| `chain-evaluator.ts` | `speed` asignado en `run()` (H-01); `bpm` expuesto pero sin UI |

Comentario en código: `global-faders.tsx` línea 3 — *“sin cablear al compilador aún”* (válido para BRIGHT/DECAY/AMOUNT).

---

## Faders actuales vs Hydra real

| Fader UI (`lib/global-faders.ts`) | Rango / default | ¿Existe en Hydra? | Recomendación H-02 (default propuesto) |
|-----------------------------------|-----------------|-------------------|----------------------------------------|
| `speed` | 0–3, def **1** | Sí — global `speed` | **Done (H-01):** mecanismo A — asignar en evaluador antes de `run()` |
| `brightness` | −1–1, def **0** | No es global — función `.brightness()` | **Default #1:** post-process **CSS** `filter: brightness()` sobre el canvas/stage (master dim sin tocar `compiledCode`). Alternativa: pad implícito `.brightness(v).out()` al final — más invasivo en compilador |
| `decay` | 0–1, def **0** | No es global — feedback vía `src(oN).blend(oN, t)` | **Default #2:** renombrar label a **FEEDBACK**; cablear solo si la cadena activa usa `src(oN)`; si no hay feedback, **no-op documentado** hasta D-06 (dimmer DOM) |
| `amount` | 0–1, def **0.5** | Ambiguo (no hay global Hydra) | **Default #3:** **eliminar del panel** en v1; si se mantiene, semántica = cantidad por defecto de `modulate`/`blend` en pads nuevos (requiere ticket H-02b) |

### Detalle por fader (implementable)

#### `brightness` (BRIGHT)

- **Hydra real:** `.brightness(amount)` es transform de **color** en cadena, rango típico −1…1 (ver `docs/hydra-skills-index/color/brightness.md`).
- **No** existe `brightness` global en synth settings.
- **Recomendación (ticket H-02b):** CSS master en `stage-column` / canvas wrapper:
  - Mapeo UI −1…1 → CSS `brightness()`: `1 + value` (0 → negro, 1 → normal, 2 → doble brillo).
  - Ventaja: no altera `compiledCode` ni proyección de código; serializable como setting de escena.
- **Alternativa descartada como default:** inyectar `.brightness(v)` al compilar — acopla globals al compiler y complica multi-output.

#### `decay` (DECAY)

- **Hydra real:** “decay” en VJ = **feedback damping** con `blend(oN, t)` donde `t < 1` (ver `docs/hydra-skills-index/blend/blend.md`, `sources/src.md`).
- **Recomendación (ticket H-02b):**
  1. Renombrar fader a **FEEDBACK** en UI.
  2. Detectar si `editingOutput` (o output proyectado) tiene pad `src:oN` activo.
  3. Si sí: inyectar o escalar `blend` amount en el loop (mecanismo B o C híbrido).
  4. Si no: no-op + tooltip “requires feedback (`src`) in chain”.
- **Gap:** no hay API Hydra global de decay; cualquier cableado es convención de app.

#### `amount` (AMOUNT)

- **Problema:** label no mapea a ningún global Hydra ni a un único parámetro de cadena.
- **Recomendación (ticket H-02b):** **quitar del panel** hasta definir producto (menos confusión que un fader sin efecto).
- **Si se conserva:** documentar como “default modulate blend amount for new pads” — impacta solo pads creados después del cambio; no retroactivo.

**Acción mínima completada (H-01):** `speed` cableado en evaluador leyendo del store.

---

## Configuración Hydra no expuesta en launchpad

Referencia: `docs/hydra-skills-index/synth-settings/synth-settings.md`

| API | En evaluador | En UI launchpad | Notas |
|-----|--------------|-----------------|-------|
| `speed` | Exposed | Fader (**efecto visible**, H-01 done) | — |
| `bpm` | Exposed | **No** | Tempo-sync; útil para fn + `time` |
| `time` | Exposed (read) | — | Solo lectura |
| `mouse` | Exposed | — | Interactividad |
| `width`, `height` | Exposed | — | Derivados del canvas |
| `setResolution(w,h)` | Exposed | **No** | Proyector — ver D-05 |
| `setFunction` | Exposed | **No** | Avanzado / live coding |
| `hush()` | En dispose/run | Parcial | Reset estructural |
| `render()` / `render(oN)` | Sí | vía `gridView` / output | OK |
| `update()` | No en whitelist | **No** | TODO verificar necesidad |

### Externas (no prioridad launchpad)

- `s0`–`s3`, `initCam`, `initVideo`, etc. — `docs/hydra-skills-index/external-sources/`
- Audio `fft` — `docs/hydra-skills-index/audio/audio.md`

---

## Opciones de arquitectura (H-02)

### A — Imperativo en evaluador (recomendado para `speed`, `bpm`)

```ts
// Antes de evalFn(code)
synth.speed = globalFaders.speed
synth.bpm = globalFaders.bpm
```

- No ensucia `compiledCode`
- Serializable aparte para proyección (`ProjectionMessage` extiende settings)

### B — Prefijo en código compilado

```js
speed = 1.5
bpm = 120
osc(10).out()
```

- Proyección recibe todo en un string
- Riesgo si usuario edita código manualmente (C-01)

### C — Híbridos por fader

| Fader | Mecanismo |
|-------|-----------|
| speed, bpm | A — globals Hydra |
| brightness (master) | CSS overlay o uniform en post |
| decay | Solo si chain usa feedback — inyectar `blend` amount |

---

## Backlog relacionado

| ID | Ítem | Estado |
|----|------|--------|
| H-01 | Cablear `speed` (y validar efecto visible) | **done** (2026-07-31) |
| H-02 | Auditar labels: brightness/decay/amount vs semántica Hydra | **doc done** — implementación en H-02b |
| H-03 | Exponer `bpm` en globals o sección “Synth” | idea |
| H-04 | `setResolution` para modo proyector (con D-05) | idea |
| D-06 | Dimmer DOM (no es global Hydra) — ver `projection-controls.md` | idea |

---

## Criterios de aceptación (H-01) — cumplidos

1. Mover fader **SPEED** cambia velocidad de animaciones que usan `time` / fn. ✅
2. Valor persiste en store durante la sesión (opcional: favoritos v3). ✅ sesión
3. Ventana de proyección recibe los mismos globals cuando exista D-03. ⏳ pendiente D-03

---

## Decisiones abiertas

| # | Pregunta | Default propuesto (H-02) | Estado |
|---|----------|--------------------------|--------|
| 1 | ¿`brightness` global = CSS master o `.brightness()` en toda la salida? | **CSS master** en stage/canvas (`filter: brightness(1 + v)`) | Cerrada en doc; implementar en H-02b |
| 2 | ¿Eliminar o renombrar DECAY/AMOUNT hasta tener semántica clara? | **DECAY → FEEDBACK** (solo con `src`); **AMOUNT → eliminar** del panel v1 | Cerrada en doc; implementar en H-02b |
| 3 | ¿BPM junto a globals o en panel “Synth settings” separado? | **Panel “Synth”** separado (junto a H-03), no mezclar con faders VJ | Cerrada en doc; implementar en H-03 |
| 5 | ¿Implementar BRIGHT/DECAY/AMOUNT ahora? | **No** — solo documentar; ticket H-02b tras validación de producto | Abierta |
