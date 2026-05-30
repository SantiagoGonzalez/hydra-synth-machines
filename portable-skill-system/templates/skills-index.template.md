# Skills Index

> Lightweight registry of all available skills. Use this to discover the right skill without loading every file.
>
> **Project:** {{PROJECT_NAME}} | **Last updated:** {{DATE}} | **Total skills:** 4
>
> **Skill directory:** `{{SKILL_DIR}}`

---

## Categories

### Meta Skills

Skills that govern creation, evaluation, and organization of other skills.

| Skill | Path | Level | Purpose | Tags |
|-------|------|-------|---------|------|
| Create Skills | `meta/create-skills.skill.md` | meta | Template and standard for generating new reusable skill files | `skill-authoring`, `template`, `standard` |
| Evaluate Skill Quality | `meta/evaluate-skill-quality.skill.md` | meta | Evaluate and improve a skill across 7 quality criteria | `evaluation`, `quality`, `improvement` |
| Organize Skill System | `meta/organize-skill-system.skill.md` | meta | Maintain and update the skills index; acts as router before skill selection | `index`, `registry`, `router`, `organization` |
| Scan Skills | `meta/scan-skills.skill.md` | meta | Discover and index all markdown files in a directory; full index rebuild | `scan`, `discovery`, `indexing`, `rebuild` |

### Architecture & Decision Skills

Reference and decision-making skills that inform *what* to build and *how* it fits together.

| Skill | Path | Level | Purpose | Tags | Composes With |
|-------|------|-------|---------|------|---------------|
| _(add your architecture skills here)_ | | | | | |

### Build Skills

Atomic skills that produce concrete code artifacts.

| Skill | Path | Level | Purpose | Tags | Composes With |
|-------|------|-------|---------|------|---------------|
| _(add your build skills here)_ | | | | | |

---

## Intent → Skill Router

| If you need to... | Use skill(s) |
|--------------------|-------------|
| Create a new skill from scratch | `create-skills` |
| Evaluate or improve an existing skill | `evaluate-skill-quality` |
| Organize or index skills incrementally | `organize-skill-system` |
| Discover and index existing files in a directory | `scan-skills` |
| Re-index all skills from scratch | `scan-skills` |
| _(add your project-specific routes here)_ | |

---

## Composition Graph

```
              ┌──────────────────────────────────┐
              │          META SKILLS             │
              │  create-skills                   │
              │  evaluate-skill-quality          │
              │  organize-skill-system           │
              └────────────┬─────────────────────┘
                           │ governs
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │ Architecture│   │ Architecture│   │   Build     │
  │  Skill A    │   │  Skill B    │   │  Skill C    │
  └─────────────┘   └─────────────┘   └─────────────┘

(A) = Atomic   (C) = Composite   Meta = controls other skills
```

---

## How to Update This Index

1. **Adding a skill:** Append a row to the correct category table, add an intent row if applicable, and bump the total count in the header.
2. **Modifying a skill:** Update its purpose/tags row only if the change affects discovery (name, purpose, or tags changed).
3. **Removing a skill:** Delete its row, remove from the router and graph, and decrement the count.

> Use the `organize-skill-system` meta skill to automate index maintenance.
