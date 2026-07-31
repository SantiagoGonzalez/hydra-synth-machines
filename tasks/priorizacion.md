# Plan de priorización — complemento al backlog

> **Fecha:** 2026-07-31 (oleada estratégica — épicas)  
> **Fuente:** [`backlog.md`](./backlog.md)  
> **Generado por:** hydra-prioritizer  
> **Propósito:** slices para hydra-planner → `todo.md`

---

## Criterios de priorización (esta oleada)

**Cambio de foco:** Fase 0 quick wins **cerrada** (A-02, B-01, C-04, C-05, G-01, G-02, H-01, H-02, H-03, D-01). Ya no quedan ítems S sueltos: esta oleada ordena **épicas completas** en el roadmap. El criterio "esfuerzo S" deja de pesar; pesa el **impacto en el show en vivo** y las **specs ya escritas**.

| Criterio | Peso |
|----------|------|
| Impacto VJ / show en vivo (proyección, audio, escena) | Alto |
| Spec en `docs/planning/` o `skills/` | Alto |
| Desbloquea épicas posteriores | Alto |
| Esfuerzo M acotado con slice claro | Medio |
| Decisiones abiertas con default usable | Medio |

**Posponer por defecto:** épicas L (subchains) y K (scene bank) completas, C-01/C-02 (L, parser dual), I-01 (sin destino de docs), J-06/J-07 (investigación), D-04/D-09 (L / baja prioridad).

---

## Mapa macro — orden de épicas / fases

```
HOY (próximas 2–3 oleadas de implementación)
├── Fase 0b — G-07 RGB (HEX + picker + sliders)      ← spec en param-panel-redesign.md; M; alta
├── Fase 0c — J-01→J-03 audio MVP (mic + modo ♪)     ← spec en audio-reactivity.md; impacto VJ máximo
└── Fase 1  — Core VJ proyección
    ├── D-03 ventana proyección                      ← ready; skills/projection.skill.md
    ├── D-02 editar oN mientras se proyecta oM       ← decisión #2 con default
    ├── D-06 dimmer / blackout                       ← depende D-03; projection-controls.md
    ├── D-05 + H-04 setResolution proyector          ← par natural; cierra Epic H
    └── C-03 overlay código sobre canvas             ← S–M; reutiliza chain-preview

SPIKE / SIGUIENTE (preparar, no abrir todavía)
├── G-06 + G-04 (+G-03) migración faders verticales  ← lección: NO piloto aislado; épica completa
├── D-07 PNG vía initImage/src(sN)                   ← puerta a D-08; decisión #12 default
└── J-04, J-05 audio polish (panel global, sync FFT) ← J-05 depende D-03

POSPONER (fases 2–4; no trocear aún)
├── B-02/B-03/B-04 design system + temas             ← Fase 2; E-02 depende de B-02
├── E-01/E-02 rediseño pads                          ← Fase 2; tras B-02
├── F-01/F-02 onboarding                             ← Fase 2; decisión #7 con default
├── L-01→L-07 subchains                              ← Fase 2–3; decisión #13; épica entera
├── K-01→K-05 scene bank                             ← Fase 3; depende D-03/D-06
├── D-08/D-09 capas DOM + biblioteca assets          ← Fase 3; tras D-07
├── C-01/C-02 editor código / live coding            ← L; requiere modelo pads↔código
├── I-02 favicon                                     ← requiere asset del usuario
├── J-06/J-07 audio sistema / beat trigger           ← investigación; baja
└── I-01 gitignore docs                              ← Fase 4; decisión #8 sin destino
```

**Orden de épicas recomendado (macro):** 1) G-07 → 2) J audio MVP → 3) D proyección core (+C-03, H-04) → 4) G vertical (G-06/G-04) → 5) B design system → 6) E pads → 7) F onboarding → 8) L subchains MVP → 9) K scene bank → 10) D-08/D-09 assets → 11) I repo.

---

## Roadmap — orden sugerido de bloques

Bloques por **épica o slice M**, no quick wins. Dependencias explícitas; cada oleada de implementación = 1–2 bloques.

| # | Bloque | ID | Esfuerzo | Dependencias | Entregable |
|---|--------|-----|----------|--------------|------------|
| 1 | RGB: HEX + picker + sliders | G-07 | M | Ninguna (decisión #9 con default) | Tres vías conviven en param panel para `solid`/`color` |
| 2 | Audio motor + mic UI | J-01, J-02 | S+S | Ninguna (decisión #10 con default) | `detectAudio` + `a` en whitelist; toggle mic + show/hide FFT |
| 3 | Modo ♪ en params | J-03 | M | Bloque 2 | `ParamValue` modo audio; compilador emite `() => a.fft[i]*scale` |
| 4 | Ventana de proyección | D-03 | M | Ninguna (`ready`, skill lista) | Segunda ventana proyecta output elegido |
| 5 | Editar oN / proyectar oM | D-02 | M | Bloque 4 (decisión #2) | `editingOutput` ≠ `projectedOutput` sin cortar proyección |
| 6 | Dimmer / blackout | D-06 | S–M | Bloque 4 | Fader dimmer + blackout sobre proyección |
| 7 | Resolución proyector | D-05 + H-04 | M | Bloque 4 | `setResolution` / pixel ratio en modo proyector; cierra Epic H |
| 8 | Overlay código en canvas | C-03 | S–M | Ninguna | Toggle overlay `chain-preview` sobre canvas (estética live coding) |
| 9 | Migración faders verticales | G-06 + G-04 (incluye G-03) | M–L | Bloque 1 (mismo panel) | Panel params vertical + primitiva `ParamFader` compartida |
| 10 | Audio polish | J-04, J-05 | S–M + M | Bloques 2–3; J-05 ← bloque 4 | Panel global audio; FFT sync a proyección |

**Meta realista próxima oleada de implementación:** bloques **1–3** (cierra Fase 0b + 0c). La siguiente: bloques **4–6** (núcleo Fase 1). Bloque 9 recién cuando G-07 esté estable (evitar migrar layout y color a la vez).

---

## Accionables detallados (input para planner)

### G-07 — RGB: HEX + color picker + sliders (bloque 1)

**Problema:** editar color en `solid`/`color` es fader por canal a ciegas; no hay picker ni HEX.

**Archivos probables:**
- `components/launchpad/pad-param-panel.tsx` — integrar vías de color
- `components/launchpad/param-slider.tsx` — sliders RGB existentes
- Nuevo `components/launchpad/color-param.tsx` (o similar, kebab-case) — HEX + `<input type="color">`
- Spec: `docs/planning/param-panel-redesign.md`

**Criterio de hecho:**
- [ ] Para pads `solid` y `color`: HEX, picker nativo y sliders conviven y quedan sincronizados
- [ ] Sin alpha en v1 (default #9); picker clamp a [0,1] en `color()`
- [ ] Sliders por canal siguen funcionando (sin regresión)

**Fuera de scope:** faders verticales (G-06), stepper (G-05), paletas guardadas.

**→ confirmar archivos: planner** (verificar cómo detecta el panel que un grupo de params es RGB).

---

### J-01 + J-02 — Motor audio + mic UI (bloque 2)

**Problema:** Hydra soporta mic + `a.fft[]` pero el launchpad tiene `detectAudio: false` y `a` fuera de la whitelist del evaluador.

**Archivos probables:**
- `lib/chain-evaluator.ts` (o equivalente) — `detectAudio: true` condicional + `a` en whitelist
- `components/launchpad/hydra-canvas.tsx` — init audio opt-in
- `components/launchpad/global-faders.tsx` o `param-panel.tsx` — toggle mic + botón show/hide FFT (`a.show()`/`a.hide()`)
- Spec: `docs/planning/audio-reactivity.md`

**Criterio de hecho:**
- [ ] Mic **opt-in** explícito (default #10): sin toggle, no hay pedido de permisos
- [ ] Con mic activo, `a.fft` disponible en el evaluador; `a.show()` visualiza FFT
- [ ] Denegar permiso no rompe el canvas

**Fuera de scope:** modo ♪ en params (J-03), audio de sistema/OSC (J-06), beat trigger (J-07).

---

### J-03 — Modo audio en `ParamValue` (bloque 3)

**Problema:** los params solo aceptan valor fijo o `fn(time)`; no hay vía para mapear un param a una banda FFT.

**Archivos probables:**
- Tipo `ParamValue` (store/tipos de cadena) — variante `audio` con `{ bin, scale }`
- `lib/chain-compiler.ts` — emitir `() => a.fft[bin] * scale`
- `components/launchpad/param-slider.tsx` / `pad-param-panel.tsx` — toggle ♪ por param
- Spec: `docs/planning/audio-reactivity.md`

**Criterio de hecho:**
- [ ] Cualquier param numérico puede alternar fijo / ♪ (bin + scale)
- [ ] Cadena compilada reacciona al audio en vivo; sin mic el modo ♪ degrada a valor base sin error
- [ ] Favoritos serializan el modo audio sin romper favoritos viejos

**Fuera de scope:** panel global de bins/smooth (J-04), sync a proyección (J-05).

**→ confirmar archivos: planner** (nombres reales de store/compilador y patrón `fn(time)` existente a imitar).

---

### D-03 — Ventana de proyección (bloque 4)

**Problema:** no hay salida limpia para proyector; el VJ muestra la UI completa.

**Archivos probables:**
- Spec de implementación: `skills/projection.skill.md` (estado `ready` — seguirla, no re-diseñar)
- Nueva ruta/ventana + sync de estado (canal a definir en la skill)
- `components/launchpad/hydra-canvas.tsx` — render del output proyectado

**Criterio de hecho:**
- [ ] Segunda ventana muestra solo el canvas del output proyectado, sin UI
- [ ] Cerrar/reabrir la ventana no rompe el stage

**Fuera de scope:** dimmer (D-06), resolución (D-05/H-04), FFT sync (J-05), capas DOM (D-08).

---

### D-02 — Editar oN mientras se proyecta oM (bloque 5)

**Problema:** editar corta lo que ve el público; hay que separar `editingOutput` de `projectedOutput`.

**Archivos probables:**
- `stores/chain-store.ts` — `projectedOutput` independiente de `editingOutput`
- UI de tabs de outputs (hydra-canvas / stage) — indicador "en proyección"

**Criterio de hecho:**
- [ ] Cambiar de output en edición no altera lo proyectado
- [ ] Default #2: output proyectado **elegible** desde la UI, con indicador visible

**Fuera de scope:** transiciones entre escenas (K-05).

---

### D-06 — Dimmer / blackout (bloque 6)

**Problema:** no hay forma de bajar a negro la proyección sin matar la cadena.

**Archivos probables:**
- Capa DOM sobre el canvas de proyección + fader dedicado
- Spec: `docs/planning/projection-controls.md`

**Criterio de hecho:**
- [ ] Fader dimmer 0–100% + botón blackout instantáneo en la ventana de control
- [ ] Default #3: solo proyección en v1 (stage no se atenúa)

**Fuera de scope:** transiciones automáticas (K-05).

---

### G-06 + G-04 — Migración faders verticales (spike próximo, bloque 9)

**Problema:** panel horizontal apretado; spec propone verticales. **Lección 2026-07-31:** el piloto aislado G-03 se descartó — un solo fader vertical mezclado con horizontales no valida nada; migrar el panel **completo** o no migrar.

**Archivos probables:**
- `components/launchpad/param-slider.tsx` → primitiva `param-fader.tsx` compartida (G-04)
- `components/launchpad/pad-param-panel.tsx`, `global-faders.tsx` — consumidores
- Spec: `docs/planning/param-panel-redesign.md`

**Criterio de hecho:** panel completo en vertical con `ParamFader` reutilizada por pad params y globals; `source-selector.tsx` intacto (referencia de claridad).

**Fuera de scope:** stepper (G-05); usar la primitiva en proyección (llega con D-06 si coincide).

---

## Lo que NO es esta oleada

| ID / Épica | Por qué esperar |
|------------|-----------------|
| L-01→L-07 subchains | Épica entera M×4+; decisión #13 (drawer vs inline); mejor tras panel vertical G-06 |
| K-01→K-05 scene bank | Segundo modo UI completo; depende de proyección estable (D-03/D-06) |
| C-01 / C-02 editor + live coding | L; exige modelo pads↔código (parser round-trip) que no existe |
| B-02/B-03/B-04 design system | Fase 2; no bloquea show en vivo; hacer antes de E-02 |
| E-01/E-02 rediseño pads | Depende B-02; cosmético frente a proyección/audio |
| F-01/F-02 onboarding | Fase 2; sin usuarios nuevos urgentes |
| D-04 escena > canvas | L; baja; reemplazado en corto plazo por D-07/D-08 |
| D-08/D-09 capas DOM + assets | Fase 3; tras D-07 y proyección |
| J-06/J-07 audio sistema / beat | Investigación; mic-only en v1 |
| I-01 gitignore docs | Decisión #8 sin destino de docs; contradice B/F si se hace antes |
| I-02 favicon | Requiere asset gráfico del usuario; no planificable |

---

## Decisiones — defaults para avanzar

Decisiones abiertas #2–#13 del backlog (la #1 ya está cerrada):

| # | Pregunta | Default propuesto |
|---|----------|-------------------|
| 2 | D-02: output proyectado fijo o elegible | **Elegible** desde UI; arranca en `o0`; indicador visible |
| 3 | D-06: dimmer solo proyección o también stage | **Solo proyección** en v1 (ver `projection-controls.md`) |
| 4 | G-03: faders verticales en todo el panel | **Cerrada por lección** — sin piloto; migración completa con G-06 |
| 5 | H-02: brightness CSS vs `.brightness()` | **Cerrada** — CSS implementado (H-02 done) |
| 6 | C-01: editor por output o multi-buffer | Por output en v1 — pero épica pospuesta; no bloquea |
| 7 | F-01: tutorial obligatorio u opt-in | **Opt-in** (botón ayuda); nunca bloquear el stage |
| 8 | I-01: destino de la doc fuera del repo | Sin default — **posponer I-01** hasta confirmar destino |
| 9 | G-07: HEX con alpha; clamp picker | **Sin alpha en v1**; picker clamp [0,1] para `color()` |
| 10 | J: audio opt-in, bins, mic-only | **Opt-in explícito; mic-only v1; bins default 4** (`audio-reactivity.md`) |
| 11 | K: una escena activa o varias | Una activa en v1 — épica pospuesta |
| 12 | D-07 vs D-08: PNG en Hydra o capa DOM | **D-07 primero** (PNG vía `initImage`/`src(sN)`); D-08 en Fase 3 |
| 13 | L: drawer vs inline; modulate anidado | Inline (lista en param panel) v1; sin modulate anidado — épica pospuesta |

**Requiere confirmación del usuario antes de codear:**
- **#2** — ¿output proyectado elegible OK, o preferís fijarlo a `o0`? (afecta bloque 5)
- **#10** — defaults de audio (opt-in, mic-only, bins=4) antes de bloques 2–3
- **#3** — dimmer solo en proyección (afecta bloque 6)

---

## Prompt sugerido para planner

```
/hydra-planner

@tasks/backlog.md @tasks/priorizacion.md @tasks/lessons.md

Double-check bloques 1–3 de priorizacion.md (oleada Fase 0b + 0c: G-07 RGB + J-01/J-02/J-03 audio MVP).
Escribí tasks/todo.md con Decisión/Descartado/Riesgos por bloque.
Confirmá rutas reales (color en param panel, evaluador/whitelist, tipo ParamValue) y el patrón fn(time) a imitar en J-03.
No implementes código de la app.
```

---

## Seguimiento

| Documento | Rol |
|-----------|------|
| `backlog.md` | Inventario completo, épicas, fases roadmap |
| `priorizacion.md` | **Este doc** — orden de épicas y próximos bloques |
| `todo.md` | Checklist de sesión activa (marcar al implementar) |
| `lessons.md` | Patrones post-corrección |

**Cerrado en Fase 0 (no rehacer):** A-02, B-01, C-04, C-05, G-01, G-02, H-01, H-02, H-03, D-01. A-01 cancelado.

**Próximo paso:** `/hydra-planner` con bloques **1–3** → generar `todo.md` → implementer.
