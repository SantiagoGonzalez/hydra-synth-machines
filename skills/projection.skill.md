# Skill: projection

> **Estado: PLANIFICADO — NO implementado.** Este skill documenta la arquitectura decidida para la ventana de proyección (Fase 5 del plan de mejoras del launchpad). No existe todavía ninguna ruta, componente ni canal de sincronización. Sirve como spec de referencia para implementarla y como lista de decisiones actuales que **no deben romperse** para no bloquearla.

## Purpose
Spec de la ventana de proyección del launchpad VJ — una segunda ventana del navegador (`window.open`) con render limpio del output enfocado, pensada para enviar a un proyector/pantalla externa durante una performance.

## Inputs
- Decisión de implementar la proyección (Fase 5 → implementación futura)
- `compiledCode` + output enfocado (`editingOutput`) del `chain-store`

## Outputs
- (futuro) Ruta `app/launchpad/projection/page.tsx` con canvas fullscreen sin UI
- (futuro) Canal `BroadcastChannel` que sincroniza código compilado y output enfocado
- (futuro) Botón "project" en el launchpad que abre la ventana

## Preconditions
- `createHydraEvaluator` en `lib/chain-evaluator.ts` ya corre código serializable sobre un canvas arbitrario (bloque reutilizable clave, entregado en Fase 1)
- `lib/chain-compiler.ts` es un compilador **puro**: pads → string de código Hydra, sin tocar DOM ni WebGL
- `hydra-canvas.tsx` ya tiene fullscreen (`requestFullscreen` sobre el canvas) como solución provisoria de proyección

---

## Arquitectura decidida

### Flujo general

```
[Launchpad window]                          [Projection window]
app/launchpad/page.tsx                      /launchpad/projection (window.open)
    │                                            │
    │ chain-store: compiledCode cambia           │ canvas fullscreen, sin UI
    │ editingOutput cambia                       │ instancia Hydra PROPIA
    │                                            │ (createHydraEvaluator)
    └── BroadcastChannel ──── postMessage ──────►│
        { compiledCode, focusedOutput }          │ run(code) + render(oN)
```

1. **Ruta dedicada** — p.ej. `/launchpad/projection`, abierta con `window.open` desde el launchpad (botón junto a fullscreen en el stage). Es una page Next.js normal, client-only.
2. **Instancia Hydra propia** — la ventana monta su propio canvas y llama `createHydraEvaluator(canvas)` (`lib/chain-evaluator.ts`). No comparte nada con la instancia del launchpad: re-evalúa el mismo código de forma independiente.
3. **Sincronización vía `BroadcastChannel`** — la ventana de proyección se suscribe a un canal (p.ej. `"hydra-projection"`) y recibe mensajes con `compiledCode` + output enfocado. El launchpad publica al cambiar `compiledCode` o `editingOutput`. Al abrirse, la proyección pide (o el launchpad reenvía) el estado actual.
4. **Render limpio** — la proyección corre el código multi-output y termina en `render(oN)` del output enfocado. Sin UI, sin grid 2×2 (`gridView` no aplica), sin overlays, sin tabs o0–o3, sin badges. Solo el canvas.

### Contrato del mensaje (propuesto)

```typescript
interface ProjectionMessage {
  compiledCode: string          // código Hydra serializable (multi-output)
  focusedOutput: OutputBuffer   // "o0" | "o1" | "o2" | "o3" → render(oN)
}
```

---

## Constraints conocidos

| Constraint | Implicancia |
|-----------|-------------|
| **Un contexto WebGL por ventana** | No se comparten buffers o0–o3 entre ventanas. La proyección NO ve los buffers del launchpad: re-evalúa el mismo `compiledCode` con su propia instancia. Ambas ventanas convergen visualmente porque corren el mismo código, pero patches con estado acumulado (feedback `src(oN)`) pueden diferir levemente al inicio. |
| **`enableStreamCapture: false`** | `createHydraEvaluator` inicializa hydra-synth sin stream capture. No hay `canvas.captureStream()` disponible hoy como alternativa de proyección; si se quisiera esa vía habría que revisitar el flag. |
| **Fullscreen ya existe** | `hydra-canvas.tsx` tiene `toggleFullscreen` sobre el canvas principal. Es la solución actual para proyectar; la ventana dedicada la complementa (permite seguir operando el launchpad mientras se proyecta). |
| **Solo mismo origen** | `BroadcastChannel` funciona entre ventanas del mismo origen — suficiente para `window.open` de una ruta propia. |

---

## Decisiones actuales que NO deben romperse

Estas propiedades de la codebase son las que hacen viable la proyección; cualquier refactor debe conservarlas:

1. **Compile puro y serializable** — `lib/chain-compiler.ts` debe seguir produciendo un **string** de código Hydra a partir de pads, sin depender de instancias, closures, DOM ni WebGL. Es lo que permite mandar el código por `BroadcastChannel` y re-evaluarlo en otra ventana.
2. **Evaluador desacoplado del canvas principal** — `createHydraEvaluator(canvas, options)` en `lib/chain-evaluator.ts` debe seguir aceptando **cualquier** `HTMLCanvasElement` y no asumir que corre en `hydra-canvas.tsx`. No mover lógica de evaluación al componente.
3. **`compiledCode` como fuente de verdad serializable** — el store expone el código compilado final (multi-output, con `render(...)` cuando aplica); la proyección solo necesita ese string + `editingOutput`. No introducir estado imperativo del canvas que la proyección no pueda reconstruir.
4. **`markSafeCode` guarda solo `compiledCode`** (decisión de Fase 1) — nunca una preview; la proyección jamás debe recibir `previewCode`.

---

## Steps (cuando se implemente)

1. Crear `app/launchpad/projection/page.tsx`: client component con un canvas fullscreen (`h-screen w-screen bg-black`), sin ninguna otra UI.
2. Montar `createHydraEvaluator` sobre ese canvas (mismo patrón que `hydra-canvas.tsx`, sin overlays ni favoritos).
3. Suscribirse a `BroadcastChannel("hydra-projection")`; en cada mensaje, `run(compiledCode)` y asegurar `render(focusedOutput)`.
4. En el launchpad: publicar `{ compiledCode, focusedOutput: editingOutput }` en cada cambio, y agregar botón "project" que hace `window.open("/launchpad/projection", ...)`.
5. Manejar handshake inicial (la proyección anuncia que abrió; el launchpad reenvía el estado actual).
6. Actualizar este skill: cambiar estado a implementado y documentar el contrato real.

## Failure Modes (anticipados)

| Issue | Solution |
|-------|----------|
| Proyección negra al abrir | Falta handshake inicial: el launchpad debe reenviar el estado al detectar la nueva ventana |
| Proyección muestra los 4 outputs | El código llega con `render()` de grid; la proyección debe forzar `render(focusedOutput)` |
| Feedback `src(oN)` se ve distinto | Esperado: buffers independientes por ventana; converge con el tiempo, no es bug |
| Popup bloqueado | `window.open` debe dispararse desde un click directo del usuario |

## Composition Notes

- **Depends on**: `lib/chain-evaluator.ts` (evaluador reutilizable), `lib/chain-compiler.ts` (compile puro), `stores/chain-store.ts` (`compiledCode`, `editingOutput`)
- **Related**: `skills/launchpad-components.skill.md` (arquitectura general), `hydra-canvas.tsx` (fullscreen actual, patrón de montaje del evaluador)
- **Plan de origen**: Fase 5 de "Mejoras launchpad: preview y UI"
