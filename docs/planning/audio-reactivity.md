# Audio reactivo — exploración e integración

> Estado: **planificación / spike**. Hydra **sí soporta** audio reactivo vía micrófono; el launchpad **no lo tiene habilitado** hoy.

Referencias:
- [Hydra — audio](https://hydra.ojack.xyz/docs/docs/learning/interactivity/audio)
- [`docs/hydra-skills-index/audio/audio.md`](../hydra-skills-index/audio/audio.md)
- Código: `node_modules/hydra-synth/src/lib/audio.js`

---

## Qué ofrece Hydra (hydra-synth)

### Activación

```js
new Hydra({ detectAudio: true, canvas, ... })
```

- Inicializa `synth.a` (clase `Audio` + **Meyda**)
- Pide permiso de **micrófono** (`getUserMedia({ audio: true })`)
- En cada frame, si `detectAudio === true`, llama `synth.a.tick()`

### Objeto `a` (API oficial)

| Método / propiedad | Uso |
|--------------------|-----|
| `a.fft[i]` | Nivel normalizado **0–1** del bin *i* (bajos = índice bajo) |
| `a.setBins(n)` | Cantidad de bandas (default 4) |
| `a.setCutoff(v)` | Umbral mínimo (ruido de piso) |
| `a.setScale(v)` | Rango máximo detectado |
| `a.setSmooth(v)` | Suavizado 0–1 (0 = reactivo, 1 = congelado) |
| `a.show()` / `a.hide()` | Mini visualizador FFT sobre el canvas |
| `a0`, `a1`, … | Atajos globales: `(scale, offset) => () => a.fft[i]*scale+offset` |

### Patrón en código Hydra

Los valores de audio deben leerse dentro de **arrow functions** para re-evaluarse cada frame:

```js
a.setBins(6)
a.setScale(8)
a.setCutoff(0.1)

osc(10, 0.1, () => a.fft[0] * 4)
  .modulate(noise(3), () => a.fft[2] * 0.5)
  .out()
```

Equivalente mental al modo **fn(time)** que ya tiene el launchpad — pero la fuente es `a.fft[bin]` en lugar de `Math.sin(time * freq)`.

### Beat detection (interno, no documentado en UI Hydra)

`audio.js` incluye `detectBeat`, `onBeat`, `beat.threshold` — útil para triggers, pero **no está expuesto** en la API pública de forma limpia. Spike opcional.

---

## Estado actual en hydra-synth (este repo)

| Pieza | Estado |
|-------|--------|
| `chain-evaluator.ts` | `detectAudio: false` |
| `buildBoundFunctions` | **No expone** `a` |
| `hydra-playground.tsx` | `detectAudio: false` |
| `ParamValue` | `number` \| `fn(time)` — **sin modo audio** |
| `chain-compiler` | Emite `({time}) => ...` para fn; no emite `a.fft` |
| UI launchpad | Sin toggle mic, sin controles `setBins` / `setScale` |

**Conclusión:** el motor lo trae; falta **encenderlo**, **exponerlo al evaluador** y **modelarlo en pads** (o código).

---

## Limitaciones importantes

| Tema | Detalle |
|------|---------|
| **Solo micrófono** | Por defecto Hydra analiza el mic, no el audio del sistema / Spotify / DAW |
| **System audio** | En browser: requiere trucos (p.ej. captura de pestaña con audio, BlackHole/loopback en OS, o app nativa/Electron) |
| **Permisos** | `getUserMedia` — UX de consentimiento obligatoria |
| **HTTPS / localhost** | Mic solo en contextos seguros |
| **Proyección** | Segunda ventana = segunda instancia Hydra; mic duplicado o **sync de valores FFT** vía canal |
| **Privacidad** | Indicador “mic activo”; apagar al salir del launchpad |
| **Chaotic jumps** | Usar `setSmooth`, multiplicadores bajos, `setCutoff` |

---

## Caminos de integración (de menor a mayor)

### Nivel 1 — Motor on (spike técnico)

**Esfuerzo: S**

1. Flag `detectAudio` en `createHydraEvaluator` (opt-in, default `false`)
2. Pasar `a` (y métodos `setBins`, etc.) al scope de `new Function`
3. Toggle UI “Mic on” → pide permiso → `detectAudio: true` o reinicio evaluador
4. Botón “Show FFT” → `a.show()` / `a.hide()`

**Entregable:** pegar en consola / favorito código con `() => a.fft[0]` y que funcione.

**Riesgo:** reiniciar evaluador al togglear audio; permiso denegado.

---

### Nivel 2 — Modo **audio** en parámetros de pad (recomendado para launchpad)

**Esfuerzo: M** — encaja con el modelo `fn(time)` existente.

Extender `ParamValue`:

```ts
interface ParamAudioValue {
  kind: "audio"
  bin: number      // 0 .. bins-1
  scale: number    // multiplicador (ej. 4)
  offset: number   // bias
}
```

Compilador emite:

```js
() => a.fft[0] * 4 + 0.1
```

UI en `SingleParamSlider` (junto a `#` / `fn`):

```
[ # ] [ fn ] [ ♪ ]   ← toggle modo audio
bin: [0][1][2]...    ← según a.setBins
scale / offset       ← como fn amp/offset
```

**Ventajas:**
- Serializable en `compiledCode` (proyección puede re-evaluar si también tiene `a`)
- Coherente con atajos de teclado / `launchpad-controls`
- No inventa API Hydra

**Depende de:** Nivel 1.

---

### Nivel 3 — Panel “Audio” global

**Esfuerzo: S–M**

Sección en param panel o barra del stage (como globals):

| Control | Mapea a |
|---------|---------|
| Bins | `a.setBins(n)` |
| Sensitivity | `a.setScale` |
| Floor | `a.setCutoff` |
| Smooth | `a.setSmooth` |
| Show meter | `a.show()` / `hide()` |

Store: `audioSettings` en `chain-store` (no va al compilador de pads; el evaluador aplica antes de `run`).

**Relación Epic H:** mismo patrón que cablear `speed` / `bpm` en el evaluador.

---

### Nivel 4 — Audio del sistema / línea externa

**Esfuerzo: L — investigación**

| Enfoque | Viabilidad browser |
|---------|-------------------|
| Mic en sala (altavoces → mic) | Funciona ya; mala calidad / latencia |
| `getDisplayMedia` + audio (Chrome tab capture) | Posible para “react to tab”; UX rara |
| Web Audio desde archivo / stream URL | Custom analyser; **no** usa `a` de Hydra tal cual |
| Bridge externo (OSC, WebSocket, Ableton) | Fuera de Hydra; alimentar params vía store |
| Electron / Tauri | Acceso a loopback de OS |

**Recomendación:** v1 = **mic**; documentar system audio como spike / v2.

---

### Nivel 5 — Beat, macros, MIDI + audio

**Esfuerzo: M–L**

- Exponer `a.onBeat` → flash pad / trigger momentary
- Macro “bass drives X” — mapeo bin → param sin entrar modo audio por param
- Complemento a **MIDI** (`launchpad-controls.ts`): audio = modulación continua, MIDI = discreta

---

## Proyección y multi-ventana

Problema: ventana de proyección con instancia Hydra propia (`skills/projection.skill.md`).

| Estrategia | Descripción |
|----------|-------------|
| **A — Audio solo en launchpad** | Proyección recibe `compiledCode` con `a.fft`; si proyección tiene `detectAudio: true`, ambos leen el mic (doble stream — evitar) |
| **B — Sync FFT por canal** | Launchpad publica `{ fft: number[] }` en `BroadcastChannel`; proyección inyecta mock `a.fft` antes de eval (requiere shim) |
| **C — Audio solo en proyección** | Performer no opera audio; solo público ve reacción (raro) |

**Recomendación:** **B** a medio plazo; **A** aceptable en v1 si solo launchpad tiene mic y proyección es mirror del mismo código con un solo `detectAudio` en la ventana activa.

---

## Propuesta de épica (backlog)

| ID | Ítem | Nivel | Esfuerzo |
|----|------|-------|----------|
| J-01 | Habilitar `detectAudio` + exponer `a` en evaluador | 1 | S |
| J-02 | UI toggle mic + permisos + show/hide FFT | 1 | S |
| J-03 | `ParamValue` kind `audio` + compilador + toggle ♪ en slider | 2 | M |
| J-04 | Panel global audio (`setBins`, scale, smooth, cutoff) | 3 | S–M |
| J-05 | Sync FFT a ventana proyección | B | M |
| J-06 | Spike system audio / OSC | 4 | L |
| J-07 | Beat trigger (`onBeat`) | 5 | M |

---

## Orden sugerido vs otras épicas

```
J-01 + J-02  →  spike “¿suena?” con código manual
J-03         →  valor de producto en pads (junto Epic G)
J-04         →  calibración en vivo
D-03         →  J-05 cuando exista proyección
```

**No bloquea** H (globals) ni G (panel UI) — se puede hacer **J-01+02** en paralelo a **H-01**.

**Combina bien con Epic G:** modo ♪ en el mismo `SingleParamSlider` que `#` / `fn`.

---

## Criterios de aceptación (MVP audio)

1. Usuario activa mic; `osc(10,0, () => a.fft[0]*4).out()` reacciona en el canvas.
2. Al menos un param de pad puede conmutarse a modo **audio** y compilar correctamente.
3. Desactivar mic libera stream / oculta meter.
4. Documentado: solo mic en v1; system audio = investigación.

---

## Decisiones abiertas

1. ¿Audio on por defecto o opt-in estricto?
2. ¿Cuántos bins por defecto? (Hydra usa 4; UI de 6–8 bandas tipo ecualizador)
3. ¿Modo audio en params secundarios (modulate source) o solo main?
4. ¿v1 solo launchpad o también playground de aprendizaje?

---

## Ejemplos creativos (post-MVP)

```js
// Graves → frecuencia osc
osc(() => 5 + a.fft[0] * 40, 0.1, 0).out()

// Agudos → modulación
voronoi(5, 0.3).modulate(noise(3), () => a.fft[3] * 0.3).out()

// Beat-ish → umbral en bin 0
osc(10, 0.1, () => (a.fft[0] > 0.6 ? 2 : 0.1)).out()
```
