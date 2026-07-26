# Skill: section-rows-and-add-pad

> **OBSOLETO** — Reemplazado por [`pad-band-and-grid.skill.md`](pad-band-and-grid.skill.md) (2026-07).
>
> El layout de secciones apiladas (`SectionRow`, `FunctionGroup`, `machine-layout.tsx`) fue sustituido por la banda inferior con tabs y grilla 8×2 (`PadBand`, `PadTabBar`, `PadGrid`).
>
> **AddPad** y el modelo **PadSlot** siguen vigentes; ver `pad-band-and-grid.skill.md` y `launchpad-components.skill.md`.

## Migration map

| Antes | Ahora |
|-------|-------|
| `machine-layout.tsx` | `pad-band.tsx` + `param-panel.tsx` + `global-faders.tsx` |
| `section-row.tsx` | `pad-tab-bar.tsx` + `pad-grid.tsx` |
| `padModes` (local state) | `setSlotMode` en `chain-store` |
| Param panel embebido en MachineLayout | `param-panel.tsx` (columna derecha) |
| FavoritesLibrary inline | `favorites-dialog.tsx` (header) |

Consultar skills actuales:
- `skills/pad-band-and-grid.skill.md`
- `skills/launchpad-layout.skill.md`
- `skills/launchpad-components.skill.md`
