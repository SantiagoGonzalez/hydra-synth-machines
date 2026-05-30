# Skill: organize-skill-system

## Purpose
Maintain a structured, scalable index of all available skills so an agent can efficiently discover and use them without loading the entire skill set into context.

## Inputs
- Skill directory path (default: `{{SKILL_DIR}}` → `/skills`)
- Index file path (default: `{{INDEX_PATH}}` → `{{SKILL_DIR}}/skills-index.md`)
- Optional: new or updated skill files to register

## Outputs
- `skills-index.md` — lightweight registry of all skills
- Categorized skill groups
- Metadata per skill (name, purpose, tags, when to use)

## Preconditions
- Skills follow a consistent markdown structure
- File naming is descriptive (e.g. `my-feature.skill.md`)

## Steps

1. Scan skill filenames under `{{SKILL_DIR}}` (DO NOT fully load all content unless needed)
2. Extract lightweight metadata from each file:
   - Skill name
   - Purpose (first lines or `## Purpose` section)
   - Keywords/tags
3. Categorize skills into groups:
   - **Meta** — skills that create, evaluate, or organize other skills
   - **Architecture & Decision** — reference and decision-making skills
   - **Build** — atomic skills that produce code artifacts
4. Assign abstraction levels:
   - `atomic` — single focused task
   - `composite` — multi-step or reference
   - `meta` — controls other skills
5. Build/update `{{INDEX_PATH}}` with:
   - Category tables (one row per skill)
   - Intent-to-Skill router
   - Composition graph
   - Last-updated date and total count
6. When a new skill is added:
   - Append a row to the correct category table
   - Add an intent row if applicable
   - Bump total count — **no full rebuild**
7. Provide retrieval guidance:
   - Match user intent → suggest relevant skills via the router table

## Heuristics
- Keep index lightweight (<10% of total skill content size)
- Prefer many small discoverable entries over large descriptions
- Use consistent tags across skills (no synonyms for the same concept)
- Avoid duplicate capabilities — flag overlaps for consolidation

## Examples

**User asks:** "I need to evaluate a skill"
→ Suggest: `evaluate-skill-quality`

**User asks:** "Create a new reusable workflow"
→ Suggest: `create-skills`

**User asks:** "Add a new feature to the project"
→ Suggest: consult index, find the most relevant architecture or build skill

## Failure Modes
- Index becomes outdated → fix with incremental update (step 6)
- Categories too vague → refine into functional clusters
- Skills overlap → flag for consolidation review
- `{{INDEX_PATH}}` does not exist → create it from `templates/skills-index.template.md`

## Composition Notes
- Works with `create-skills` to register newly created skills
- Works with `evaluate-skill-quality` to refine indexed skills
- Acts as a **router** before any other skill is selected
- Reads `{{INDEX_PATH}}`; all other skills read from `{{SKILL_DIR}}`
- For initial indexing or full re-indexing from scratch, use `scan-skills` instead — it rebuilds the entire index from discovered files. Use `organize-skill-system` for incremental day-to-day additions.
