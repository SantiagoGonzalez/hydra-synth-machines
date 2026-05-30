# Skill Usage Protocol — IDE Instruction Snippet

> Copy the block below into your IDE's agent instruction file.
> Replace `{{SKILL_DIR}}` with the actual path to your skills directory (default: `/skills`).

---

## The Protocol Block

```markdown
## Skill Usage Protocol

- Do NOT load all files from `{{SKILL_DIR}}`
- Always consult `{{SKILL_DIR}}/skills-index.md` first
- Identify relevant skills based on user intent
- Only load specific skill files when needed

If a relevant skill exists:
→ Use it

If no skill exists:
→ Suggest creating one using `{{SKILL_DIR}}/meta/create-skills.skill.md`

If a skill seems weak:
→ Use `{{SKILL_DIR}}/meta/evaluate-skill-quality.skill.md`
```

---

## Per-IDE Injection Guide

### VS Code + GitHub Copilot

**File:** `.github/copilot-instructions.md`

If the file does not exist, create it. Paste the protocol block at the end of the file or in a dedicated `## Agent Skills` section.

```
.github/
└── copilot-instructions.md   ← paste here
```

> Note: VS Code also respects `*.instructions.md` files scoped to folders via `applyTo` frontmatter. For workspace-wide skill discovery, the top-level `copilot-instructions.md` is the recommended location.

---

### Cursor

**Option A — Single rules file:** `.cursorrules` (legacy, still supported)

**Option B — Directory rules:** `.cursor/rules/<name>.mdc`

Paste the protocol block into whichever you already use. If starting fresh, prefer the directory approach:

```
.cursor/
└── rules/
    └── skills.mdc   ← paste here
```

---

### Windsurf

**File:** `.windsurfrules`

```
.windsurfrules   ← paste here
```

---

### Generic (any agent-aware IDE or AGENTS.md standard)

**File:** `AGENTS.md` at the repository root, or any file your agent configuration points to.

```
AGENTS.md   ← paste here
```

---

## Customization Checklist

After pasting the protocol block:

- [ ] Replace all occurrences of `{{SKILL_DIR}}` with your actual skill directory path (e.g. `/skills`)
- [ ] Verify `{{SKILL_DIR}}/skills-index.md` exists (copy from `portable-skill-system/templates/skills-index.template.md`)
- [ ] Verify `{{SKILL_DIR}}/meta/` contains the three meta skills from `portable-skill-system/meta/`
- [ ] Ask your agent: *"List the available skills"* — it should read `skills-index.md` and return the skill list without loading all skill files
