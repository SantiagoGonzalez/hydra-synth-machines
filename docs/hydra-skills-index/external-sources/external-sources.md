# External Sources

> Carga cámaras, imágenes, video y pantalla como fuentes `s0`–`s3` para usar con `src()`.

## Functions

| Function | Purpose |
|----------|---------|
| `initCam()` | Webcam → typically `s0` |
| `initImage(url)` | Static image |
| `initVideo(url)` | Video file |
| `init()` | Generic init |
| `initStream(url)` | Live stream |
| `initScreen()` | Screen capture |

## Role in the Pipeline

External sources are **async init** functions — they register a media source on a slot (`s0`–`s3`), then you sample with [`src`](../sources/src.md):

```js
s0.initCam()
src(s0).colorama(0.1).out()
```

Listed in the [official function reference](https://hydra.ojack.xyz/functions/) under External Sources.

> **TODO:** Per-function argument lists and error handling not fully documented in Hydra Book chapters fetched for this index. See [official learning: external sources](https://hydra.ojack.xyz/docs/docs/learning/external-sources/).

## Composition Examples

```js
// TODO: verify initImage/initVideo URL patterns in project editor
s0.initCam()
src(s0).modulate(noise(3, 0)).out()
```

## Common Uses & Pitfalls

- Init is asynchronous — first frames may be blank until media loads.
- Mix with generative sources via [`blend`](../blend/blend.md) or [`layer`](../blend/layer.md).
- [`detectAudio`](audio.md) is separate from video init.

## Related Functions

- [`src`](../sources/src.md) — read external buffer
- [`modulate`](../modulate/modulate.md) — distort camera feed
- [`colorama`](../color/colorama.md) — stylize live input
