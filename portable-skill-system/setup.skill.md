# Skill: setup-skill-system

## Purpose
Bootstrap the portable skill system into any project. Detects the IDE in use, installs the meta skills, generates an index from template, and injects the Skill Usage Protocol into the correct instruction file — so the agent can immediately start discovering and using skills.

## Inputs
- `target_root` (path) — root directory of the target project
- `skill_dir` (path, optional) — where skills will live; default: `{{target_root}}/skills`
- `ide` (string, optional) — one of: `vscode`, `cursor`, `windsurf`, `generic`; auto-detected if omitted
- `project_name` (string, optional) — used in the index header; inferred from directory name if omitted
- `scan_path` (path, optional) — directory to scan for existing skills; resolved interactively in Step 2.5
- `extraction_depth` (string, optional) — `lightweight` or `full`; resolved interactively in Step 2.5

## Outputs
- `{{skill_dir}}/meta/` — four meta skills installed
- `{{skill_dir}}/skills-index.md` — index generated (from scan or from template)
- IDE instruction file — Skill Usage Protocol injected

## Preconditions
- Agent has read/write access to `target_root`
- `portable-skill-system/` folder is available (or agent has access to the meta skill files)

## Steps

### 1. Detect IDE

Scan `target_root` for the following files in order:

| File | IDE |
|------|-----|
| `.github/copilot-instructions.md` | `vscode` |
| `.cursorrules` | `cursor` |
| `.cursor/rules/` (directory) | `cursor` |
| `.windsurfrules` | `windsurf` |
| `AGENTS.md` | `generic` |

- If exactly one match → use it
- If multiple matches → ask the user which to use
- If none → use `generic`; create `AGENTS.md` at `target_root`

### 2. Resolve configuration

```
skill_dir    = provided OR {{target_root}}/skills
index_path   = {{skill_dir}}/skills-index.md
meta_dir     = {{skill_dir}}/meta
project_name = provided OR basename(target_root)
```

### 2.5. Ask scan preferences (interactive)

Ask the user the following questions:

**Question 1: Scan existing skills?**

> Do you have existing skill or knowledge files you'd like to index?
>
> - **Yes — scan a directory** for existing markdown files and build the index from them
> - **No — start with an empty index** *(recommended for new projects)*

If **No** → set `scan_enabled = false`, skip to Step 3.

If **Yes** → ask:

**Question 2: Scan path**

> Which directory should be scanned?
> *(freeform input; suggest `{{skill_dir}}` as default)*

Store as `scan_path`.

**Question 3: Extraction depth**

> How much metadata should be extracted from each file?
>
> - **Lightweight** *(recommended)* — reads first 10 lines per file; extracts name + purpose
> - **Full parse** — reads entire file; extracts name, purpose, inputs, tags, level, composition

Store as `extraction_depth`. Set `scan_enabled = true`.

---

### 3. Install meta skills

Copy the four meta skills from `portable-skill-system/meta/` to `{{meta_dir}}/`:

- `create-skills.skill.md`
- `evaluate-skill-quality.skill.md`
- `organize-skill-system.skill.md`
- `scan-skills.skill.md`

If `{{meta_dir}}` already contains these files:
- Compare content; if identical → skip
- If different → ask the user before overwriting

### 4. Generate skills index

**If `scan_enabled = true`:**
1. Delegate entirely to `scan-skills` with:
   - `scan_path` = resolved `scan_path` from Step 2.5
   - `index_path` = `{{index_path}}`
   - `extraction_depth` = resolved `extraction_depth` from Step 2.5
   - `project_name` = resolved `project_name`
2. `scan-skills` generates and writes the index — includes all discovered files + 4 meta skills
3. Skip the template-based generation below

**If `scan_enabled = false`:**

If `{{index_path}}` does not exist:
1. Copy `portable-skill-system/templates/skills-index.template.md` to `{{index_path}}`
2. Replace `{{PROJECT_NAME}}` with resolved `project_name`
3. Replace `{{DATE}}` with today's date (ISO format: YYYY-MM-DD)
4. Replace all `{{SKILL_DIR}}` occurrences with resolved `skill_dir`

If `{{index_path}}` already exists:
- Leave it untouched; report to user

### 5. Inject Skill Usage Protocol

Open `portable-skill-system/templates/instruction-snippet.md` and extract only the fenced markdown block under `## The Protocol Block` (the block itself, not the fence wrappers).

In the extracted block, replace `{{SKILL_DIR}}` with the resolved `skill_dir`.

Open the target instruction file (from Step 1).

**Check for existing injection:**
- Search for `## Skill Usage Protocol` in the file
- If found → skip injection; report "Protocol already present"
- If not found → append the block at the end of the file, preceded by a blank line

### 6. Verify

Perform these checks and report status for each:

| Check | Expected |
|-------|----------|
| `{{meta_dir}}/create-skills.skill.md` exists | ✅ |
| `{{meta_dir}}/evaluate-skill-quality.skill.md` exists | ✅ |
| `{{meta_dir}}/organize-skill-system.skill.md` exists | ✅ |
| `{{meta_dir}}/scan-skills.skill.md` exists | ✅ |
| `{{index_path}}` exists | ✅ |
| Index references all 3 meta skills | ✅ |
| `## Skill Usage Protocol` present in instruction file | ✅ |
| No `{{SKILL_DIR}}` placeholders remain in injected text | ✅ |

If any check fails, report the specific failure and the corrective action taken.

### 7. Report

Print a summary:

```
✅ Skill system bootstrapped
   Project:        {{project_name}}
   Skill dir:      {{skill_dir}}
   Index:          {{index_path}}
   IDE:            {{ide}}
   Instruction file: {{instruction_file_path}}

Next steps:
  1. Create your first project skill: ask the agent to follow meta/create-skills.skill.md
  2. After creating a skill, run organize-skill-system to register it in the index
```

## Heuristics
- Default everything. Only ask the user when ambiguity cannot be safely resolved (e.g. multiple instruction files, overwrite conflict)
- Never overwrite existing files without confirmation
- The Skill Usage Protocol injection is append-only — never restructure the instruction file
- If `skill_dir` is outside `target_root`, warn the user; do not proceed without confirmation

## Examples

**Minimal (all defaults):**
> "Follow setup.skill.md in this project"
→ Detects `.github/copilot-instructions.md` (VS Code), installs to `/skills`, injects protocol, done.

**Custom skill directory:**
> "Follow setup.skill.md, put skills in `/agent/skills`"
→ Installs to `/agent/skills/meta/`, generates index at `/agent/skills/skills-index.md`, injects protocol referencing `/agent/skills`.

**Cursor project:**
> "Follow setup.skill.md for a Cursor project"
→ Detects `.cursorrules`, installs meta skills, injects protocol into `.cursorrules`.

**Existing project with knowledge files:**
> "Follow setup.skill.md — I already have guides in `/docs/guides`"
→ During Step 2.5, user selects "Yes — scan a directory", provides `/docs/guides`, chooses Lightweight. Scan indexes all discovered files + 4 meta skills. Index is pre-populated instead of empty.

## Failure Modes

| Failure | Recovery |
|---------|----------|
| No instruction file found | Create `AGENTS.md` at project root and proceed |
| Meta skill already exists with different content | Ask user: skip, overwrite, or rename |
| `skills-index.md` already exists (scan_enabled = false) | Leave untouched; report to user |
| `## Skill Usage Protocol` already present in instruction file | Skip injection; report as already configured |
| `scan_path` does not exist | Ask for corrected path; do not abort setup |
| `scan_path` returns zero files | Fall back to template-based empty index; report "No files found" |
| `target_root` is not a valid directory | Abort; report path error |
| Placeholder `{{SKILL_DIR}}` remains after substitution | Flag as error; ask for the correct path |

## Composition Notes
- This skill is a one-time bootstrap — run once per project
- After setup, use `organize-skill-system` for all ongoing index management
- After setup, use `create-skills` to add project-specific skills
- This skill has no dependencies on other skills in the index (it runs before the index exists)
