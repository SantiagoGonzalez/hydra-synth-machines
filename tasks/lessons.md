# Lessons

- When a compiler orders pads by `activatedAt`, staging must assign an explicit order to draft pads; array insertion alone does not determine the emitted chain.
- Every Hydra canvas must render an initial safe frame so its WebGL framebuffers are initialized before they are presented.
- Registry `id` must exist in hydra-synth or be expanded in `chain-compiler.ts` before emit (ej. `modulateScroll` → `modulateScrollX` + `modulateScrollY`). Ver `docs/planning/hydra-registry-gaps.md`.
- Atajo de quitar slot en launchpad: **Shift+Backspace** (o Shift+Delete), no Backspace a secas — verificar en `use-launchpad-keys.ts` antes de documentar en UI.
- G-02 `Enter` en zona params: priorizar **source draft** (`isSourceFocused && hasSourceDraft` → `applySourceDraft`) antes de `onEditFocusedControl`; si no, se rompe Apply source con Enter.
- Spike G-03 (un solo fader vertical mezclado con horizontales): **descartado** — implementar faders verticales solo con la épica G (migración completa G-06), no piloto aislado.
- Store undo/redo: el stack de redo debe llamarse `redoStack` (no `redo`) para no colisionar con la acción `redo()`.
