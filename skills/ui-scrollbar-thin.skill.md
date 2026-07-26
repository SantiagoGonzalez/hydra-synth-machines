# Skill: ui-scrollbar-thin

## Purpose
Clase CSS reutilizable para scrollbars minimalistas (horizontal o vertical). Aplicar en contenedores con `overflow-auto` / `overflow-x-auto` / `overflow-y-auto`.

## Inputs
- Contenedor que necesita scroll estilizado
- Dirección: horizontal, vertical o ambas

## Outputs
- Clase `scrollbar-thin` en el elemento con overflow

## Preconditions
- Estilos globales en `app/globals.css`
- No usar en elementos Radix que renderizan scroll propio (`ScrollArea`) sin verificar compatibilidad

---

## Definition

**Archivo**: `app/globals.css` (después de `.code-inline`)

```css
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: oklch(0.4 0.02 264 / 0.5) transparent;
}

.scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: oklch(0.4 0.02 264 / 0.5);
  border-radius: 9999px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: oklch(0.5 0.02 264 / 0.7);
}
```

- **Firefox**: `scrollbar-width` + `scrollbar-color`
- **WebKit**: pseudo-elementos `::-webkit-scrollbar*`
- Thumb neutro translúcido — compatible con fondos de categoría del launchpad

---

## Usage

```tsx
<div className="overflow-x-auto scrollbar-thin">...</div>
<div className="overflow-y-auto scrollbar-thin">...</div>
```

### Current applications

| Component | Overflow | Applied |
|-----------|----------|---------|
| `chain-preview.tsx` | horizontal | yes |
| `param-panel.tsx` | vertical | candidate |
| `pad-band.tsx` | vertical | candidate |
| `favorites-dialog.tsx` | vertical | candidate |

---

## Steps

1. Identificar contenedor con overflow nativo (no Radix ScrollArea)
2. Agregar `scrollbar-thin` junto a la clase overflow existente
3. Verificar que el thumb es visible sobre el fondo del contenedor
4. No duplicar estilos inline de scrollbar en componentes

---

## Heuristics

- Clase **global plana** — no `@apply` Tailwind (pseudo-elementos no soportados)
- Combinar con `min-w-0` / `min-h-0` en padres flex/grid para que el scroll aparezca
- 6px — balance entre minimalismo y área de arrastre
- Track transparente — el scroll no compite visualmente con el contenido

---

## Failure Modes

| Issue | Fix |
|-------|-----|
| Scrollbar nativo grueso persiste | clase en el elemento con overflow, no en el hijo |
| No visible en Firefox | verificar `scrollbar-color` contrast |
| Doble scrollbar | overflow en contenedor incorrecto |

---

## Composition Notes

- **Launchpad**: usado en ChainPreview; extensible a otras zonas
- **Docs page**: `code-block overflow-x-auto` — candidato futuro
