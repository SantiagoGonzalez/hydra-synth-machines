# Hydra Skills Index

Knowledge base for Hydra's official API and composition patterns. Derived from [Hydra Functions](https://hydra.ojack.xyz/functions/) and [Hydra Book](https://hydra-book.glitches.me/).

- **[Composition Guide](composition-guide.md)** — mental model, order of operations, fusion, time, feedback

---

## Sources

| Skill | Summary |
|-------|---------|
| [`osc`](sources/osc.md) | Sinusoidal bands; color via `offset` |
| [`noise`](sources/noise.md) | Procedural noise; range [-1, 1] |
| [`voronoi`](sources/voronoi.md) | Cell diagrams; range [0, 1] |
| [`shape`](sources/shape.md) | Polygons, lines, circles via sides/radius/smoothing |
| [`gradient`](sources/gradient.md) | Color gradient field |
| [`src`](sources/src.md) | Read buffer `o0`–`o3` or external `s0`–`s3` |
| [`solid`](sources/solid.md) | Flat color fill |
| [`prev`](sources/prev.md) | Previous frame shorthand (TODO: detail) |

---

## Geometry

| Skill | Summary |
|-------|---------|
| [`rotate`](geometry/rotate.md) | Rotate UV coordinates |
| [`scale`](geometry/scale.md) | Scale / zoom UVs |
| [`pixelate`](geometry/pixelate.md) | Mosaic blocks |
| [`repeat`](geometry/repeat.md) | Tile pattern; includes `repeatX` / `repeatY` |
| [`kaleid`](geometry/kaleid.md) | Radial mirror symmetry |
| [`scroll`](geometry/scroll.md) | Scroll UVs; includes `scrollX` / `scrollY` |

---

## Color

| Skill | Summary |
|-------|---------|
| [`hue`](color/hue.md) | HSV hue shift |
| [`saturate`](color/saturate.md) | Saturation; `0` = grayscale |
| [`colorama`](color/colorama.md) | HSV cycle with fract wrap |
| [`brightness`](color/brightness.md) | Luminance offset |
| [`contrast`](color/contrast.md) | Contrast multiplier |
| [`invert`](color/invert.md) | Invert RGB |
| [`luma`](color/luma.md) | Luminance mask + transparency |
| [`thresh`](color/thresh.md) | Binary threshold |
| [`posterize`](color/posterize.md) | Quantize color levels |
| [`color`](color/color.md) | Channel remapping / tint |
| [`shift`](color/shift.md) | Channel shift (**TODO:** detail) |
| [`channels`](color/channels.md) | `r`, `g`, `b`, `a`, `sum` (**TODO:** detail) |

---

## Blend (Fusion)

| Skill | Summary |
|-------|---------|
| [`add`](blend/add.md) | Add textures |
| [`sub`](blend/sub.md) | Subtract (**TODO:** detail) |
| [`diff`](blend/diff.md) | Absolute difference |
| [`mult`](blend/mult.md) | Multiply channels |
| [`mask`](blend/mask.md) | Luminance mask |
| [`layer`](blend/layer.md) | Alpha compositing |
| [`blend`](blend/blend.md) | Linear mix; feedback damping |

---

## Modulate

| Skill | Summary |
|-------|---------|
| [`modulate`](modulate/modulate.md) | R/G displacement |
| [`modulateScale`](modulate/modulateScale.md) | R/G scale warp |
| [`modulatePixelate`](modulate/modulatePixelate.md) | Variable pixelation |
| [`modulateRotate`](modulate/modulateRotate.md) | Modulator-driven rotation |
| [`modulateHue`](modulate/modulateHue.md) | G/B displacement (not HSV hue) |
| [`modulateRepeat`](modulate/modulateRepeat.md) | Repeat driven by modulator (**TODO:** detail) |
| [`modulateKaleid`](modulate/modulateKaleid.md) | Kaleid driven by modulator (**TODO:** detail) |
| [`modulateScroll`](modulate/modulateScroll.md) | `modulateScrollX` / `modulateScrollY` (**TODO:** detail) |

---

## External Sources

| Skill | Summary |
|-------|---------|
| [External sources](external-sources/external-sources.md) | `initCam`, `initImage`, `initVideo`, `initStream`, `initScreen` |

---

## Synth Settings

| Skill | Summary |
|-------|---------|
| [Synth settings](synth-settings/synth-settings.md) | `render`, `out`, `time`, `speed`, `bpm`, `mouse`, `setResolution`, `hush` |

---

## Arrays

| Skill | Summary |
|-------|---------|
| [Arrays](arrays/arrays.md) | `fast`, `smooth`, `ease`, `offset`, `fit` (**TODO:** detail) |

---

## Audio

| Skill | Summary |
|-------|---------|
| [Audio](audio/audio.md) | `fft`, `setBins`, `setCutoff`, `setScale`, `setSmooth` (**TODO:** detail) |

---

## Coverage Gaps (TODO)

Functions listed in the [official reference](https://hydra.ojack.xyz/functions/) but lacking depth in primary sources for this index:

- `shift`, `sum`, channel accessors (`r`, `g`, `b`, `a`)
- `modulateRepeat`, `modulateRepeatX`, `modulateRepeatY`, `modulateKaleid`, `modulateScrollX`, `modulateScrollY`
- Array utilities and audio `fft` indexing
- Some external `init*` argument forms

Verify in the [interactive function reference](https://hydra.ojack.xyz/functions/) before production use.

---

## Future Work

Interactive step-by-step visual synthesizer applying each transform from this index — **not implemented** in this documentation pass.

---

## Launchpad (este repo)

| Doc | Uso |
|-----|-----|
| [`docs/glosario-hydra.md`](../glosario-hydra.md) | Vocabulario Hydra ↔ UI |
| [`tasks/backlog.md`](../../tasks/backlog.md) | Backlog de features |
| [`docs/planning/hydra-registry-gaps.md`](../planning/hydra-registry-gaps.md) | Desajustes registry / compilador / runtime |
| [`docs/planning/param-panel-redesign.md`](../planning/param-panel-redesign.md) | Rediseño param panel |
| [`docs/planning/projection-controls.md`](../planning/projection-controls.md) | Controles de proyección (dimmer) |
| [`docs/planning/hydra-globals.md`](../planning/hydra-globals.md) | Globales Hydra y cableado |
| [`docs/planning/audio-reactivity.md`](../planning/audio-reactivity.md) | Audio reactivo (`a.fft`, mic, modos de integración) |
| [`docs/planning/scene-composition.md`](../planning/scene-composition.md) | Scene bank + assets PNG en escena |
| [`docs/planning/subchains.md`](../planning/subchains.md) | Subchains — fuentes compuestas en modulate/blend |
