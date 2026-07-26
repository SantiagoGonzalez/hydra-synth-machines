# Skill: launchpad-layout

## Purpose
Guía para el shell de layout del launchpad: viewport fijo de 3 zonas, proporciones, scroll interno y constraints desktop-only. Referencia para cambios en `app/launchpad/page.tsx` y columnas hijas.

## Inputs
- Ajustes de proporciones (canvas vs params vs banda de pads)
- Nuevos elementos de chrome (header/footer)
- Problemas de overflow o scroll de página

## Outputs
- Layout estable sin scroll de página; cada zona scrollea internamente

## Preconditions
- Spec visual: `components/launchpad/layout-reference.txt`
- Tailwind v4; tema en `app/globals.css`

---

## Zone Map

```
┌─────────────────────────────────────────────────────────┐
│ header (h-9, shrink-0) — back, title, favorites dialog  │
├──────────────────────────────┬──────────────────────────┤
│ StageColumn (~68%)           │ ParamPanel (30%, min 380) │
│  ├ HydraCanvas (16:9)        │  ├ detail pad             │
│  └ ChainPreview (compact)    │  ├ active chips           │
│                              │  └ GlobalFaders           │
├──────────────────────────────┴──────────────────────────┤
│ PadBand (1fr) — tabs + grilla 8×2                       │
├─────────────────────────────────────────────────────────┤
│ footer (cheatsheet teclado)                             │
└─────────────────────────────────────────────────────────┘
```

### CSS Grid (page.tsx)

```tsx
<div className="hidden lg:flex h-screen flex-col overflow-hidden">
  <header className="shrink-0 h-9" />
  <main className="flex-1 min-h-0 grid grid-rows-[2fr_1fr]">
    <div className="min-h-0 grid grid-cols-[1fr_minmax(380px,30%)] gap-3 p-3">
      <StageColumn />
      <ParamPanel />
    </div>
    <PadBand />
  </main>
  <footer className="shrink-0" />
</div>
```

### Critical Classes

| Clase | Dónde | Por qué |
|-------|-------|---------|
| `h-screen overflow-hidden` | root | sin scroll de página |
| `min-h-0` | main, grid rows, flex children | permite shrink en flex/grid |
| `min-w-0` | StageColumn | evita que ChainPreview nowrap empuje el grid |
| `flex-1 min-h-0` | scroll areas | altura definida para hijos `h-full` |
| `shrink-0` | header, footer, ChainPreview | no comprimir chrome |

---

## Zone Details

### StageColumn
- `flex flex-col min-h-0 min-w-0`
- Canvas: `flex-1 min-h-0 flex items-center justify-center`
- HydraCanvas wrapper: `w-full h-auto max-h-full aspect-video` (letterbox 16:9)
- ChainPreview: `compact` prop, `shrink-0`, scroll horizontal con `scrollbar-thin`

### ParamPanel
- `overflow-y-auto` + `scrollbar-thin` (candidato — ver `param-panel.skill.md`)
- Ancho: `minmax(380px, 30%)` del grid superior

### PadBand
- Tab bar: `shrink-0`
- Grid area: `flex-1 min-h-0 overflow-y-auto`
- PadGrid: `h-full` + filas `minmax(56px, 1fr)`

---

## Desktop Gate

```tsx
<div className="lg:hidden fixed inset-0 z-50 ...">
  Hydra Launchpad requires a desktop viewport (≥1024px).
</div>
```

No hay layout mobile alternativo; solo aviso.

---

## Heuristics

- **No sticky canvas** — eliminado; viewport fijo hace innecesario `isSticky`
- **Favorites en dialog** — no ocupa columna; trigger en header
- **Chain badges** — removidos de ChainPreview compact; viven en ParamPanel chips
- **Proporción 2fr/1fr** — superior vs banda pads; ajustable si la grilla necesita más alto
- **Canvas limitado por alto** — más ancho en params no reduce canvas visible (letterbox)

---

## Steps (adjust layout)

1. Identificar qué zona tiene overflow (página vs interno)
2. Si scroll de página → falta `min-h-0` o `overflow-hidden` en ancestro
3. Si contenido cortado → revisar `fr` ratios o `MIN_ROW_PX` en pad-grid
4. Si columna empuja horizontalmente → `min-w-0` + scroll en hijo ancho

---

## Failure Modes

| Issue | Fix |
|-------|-----|
| Scroll de página entero | `h-screen overflow-hidden` + `min-h-0` chain |
| Canvas deformado | mantener `aspect-video` + `max-h-full` |
| Params muy angostos | subir min en `minmax(380px, 30%)` |
| Grilla 1 fila | ver `pad-band-and-grid` skill |

---

## Composition Notes

- **Spec**: `components/launchpad/layout-reference.txt`
- **Components**: `stage-column.tsx`, `param-panel.tsx`, `pad-band.tsx`, `page.tsx`
- **Related**: `pad-band-and-grid`, `ui-scrollbar-thin`
