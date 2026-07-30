# Glosario Hydra ↔ launchpad

Vocabulario compartido para documentación, UI y tutorial. **“Escena” no es término oficial de Hydra** — usar los nombres de esta tabla en specs y copy.

Referencias: [Hydra Functions](https://hydra.ojack.xyz/functions/), [`hydra-skills-index`](./hydra-skills-index/index.md), [`vj-synth-conceptual.md`](./vj-synth-conceptual.md).

---

## Términos Hydra (oficiales)

| Término | Qué es |
|---------|--------|
| **Sketch / patch** | Código completo que corre en el synth cada frame |
| **Chain** | Secuencia de llamadas encadenadas con `.` hasta `.out()` |
| **Buffer** | Textura intermedia `o0`, `o1`, `o2`, `o3` |
| `.out()` / `.out(oN)` | Escribe la cadena en el buffer principal o en `oN` |
| `src(oN)` | Lee un buffer como fuente en otra cadena |
| `render()` / `render(oN)` | Qué buffer(s) se muestran en el canvas |
| **Source** | Generador inicial (`osc`, `noise`, `voronoi`, …) |
| **Modulate** | Función que toma una textura moduladora como primer argumento |

Ver también: [`synth-settings`](./hydra-skills-index/synth-settings/synth-settings.md), [`src`](./hydra-skills-index/sources/src.md).

---

## Términos del launchpad (esta app)

| Concepto | Nombre en UI/docs | Implementación |
|----------|-------------------|----------------|
| Botón de función en la grilla | **Pad** | `PadSlot` / `ActivePad` en `chain-store` |
| Lista ordenada de pads activos en un buffer | **Chain** (cadena) | `activePads[]` por output |
| Buffer que se está editando | **Output** (o0–o3) | `editingOutput` |
| Código generado | **Compiled code** | `compiledCode` vía `chain-compiler.ts` |
| Vista de performance al público | **Proyección** | Spec: `skills/projection.skill.md` (pendiente) |
| Área del canvas en el layout | **Stage** | `stage-column.tsx` |
| Pad armado para preview antes de apply | **Armed** | `armedSlotId` + preview en store |
| Pad activo pero sin audio en compile | **Bypass** | `isBypassed` — no emite fragmento |
| Quitar slot de la grilla | **Remove slot** | `removeSlot` — distinto de bypass |

---

## Mapeo coloquial → término correcto

| Decís… | Mejor decir… |
|--------|--------------|
| “Escena principal” | **Proyección** o **output proyectado** (`projectedOutput`, futuro) |
| “Armo la escena en o2” | **Cadena de o2** o **edito el output o2** |
| “La función blend” | **Pad blend** o **función `blend`** del registro Hydra |
| “Desactivar de la cadena” | **Bypass** (mute en compile) o **quitar de cadena** (`removeSlot`) — no son lo mismo |
| “Pantalla del público” | **Ventana de proyección** o **canvas en fullscreen** |

---

## Composición multi-buffer (ejemplo mental)

```js
// Cadena en o1
osc(40, 0.1).out(o1)

// Cadena en o0 lee o1 y mezcla
src(o1).add(osc(10), 0.5).out(o0)

render(o0)   // solo o0 al público
```

En el launchpad: cada output tiene su propia chain de pads; los blends pueden usar `src:o1`…`src:o3` como fuente secundaria.

---

## Pendiente en UI

- [ ] Tooltips con estos términos (outputs, chain, bypass, proyección)
- [ ] Enlazar desde modal de bienvenida (Epic F en `tasks/backlog.md`)
