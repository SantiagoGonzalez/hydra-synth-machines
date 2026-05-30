# Audio Reactivity

> Analiza audio del micrófono/sistema y expone `fft` para modular parámetros visuales.

## Functions

| Function | Purpose |
|----------|---------|
| `fft()` | Frequency spectrum data (when audio enabled) |
| `setBins(n)` | Number of FFT bins |
| `setCutoff(v)` | High-cut filter |
| `setScale(v)` | Amplitude scale |
| `setSmooth(v)` | Smoothing factor |
| `hide()` | Hide audio UI |
| `show()` | Show audio UI |

## Role in the Pipeline

Audio functions are **globals/side-effect configurators**, not chain transforms. Enable with `s0.initCam()`-style init or Hydra's `detectAudio: true` in embedded contexts.

> **TODO:** Exact `fft()` indexing and return shape not documented in Hydra Book sections used for this index. See [official learning: audio](https://hydra.ojack.xyz/docs/docs/learning/interactivity/audio).

## Composition Examples

```js
// TODO: verify fft usage in https://hydra.ojack.xyz/docs/docs/learning/interactivity/audio
// Typical pattern (unverified):
// osc(() => 10 + fft[0] * 100, 0.1, 0).out()
```

## Common Uses & Pitfalls

- This project's playground uses `detectAudio: false` — audio skills apply when enabling audio in editor or custom Hydra init.
- Prefer small multipliers on `fft` values to avoid chaotic jumps.

## Related Functions

- [`osc`](../sources/osc.md) — frequency driven by bass/treble
- [`scale`](../geometry/scale.md) — geometry react to beat
- [`speed`](../synth-settings/synth-settings.md) — global rate
