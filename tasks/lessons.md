# Lessons

- When a compiler orders pads by `activatedAt`, staging must assign an explicit order to draft pads; array insertion alone does not determine the emitted chain.
- Every Hydra canvas must render an initial safe frame so its WebGL framebuffers are initialized before they are presented.
- Registry `id` must exist in hydra-synth or be expanded in `chain-compiler.ts` before emit (ej. `modulateScroll` → `modulateScrollX` + `modulateScrollY`). Ver `docs/planning/hydra-registry-gaps.md`.
