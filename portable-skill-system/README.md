# Portable Skill System

A self-contained, project-agnostic skill system for AI coding agents. Drop it into any project to give your agent structured, discoverable, composable knowledge.

---

## What Is This?

A **skill** is a markdown file that teaches an agent how to perform a reusable task — with decision points, error handling, and composition notes. This system provides:

1. **Three meta skills** that govern the skill lifecycle (create → evaluate → organize)
2. **An index template** so skills are discoverable without flooding context
3. **An IDE integration snippet** so the agent knows to use the index
4. **A setup skill** so the agent can bootstrap everything automatically in any project

### Architecture

```
META LAYER  ─────────────────────────────────────────────────────
  create-skills          → define new reusable skills
  evaluate-skill-quality → improve existing skills
  organize-skill-system  → maintain the index; route requests

ARCHITECTURE LAYER  ──────────────────────────────────────────────
  (your project skills: reference, decision, data flow)

BUILD LAYER  ─────────────────────────────────────────────────────
  (your project skills: code artifacts, components, services)
```

The agent always **reads the index first**, loads only the relevant skill, executes it. No full skill-set context load.

---

## Quick Start

### Option A — Agentic (recommended)

Copy this folder into your project, then ask your agent:

```
Follow portable-skill-system/setup.skill.md
```

The agent will auto-detect your IDE, install the meta skills, scaffold the index, and inject the Skill Usage Protocol into your instruction file.

### Option B — Manual

1. **Copy meta skills** to your project's skill directory (default: `/skills/meta/`):
   ```
   cp portable-skill-system/meta/* your-project/skills/meta/
   ```

2. **Scaffold the index** from the template:
   ```
   cp portable-skill-system/templates/skills-index.template.md your-project/skills/skills-index.md
   ```
   Then replace the placeholders in the index:
   - `{{PROJECT_NAME}}` → your project name
   - `{{DATE}}` → today's date
   - `{{SKILL_DIR}}` → your skill directory path (e.g. `/skills`)

3. **Inject the Skill Usage Protocol** into your IDE's instruction file.
   See [`templates/instruction-snippet.md`](templates/instruction-snippet.md) for the snippet and per-IDE instructions.

---

## Supported IDEs

| IDE | Instruction File | Notes |
|-----|-----------------|-------|
| VS Code + GitHub Copilot | `.github/copilot-instructions.md` | Workspace-wide agent instructions |
| Cursor | `.cursorrules` or `.cursor/rules/*.mdc` | Prefer `.cursor/rules/` for new projects |
| Windsurf | `.windsurfrules` | Injected at file end |
| Any (generic) | `AGENTS.md` | Standard format for agent-aware tools |

---

## File Structure

```
portable-skill-system/
├── README.md                              ← you are here
├── setup.skill.md                         ← run once to bootstrap into a project
├── meta/
│   ├── create-skills.skill.md             ← template for new skills
│   ├── evaluate-skill-quality.skill.md    ← 7-criteria skill assessor
│   ├── organize-skill-system.skill.md     ← index manager & skill router
│   └── scan-skills.skill.md               ← discover & index existing markdown files
└── templates/
    ├── skills-index.template.md           ← empty index scaffold
    └── instruction-snippet.md             ← Skill Usage Protocol + per-IDE guide
```

---

## How Skills Are Discovered

The agent follows this protocol on every request:

```
1. Consult skills-index.md   (lightweight — always first)
2. Match intent → skill      (via the Intent Router table)
3. Load only that skill file (targeted context load)
4. Execute the skill         (agentic workflow)
5. If skill is missing  → create-skills
   If skill seems weak  → evaluate-skill-quality
   After adding a skill → organize-skill-system
   To re-index from scratch → scan-skills
```

This keeps context lean as your skill library grows.

---

## Scanning Existing Skills

If your project already has skill or knowledge files, the system can discover and index them automatically.

During setup, you will be asked whether to scan an existing directory. If you choose to scan:
- All `.md` files in the directory are discovered recursively
- Each file is classified (Meta / Architecture & Decision / Build) and assigned an abstraction level
- `skills-index.md` is generated fully from the discovered files
- You choose the extraction depth: **Lightweight** (name + purpose only, fast) or **Full parse** (all metadata)

You can also re-scan at any time without running setup:

> "Follow `skills/meta/scan-skills.skill.md` to re-index `/skills`"

`scan-skills` always does a full rebuild. For adding individual new skills incrementally, use `organize-skill-system` instead.

---

## Creating Your First Project Skill

After setup, ask your agent:

> "I keep doing X manually. Can you create a skill for it?"

The agent will use `create-skills.skill.md` to generate a properly structured skill, then register it in the index via `organize-skill-system`.

Or be explicit:

> "Follow `skills/meta/create-skills.skill.md` to create a skill for [your task]"

### Skill Abstraction Levels

| Level | When to Use | Examples |
|-------|------------|---------|
| `atomic` | Single, focused task that produces one artifact | create a component, add a service |
| `composite` | Multi-step reference or decision workflow | architecture overview, data flow map |
| `meta` | Controls or improves other skills | (already covered by the 3 meta skills) |

---

## Configuration Reference

All configurable values use `{{DOUBLE_BRACE}}` syntax. The setup skill substitutes them automatically; for manual setup, replace them yourself.

| Variable | Default | Description |
|----------|---------|-------------|
| `{{SKILL_DIR}}` | `/skills` | Root directory where skill files are stored |
| `{{INDEX_PATH}}` | `{{SKILL_DIR}}/skills-index.md` | Path to the skills index file |
| `{{PROJECT_NAME}}` | _(directory name)_ | Displayed in the index header |
| `{{DATE}}` | _(today)_ | Last-updated date in the index header |
| `{{SCAN_PATH}}` | `{{SKILL_DIR}}` | Directory scanned by `scan-skills` for existing skill files |

---

## Distributing to Other Projects

This folder is intentionally self-contained. To reuse it:

- **Copy/paste:** `cp -r portable-skill-system/ path/to/new-project/`
- **Git submodule:** `git submodule add <your-repo-url> portable-skill-system`
- **Monorepo:** symlink or share directly across packages

After dropping it in, always run `setup.skill.md` (or follow the manual steps above) — the meta skills themselves are generic but the index and protocol injection are project-specific.
