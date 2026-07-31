# Lessons

- Modelos Claude en Cursor: **Composer/Sonnet → Opus → Fable** (más caro). Fable es techo/frontera, no la opción “barata”.
- Feedback de uso mid-flujo → `/hydra-backloger` (Composer), no mezclar intake en el chat del implementer ni re-priorizar la oleada en curso salvo pedido.
- Branch de oleada: `oleada/YYYY-MM-DD-foco` (kebab-case, sin espacios). Merge a `main` solo con gate explícito del usuario; nunca force push.
- When a compiler orders pads by `activatedAt`, staging must assign an explicit order to draft pads; array insertion alone does not determine the emitted chain.
- Every Hydra canvas must render an initial safe frame so its WebGL framebuffers are initialized before they are presented.
- Registry `id` must exist in hydra-synth or be expanded in `chain-compiler.ts` before emit (ej. `modulateScroll` → `modulateScrollX` + `modulateScrollY`). Ver `docs/planning/hydra-registry-gaps.md`.
- Atajo de quitar slot en launchpad: **Shift+Backspace** (o Shift+Delete), no Backspace a secas — verificar en `use-launchpad-keys.ts` antes de documentar en UI.
- G-02 `Enter` en zona params: priorizar **source draft** (`isSourceFocused && hasSourceDraft` → `applySourceDraft`) antes de `onEditFocusedControl`; si no, se rompe Apply source con Enter.
- Spike G-03 (un solo fader vertical mezclado con horizontales): **descartado** — implementar faders verticales solo con la épica G (migración completa G-06), no piloto aislado.
- Store undo/redo: el stack de redo debe llamarse `redoStack` (no `redo`) para no colisionar con la acción `redo()`.
- Audio Hydra: encender con lazy `_initAudio()` + `detectAudio=true` **sin recrear** la instancia; siempre `if (!synth.a)` antes de `_initAudio()` (llamarlo dos veces anexa otro canvas y otro `AudioContext`).
- Params que dependen de un símbolo runtime opcional (`a`): incluirlo **siempre** como key en la whitelist de `buildBoundFunctions` — queda declarado como parámetro y el guard `a && …` evita `ReferenceError` aunque esté `undefined`.
- Emitir audio: `() => (a && a.fft && a.fft[bin] != null ? a.fft[bin] : 0) * scale + offset` — el check de `bin` evita `undefined * scale = NaN` si el índice queda fuera de rango.
- Teardown de stream mic: `Audio` de hydra-synth **no** expone stop; `detectAudio=false` + `hide()` deja el stream vivo (indicador del SO). Teardown real (`stream.getTracks().stop()`) queda para J-04/polish.
- `audioEnabled` / `fftVisible` **fuera** del snapshot de undo: un undo no debe re-disparar el prompt de permisos.
- Escrituras multi-canal (RGB, swatches): usar `updateParams(instanceId, patch)` — un solo `set` / `compileMultiChain`; N× `updateParam` en el mismo handler causa N× recompilación (G-09: 3×→1× medido).
- Picker nativo `<input type=color>`: `onChange` continuo durante drag; **no** hay `pointerup` fiable en el popup del SO — si hace falta throttle, usar rAF-coalescing (máx. 1 commit/frame) con flush del valor final, no `pointerup` ni debounce por tiempo.
