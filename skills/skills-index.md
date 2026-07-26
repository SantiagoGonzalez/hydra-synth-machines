# Skills Index

> **Last updated:** 2026-07-25 | **Total skills:** 59
>
> **Skill directory:** skills/

## Categories

### Meta Skills

| Skill | Path | Level | Purpose |
|-------|------|-------|---------|
| Create Skills | `skills/meta/create-skills.skill.md` | meta | Design and generate new reusable agent skills in structured markdown format |
| Evaluate Skill Quality | `skills/meta/evaluate-skill-quality.skill.md` | meta | Critically assess and improve an existing skill across structure, clarity, and robustness |
| Organize Skill System | `skills/meta/organize-skill-system.skill.md` | meta | Maintain and update the skills index with new or updated skill entries |
| Scan Skills | `skills/meta/scan-skills.skill.md` | meta | Discover and rebuild the full skills index by scanning a directory for markdown files |

---

### Architecture & Decision Skills

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| Hydra Skills Index | `docs/hydra-skills-index/index.md` | composite | Master reference index for Hydra's official API and composition patterns | hydra, reference, index, api |
| Hydra Composition Guide | `docs/hydra-skills-index/composition-guide.md` | composite | Mental model for building Hydra patches: sources → geometry → color → blend/modulate pipeline | hydra, composition, architecture, pipeline |

---

### Build Skills

#### Sources

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| `gradient` | `docs/hydra-skills-index/sources/gradient.md` | atomic | Generates a color gradient mapping screen position to RGB; useful as a color palette or position modulator | hydra, source, gradient, color |
| `noise` | `docs/hydra-skills-index/sources/noise.md` | atomic | Generates procedural noise texture with values in range [-1, 1]; unique range vs other sources | hydra, source, noise, procedural |
| `osc` | `docs/hydra-skills-index/sources/osc.md` | atomic | Generates a sinusoidal oscillator texture with color bands scrolling horizontally | hydra, source, oscillator, animation |
| `prev` | `docs/hydra-skills-index/sources/prev.md` | atomic | References the previous frame of the current output buffer; shortcut for feedback loops | hydra, source, feedback, prev |
| `shape` | `docs/hydra-skills-index/sources/shape.md` | atomic | Generates a regular polygon centered on screen; becomes circle with many sides, supports diffuse masks | hydra, source, shape, mask |
| `solid` | `docs/hydra-skills-index/sources/solid.md` | atomic | Generates a uniform solid color texture; essential as reference value in arithmetic blends | hydra, source, solid, color |
| `src` | `docs/hydra-skills-index/sources/src.md` | atomic | Reads a texture from an output buffer or external source; enables feedback loops referencing previous frame | hydra, source, buffer, feedback |
| `voronoi` | `docs/hydra-skills-index/sources/voronoi.md` | atomic | Generates a Voronoi diagram texture with organic cells; useful as source or shape modulator | hydra, source, voronoi, organic |

#### Geometry

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| `kaleid` | `docs/hydra-skills-index/geometry/kaleid.md` | atomic | Reflects the pattern radially around center, creating mandala-like symmetry | hydra, geometry, kaleid, symmetry |
| `pixelate` | `docs/hydra-skills-index/geometry/pixelate.md` | atomic | Reduces effective resolution by grouping pixels into blocks | hydra, geometry, pixelate, lo-fi |
| `repeat` | `docs/hydra-skills-index/geometry/repeat.md` | atomic | Tiles the pattern in a grid with optional per-axis offset | hydra, geometry, repeat, tile |
| `rotate` | `docs/hydra-skills-index/geometry/rotate.md` | atomic | Rotates texture coordinates around the center of the screen | hydra, geometry, rotate, transform |
| `scale` | `docs/hydra-skills-index/geometry/scale.md` | atomic | Scales texture coordinates; stretches or compresses pattern per axis | hydra, geometry, scale, transform |
| `scroll` | `docs/hydra-skills-index/geometry/scroll.md` | atomic | Scrolls texture coordinates, animating or offsetting the pattern | hydra, geometry, scroll, animation |

#### Color

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| `brightness` | `docs/hydra-skills-index/color/brightness.md` | atomic | Adjusts brightness by adding an offset to all channels | hydra, color, brightness |
| `channels` | `docs/hydra-skills-index/color/channels.md` | atomic | Extracts or operates on individual RGBA channels of a texture | hydra, color, channels, rgba |
| `color` | `docs/hydra-skills-index/color/color.md` | atomic | Remaps or sets color channels of the texture | hydra, color, remap |
| `colorama` | `docs/hydra-skills-index/color/colorama.md` | atomic | Cycles HSV values applying fract, producing unpredictable vibrant color shifts | hydra, color, colorama, hsv |
| `contrast` | `docs/hydra-skills-index/color/contrast.md` | atomic | Increases or reduces contrast around the midpoint | hydra, color, contrast |
| `hue` | `docs/hydra-skills-index/color/hue.md` | atomic | Shifts hue in HSV space while preserving saturation and brightness | hydra, color, hue, hsv |
| `invert` | `docs/hydra-skills-index/color/invert.md` | atomic | Inverts color values (photographic negative) | hydra, color, invert |
| `luma` | `docs/hydra-skills-index/color/luma.md` | atomic | Masks by luminosity; bright zones retain color, dark zones become transparent | hydra, color, luma, mask, alpha |
| `posterize` | `docs/hydra-skills-index/color/posterize.md` | atomic | Reduces number of color levels, creating discrete color bands | hydra, color, posterize, quantize |
| `saturate` | `docs/hydra-skills-index/color/saturate.md` | atomic | Adjusts color saturation; 0 converts to grayscale | hydra, color, saturate, grayscale |
| `shift` | `docs/hydra-skills-index/color/shift.md` | atomic | Shifts color channels independently | hydra, color, shift, channels |
| `thresh` | `docs/hydra-skills-index/color/thresh.md` | atomic | Converts image to black and white based on luminance threshold | hydra, color, threshold, bw |

#### Blend

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| `add` | `docs/hydra-skills-index/blend/add.md` | atomic | Adds the argument texture scaled by amount to the current result | hydra, blend, add, arithmetic |
| `blend` | `docs/hydra-skills-index/blend/blend.md` | atomic | Linearly blends with the argument texture; essential for attenuating feedback | hydra, blend, mix, feedback |
| `diff` | `docs/hydra-skills-index/blend/diff.md` | atomic | Returns absolute difference between two textures; alpha = max of both | hydra, blend, diff, arithmetic |
| `layer` | `docs/hydra-skills-index/blend/layer.md` | atomic | Overlays argument texture respecting alpha; top layer replaces where opaque | hydra, blend, layer, alpha |
| `mask` | `docs/hydra-skills-index/blend/mask.md` | atomic | Uses luminance of argument texture as mask; replaces alpha channel | hydra, blend, mask, alpha |
| `mult` | `docs/hydra-skills-index/blend/mult.md` | atomic | Multiplies color values channel by channel; alpha multiplied independently | hydra, blend, mult, arithmetic |
| `sub` | `docs/hydra-skills-index/blend/sub.md` | atomic | Subtracts scaled argument texture from the current result | hydra, blend, sub, arithmetic |

#### Modulate

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| `modulate` | `docs/hydra-skills-index/modulate/modulate.md` | atomic | Displaces each pixel's sampling position using R and G channels of a modulator texture | hydra, modulate, warp, displacement |
| `modulateHue` | `docs/hydra-skills-index/modulate/modulateHue.md` | atomic | Modulation variant using G and B channels; enables bidirectional displacement | hydra, modulate, hue, displacement |
| `modulateKaleid` | `docs/hydra-skills-index/modulate/modulateKaleid.md` | atomic | Applies kaleidoscopic symmetry with parameters derived from the modulator | hydra, modulate, kaleid, symmetry |
| `modulatePixelate` | `docs/hydra-skills-index/modulate/modulatePixelate.md` | atomic | Applies pixelation whose intensity depends on the modulator | hydra, modulate, pixelate |
| `modulateRepeat` | `docs/hydra-skills-index/modulate/modulateRepeat.md` | atomic | Tiles the pattern with repetition parameters controlled by the modulator | hydra, modulate, repeat, tile |
| `modulateRotate` | `docs/hydra-skills-index/modulate/modulateRotate.md` | atomic | Rotates sampling coordinates according to the modulator | hydra, modulate, rotate |
| `modulateScale` | `docs/hydra-skills-index/modulate/modulateScale.md` | atomic | Scales sampling coordinates using R and G channels of the modulator | hydra, modulate, scale, warp |
| `modulateScroll` | `docs/hydra-skills-index/modulate/modulateScroll.md` | atomic | Scrolls coordinates based on the modulator; similar to scroll with texture wrapping | hydra, modulate, scroll |

#### Global / Misc

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| Array Utilities | `docs/hydra-skills-index/arrays/arrays.md` | atomic | Sequence and smooth numeric parameters over time using `fast`, `smooth`, `ease`, `offset`, `fit` | hydra, arrays, animation, parameters |
| Audio Reactivity | `docs/hydra-skills-index/audio/audio.md` | atomic | Analyzes microphone/system audio and exposes `fft` to modulate visual parameters | hydra, audio, reactivity, fft |
| External Sources | `docs/hydra-skills-index/external-sources/external-sources.md` | atomic | Load cameras, images, video and screen as sources `s0`–`s3` for use with `src()` | hydra, external, webcam, video, image |
| Synth Settings & Globals | `docs/hydra-skills-index/synth-settings/synth-settings.md` | atomic | Control rendering, time, resolution and buffer output | hydra, settings, render, output, resolution |

#### Launchpad

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| Launchpad Components | `skills/launchpad-components.skill.md` | composite | 3-zone launchpad: pad band, param panel, canvas, chain store, data flow | launchpad, components, pads, layout |
| Pad Band & Grid | `skills/pad-band-and-grid.skill.md` | composite | Tab bar, 8×2 grid, AddPad, slot ordering, pad interactions | launchpad, pads, grid, tabs |
| Launchpad Layout | `skills/launchpad-layout.skill.md` | atomic | Fixed viewport shell, zone proportions, min-h-0 scroll chain | launchpad, layout, viewport |
| Launchpad Keyboard | `skills/launchpad-keyboard.skill.md` | atomic | Tab keys 1–5, future positional pad mapping | launchpad, keyboard, hotkeys |
| Param Panel | `skills/param-panel.skill.md` | composite | Pad detail, active chips, sliders, secondary source, global faders; refactor roadmap | launchpad, params, sliders, selection |
| UI Scrollbar Thin | `skills/ui-scrollbar-thin.skill.md` | atomic | Reusable `.scrollbar-thin` utility for minimal scrollbars | ui, css, scrollbar |
| Section Rows & Add Pad | `skills/section-rows-and-add-pad.skill.md` | composite | **Obsolete** — see Pad Band & Grid | launchpad, deprecated |
| Machines | `skills/machines.skill.md` | composite | Machine as visual instrument: controls mapped to Hydra functions | machine, architecture, layout, instrument |
| Favorites Library | `skills/favorites-library.skill.md` | atomic | Save, display, restore Hydra chains via dialog + thumbnails | launchpad, favorites, persistence, thumbnail |

---

## Intent → Skill Router

| If you need to… | Use skill(s) |
|-----------------|-------------|
| Understand Hydra pipeline order (Source → Geometry → Color → Blend) | `docs/hydra-skills-index/composition-guide.md` |
| Look up any Hydra function signature or parameters | `docs/hydra-skills-index/index.md` |
| Generate a base visual pattern | `sources/osc.md`, `sources/noise.md`, `sources/voronoi.md`, `sources/gradient.md` |
| Draw geometric shapes or masks | `sources/shape.md`, `color/luma.md`, `color/thresh.md` |
| Combine or mix two textures | `blend/add.md`, `blend/blend.md`, `blend/mult.md`, `blend/layer.md` |
| Apply color grading or correction | `color/hue.md`, `color/saturate.md`, `color/colorama.md`, `color/brightness.md`, `color/contrast.md` |
| Create feedback loops or trails | `sources/prev.md`, `sources/src.md`, `blend/blend.md` |
| Warp or distort a texture | `modulate/modulate.md`, `modulate/modulateScale.md`, `modulate/modulateRotate.md` |
| Apply geometric transforms | `geometry/rotate.md`, `geometry/scale.md`, `geometry/scroll.md` |
| Create kaleidoscope / symmetry effects | `geometry/kaleid.md`, `modulate/modulateKaleid.md` |
| React to audio | `docs/hydra-skills-index/audio/audio.md` |
| Animate parameters over time with arrays | `docs/hydra-skills-index/arrays/arrays.md` |
| Load a webcam, video, or image as source | `docs/hydra-skills-index/external-sources/external-sources.md` |
| Control render settings, resolution, or output buffers | `docs/hydra-skills-index/synth-settings/synth-settings.md` |
| Create a new agent skill | `skills/meta/create-skills.skill.md` |
| Evaluate or improve an existing skill | `skills/meta/evaluate-skill-quality.skill.md` |
| Add a skill to this index | `skills/meta/organize-skill-system.skill.md` |
| Rebuild this index from scratch | `skills/meta/scan-skills.skill.md` |
| Work on launchpad components or add features | `skills/launchpad-components.skill.md` |
| Change pad grid, tabs, or AddPad behavior | `skills/pad-band-and-grid.skill.md` |
| Adjust launchpad layout proportions or viewport | `skills/launchpad-layout.skill.md` |
| Add or extend keyboard shortcuts | `skills/launchpad-keyboard.skill.md` |
| Style scrollbars minimally | `skills/ui-scrollbar-thin.skill.md` |
| Refactor or extend param panel / sliders / global faders | `skills/param-panel.skill.md` |
| Add section rows (legacy) | `skills/pad-band-and-grid.skill.md` (replaces section-rows) |
| Understand or design a new machine layout | `skills/machines.skill.md` |
| Save, load, or display favorite chains in the library | `skills/favorites-library.skill.md` |

---

## How to Update This Index

- **Add a skill:** ask the agent to follow `skills/meta/organize-skill-system.skill.md`
- **Create a skill:** ask the agent to follow `skills/meta/create-skills.skill.md`, then register it
- **Full rebuild:** ask the agent to follow `skills/meta/scan-skills.skill.md`
- **Evaluate a skill:** ask the agent to follow `skills/meta/evaluate-skill-quality.skill.md`
