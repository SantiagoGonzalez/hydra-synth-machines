# Audio Reactivity

> Analiza audio del micrófono y expone `a.fft[i]` (0–1) para modular parámetros visuales.

## API (`a` — instancia Audio de hydra-synth)

| Propiedad / método | Uso |
|--------------------|-----|
| `a.fft[i]` | Nivel normalizado **0–1** del bin *i* (bajos = índice bajo) |
| `a.setBins(n)` | Cantidad de bandas (default **4** en este proyecto) |
| `a.setCutoff(v)` | Umbral mínimo (ruido de piso) |
| `a.setScale(v)` | Rango máximo detectado |
| `a.setSmooth(v)` | Suavizado 0–1 (0 = reactivo, 1 = congelado) |
| `a.show()` / `a.hide()` | Mini visualizador FFT sobre el canvas |

## Role in the Pipeline

Audio es un **global / side-effect**, no un transform de cadena. En el launchpad:

1. Mic **opt-in** → `setAudioEnabled(true)` hace lazy `_initAudio()` + `detectAudio = true` (sin recrear Hydra).
2. `a` está en la whitelist del evaluador (`buildBoundFunctions`) aunque el mic esté off (`a` puede ser `undefined`).
3. Params en modo ♪ emiten arrows con guard: `() => (a && a.fft && a.fft[i] != null ? a.fft[i] : 0) * scale + offset`.

Referencia oficial: [Hydra learning — audio](https://hydra.ojack.xyz/docs/docs/learning/interactivity/audio). Plan del repo: [`docs/planning/audio-reactivity.md`](../../planning/audio-reactivity.md).

## Composition Examples

```js
// Graves → frecuencia (bin 0)
osc(10, 0.1, () => a.fft[0] * 4).out()

// Con offset (patrón base del launchpad modo ♪)
osc(() => (a && a.fft && a.fft[0] != null ? a.fft[0] : 0) * 40 + 10, 0.1, 0).out()

// Agudos → modulación
voronoi(5, 0.3).modulate(noise(3), () => a.fft[3] * 0.3).out()
```

## Common Uses & Pitfalls

- Launchpad: toggle **Mic** + **FFT** en `audio-controls.tsx`; modo ♪ en `param-slider.tsx`.
- Playground de aprendizaje sigue con `detectAudio: false` (solo launchpad en v1).
- Preferir multiplicadores bajos y `setSmooth` para evitar saltos caóticos.
- Al apagar mic, v1 no hace teardown del stream (`getUserMedia` sigue vivo) — limitación conocida hasta J-04.
- `_initAudio` es API interna de `hydra-synth`; no re-llamar si `synth.a` ya existe (anexa otro canvas).

## Related Functions

- [`osc`](../sources/osc.md) — frequency driven by bass/treble
- [`scale`](../geometry/scale.md) — geometry react to beat
- [`speed`](../synth-settings/synth-settings.md) — global rate
