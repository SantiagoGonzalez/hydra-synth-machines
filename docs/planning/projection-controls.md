# Controles de proyección y composición de escena

> Estado: **planificación**. Complementa `skills/projection.skill.md` (ventana de proyección aún no implementada).

---

## Objetivo

Controles orientados al **performer** durante show: ajustar lo que ve el público sin dejar de editar otra salida en el launchpad.

Relacionado con backlog **D-02** (editar oN mientras se proyecta oM) y **D-03** (ventana proyección).

---

## Idea: fader de “apagado” / oscurecimiento de escena

Oscurecer la imagen proyectada — transición suave tipo blackout o dimmer de sala.

### Enfoque A — Capa DOM sobre el canvas (recomendado para dimmer)

```
┌─────────────────────────────┐
│  canvas WebGL (Hydra)       │
│  ┌─────────────────────────┐│
│  │ overlay opacity/black   ││  ← CSS: bg-black + opacity 0–1
│  └─────────────────────────┘│
└─────────────────────────────┘
```

| Pro | Contra |
|-----|--------|
| No recompila shader; instantáneo | No es “parte del patch” Hydra |
| Funciona igual en launchpad y ventana proyección | No graba en favoritos/código |
| Ideal para blackout entre escenas | No afecta buffers `o0`–`o3` internos |

**Implementación probable:**
- `projectionDimmer: number` (0 = full bright, 1 = negro) en store
- Overlay en `hydra-canvas.tsx` y en `projection/page.tsx`
- Sincronizar vía `BroadcastChannel` junto con `compiledCode`

### Enfoque B — Hydra `brightness()` / `solid` en cadena

| Pro | Contra |
|-----|--------|
| Parte del patch exportable | Requiere recompile; más lento para blackout live |
| Consistente con código | Mezcla “performance control” con composición |

**Recomendación:** dimmer de performance = **capa DOM**; gradaciones creativas = pads de color/brightness en la chain.

---

## Controles propuestos (proyección)

| Control | Tipo | Alcance | Prioridad |
|---------|------|---------|-----------|
| **Dimmer** | Fader 0–1 (negro) | Overlay proyección + preview stage | Alta |
| **Output proyectado** | Selector o0–o3 | Qué buffer ve el público (D-02) | Alta |
| **Master gain** | Fader opcional | Opacidad canvas (alternativa a dimmer) | Media |
| **Freeze frame** | Toggle | Pausar evaluador en proyección | Baja (futuro) |

Ubicación UI candidata:
- Barra sobre el **stage** en launchpad (junto a fullscreen / project)
- Réplica mínima en ventana proyección (solo si hace falta; preferir control desde launchpad)

---

## Relación con “escena compuesta”

- **Proyección** = lo que sale al público (`projectedOutput` + dimmer).
- **Stage** = preview del performer (puede mostrar grid, otro output, overlays).
- Dimmer no sustituye composición multi-buffer; es capa de **performance**.

Ver vocabulario: `docs/glosario-hydra.md`.

---

## Fases

1. **D-03** — ventana proyección + `BroadcastChannel`
2. **D-02** — `projectedOutput` ≠ `editingOutput`
3. **D-06** — dimmer DOM + fader en UI stage
4. (Opcional) MIDI learn en misma capa que `launchpad-controls.ts`

---

## Decisiones abiertas

1. ¿Dimmer afecta solo proyección o también el canvas del launchpad?
2. ¿Valor por defecto al abrir proyección (dimmer = 0)?
3. ¿Atajo de teclado para blackout rápido (ej. `Shift+Esc`)?
