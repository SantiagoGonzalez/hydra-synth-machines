# Skill: scan-skills

## Purpose
Discover and index all markdown files in a project directory. Scans recursively, extracts metadata from each file, classifies skills by category and abstraction level, and rebuilds `skills-index.md` from scratch. Use this for initial indexing of existing knowledge or to fully re-index after major changes.

## Inputs
- `scan_path` (path) — directory to scan recursively for markdown files
- `index_path` (path, optional) — where to write the index; default: `{{SKILL_DIR}}/skills-index.md`
- `extraction_depth` (string, optional) — `lightweight` or `full`; ask user interactively if omitted
- `project_name` (string, optional) — used in the index header; inferred from directory name if omitted
- `exclude_patterns` (list, optional) — globs to skip; default: `["node_modules/**", ".git/**", "dist/**", "build/**", "**/README.md"]`

## Outputs
- `skills-index.md` — fully rebuilt index with all discovered skills categorized and routed
- Console report — count by category, path written, any skipped files

## Preconditions
- `scan_path` exists and is readable
- Agent has write access to `index_path`

## Steps

### 1. Collect candidate files

Recursively list all `.md` files under `scan_path`.

Apply exclusions:
- Skip files matching `exclude_patterns`
- Skip the index file itself (`skills-index.md`) to avoid self-indexing
- Skip files shorter than 5 lines (likely stubs — add to warnings)

Result: a list of candidate file paths.

If zero candidates after exclusions → report "No markdown files found" and:
- Still generate an index containing only the 4 meta skills
- Do not abort — an empty-content index is valid

### 2. Ask extraction depth (interactive)

If `extraction_depth` is not provided as input, ask the user:

> **How much metadata should be extracted from each skill file?**
>
> **Lightweight** *(recommended for directories with more than 20 files)*
> — Reads only the first 10 lines per file. Extracts name and purpose.
>
> **Full parse** *(thorough)*
> — Reads the entire file. Extracts name, purpose, inputs, tags, abstraction level, and composition references.

Store the answer as `extraction_depth`.

### 3. Extract metadata per file

For each candidate:

#### Lightweight
1. Read first 10 lines
2. Extract:
   - **Name**: first H1 heading (`# Skill: <name>` → `<name>`; `# <name>` → `<name>`); fallback: filename without extension, kebab-to-title-case
   - **Purpose**: first non-empty, non-heading line after the H1; truncate to 120 characters

#### Full parse
1. Read entire file
2. Extract:
   - **Name**: same as lightweight
   - **Purpose**: content of `## Purpose` section; fallback: first non-heading paragraph
   - **Tags**: infer from `## Purpose`, `## Steps`, and heading keywords (deduplicate, lowercase)
   - **Level**: classify using heuristics in Step 4
   - **Composes with**: skill names referenced in `## Composition Notes` section

### 4. Classify each file

Assign **Category** and **Level**:

#### Category heuristics (evaluate in order, first match wins)

| Keywords in name or content | Category |
|-----------------------------|----------|
| "create skill", "evaluate skill", "organize skill", "scan skill", "skill template", "skill quality", "skill index" | `Meta` |
| "architecture", "decision tree", "data flow", "reference", "overview", "taxonomy", "context", "system design" | `Architecture & Decision` |
| _(default)_ | `Build` |

#### Level heuristics

| Signal | Level |
|--------|-------|
| Controls or generates other skills (meta keywords above) | `meta` |
| References 2+ other skills in Composition Notes, OR has multi-step decision workflows | `composite` |
| _(default)_ | `atomic` |

### 5. Build index content

Assemble the new index using this structure:

```
# Skills Index

> Lightweight registry. **Project:** {{project_name}} | **Last updated:** {{date}} | **Total skills:** {{count}}
>
> **Skill directory:** {{SKILL_DIR}}

## Categories

### Meta Skills
(table: Skill | Path | Level | Purpose | Tags)

### Architecture & Decision Skills
(table: Skill | Path | Level | Purpose | Tags | Composes With)

### Build Skills
(table: Skill | Path | Level | Purpose | Tags | Composes With)

## Intent → Skill Router
(table: If you need to... | Use skill(s))

## Composition Graph
(only if extraction_depth = full AND composition data is available)

## How to Update This Index
(standard boilerplate — always included)
```

**Always include the 4 meta skills** in the Meta section, regardless of whether they were in `scan_path`:
- `meta/create-skills.skill.md`
- `meta/evaluate-skill-quality.skill.md`
- `meta/organize-skill-system.skill.md`
- `meta/scan-skills.skill.md`

**Path format:** relative to `{{SKILL_DIR}}`. Strip the `scan_path` prefix from discovered file paths.

**Intent router:** for each discovered skill, derive an intent phrase from the purpose by rephrasing as an action (e.g., purpose "Creates an Angular service…" → "Create an Angular service").

**Total count:** 4 meta skills + all discovered and indexed project skills.

### 6. Write index

Write the assembled content to `index_path`, replacing any existing file.

### 7. Report

```
✅ Scan complete
   Scanned:          {{scan_path}}
   Files found:      {{total_md_files}}
   Skills indexed:   {{indexed_count}} (+ 4 meta skills)
   Extraction:       {{extraction_depth}}
   Skipped:          {{skipped_count}} (stubs or unreadable)

   Categories:
     Meta:             {{meta_count}}
     Architecture:     {{arch_count}}
     Build:            {{build_count}}

   Index written to:  {{index_path}}
```

If there were skipped files, list them with the reason.

## Heuristics
- Lightweight is always safe; default to it when uncertain about directory size
- Classify ambiguous files as `Build` / `atomic` — conservative default
- If a file has no H1, use the filename (kebab-to-title: `my-skill.md` → `My Skill`)
- A file with only headings and no content paragraphs is likely a stub — skip with warning
- Do not include the `portable-skill-system/` folder itself in discovery unless it is the `scan_path`

## Examples

**Standalone re-index:**
> "Scan my `/skills` folder and rebuild the index"
→ Runs full scan, asks depth, rebuilds `skills-index.md`

**First-time setup with existing guides:**
> "Scan `/docs/guides` and build an index"
→ Discovers all `.md` files under `/docs/guides`, indexes them + the 4 meta skills

**Large codebase, fast:**
> "Scan `/knowledge` — keep it lightweight"
→ Reads only first 10 lines per file, builds index quickly

## Failure Modes

| Failure | Recovery |
|---------|----------|
| `scan_path` does not exist | Abort; report the invalid path, ask for correction |
| Zero files after exclusions | Generate index with only 4 meta skills; report "No project skills found" |
| File unreadable (permissions, encoding error) | Skip file; add to warnings in report |
| File has no heading or content | Use filename as name, "(no description)" as purpose; still index it |
| Ambiguous category | Default `Build` / `atomic`; add "review recommended" tag |
| `index_path` not writable | Abort; report the path and permission issue |

## Composition Notes
- **Standalone use:** run at any time to fully re-index; safe to run repeatedly
- **Setup integration:** called by `setup.skill.md` during bootstrap when user opts to scan an existing directory
- **Relationship to `organize-skill-system`:** scan does **full rebuilds** (replaces entire index). Use scan for initial indexing or major re-indexing. Use `organize-skill-system` for incremental day-to-day additions of new skills.
- **After scan:** use `evaluate-skill-quality` on poorly-structured discovered files to improve them before adding them to the project skill library
