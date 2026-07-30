# Globales Hydra — estado actual y gaps

> Estado: **planificación** + diagnóstico. Los faders globales del panel **no afectan el render** hoy.

---

## Síntoma reportado

Al mover **SPEED / BRIGHT / DECAY / AMOUNT** en el param panel, la imagen no cambia.

## Causa (confirmada en código)

| Capa | Estado |
|------|--------|
| UI `global-faders.tsx` | OK — actualiza store |
| `chain-store.globalFaders` | OK — `setGlobalFader` |
| Navegación teclado | OK — en `buildControlList` |
| `chain-compiler.ts` | **No lee** `globalFaders` |
| `chain-evaluator.ts` | Expone `speed`, `bpm` pero **nadie los asigna** en `run()` |

Comentario en código: `global-faders.tsx` línea 3 — *“sin cablear al compilador aún”*.

---

## Faders actuales vs Hydra real

| Fader UI (`lib/global-faders.ts`) | ¿Existe en Hydra? | Mapeo propuesto |
|-----------------------------------|-------------------|-----------------|
| `speed` | Sí — global `speed` | Asignar en evaluador antes de cada `run`: `speed = value` |
| `brightness` | No es global — es función `.brightness()` | Post-process CSS **o** pad implícito al final de chain (decidir) |
| `decay` | No es global — feedback / `blend(o0, t)` | Renombrar a “feedback” o cablear solo si hay `src(oN)` activo |
| `amount` | Ambiguo | Clarificar intención o eliminar |

**Acción mínima (H-01):** cablear al menos `speed` en `createHydraEvaluator` / `run()` leyendo del store o pasando settings en el mensaje de eval.

---

## Configuración Hydra no expuesta en launchpad

Referencia: `docs/hydra-skills-index/synth-settings/synth-settings.md`

| API | En evaluador | En UI launchpad | Notas |
|-----|--------------|-----------------|-------|
| `speed` | Exposed | Fader (sin efecto) | Prioridad H-01 |
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

| ID | Ítem |
|----|------|
| H-01 | Cablear `speed` (y validar efecto visible) |
| H-02 | Auditar labels: brightness/decay/amount vs semántica Hydra |
| H-03 | Exponer `bpm` en globals o sección “Synth” |
| H-04 | `setResolution` para modo proyector (con D-05) |
| D-06 | Dimmer DOM (no es global Hydra) — ver `projection-controls.md` |

---

## Criterios de aceptación (H-01)

1. Mover fader **SPEED** cambia velocidad de animaciones que usan `time` / fn.
2. Valor persiste en store durante la sesión (opcional: favoritos v3).
3. Ventana de proyección recibe los mismos globals cuando exista D-03.

---

## Decisiones abiertas

1. ¿`brightness` global = CSS master o `.brightness()` en toda la salida?
2. ¿Eliminar o renombrar DECAY/AMOUNT hasta tener semántica clara?
3. ¿BPM junto a globals o en panel “Synth settings” separado?
