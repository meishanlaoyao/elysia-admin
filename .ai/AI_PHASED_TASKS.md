# Phased Task Breakdown (Large Features / Full Projects)

> **Role:** Act as a senior full-stack engineer (20+ years, large-product experience). Split multi-module work into durable, handoff-ready tasks — not vague summaries.

Canonical protocol for **multi-module** or **full-project** requests. Does **not** replace [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md) or Skill `elysia-module-dev` — those still govern how each single module is built.

**Output language for task packs:** write `CHECKLIST.md` and `NN-*.md` in **Chinese** (human checklist + multi-chat handoff). This protocol file stays English.

---

## When to Use

Judge by **feature-module volume / requirement span**, **not** estimated file-change count.

**Use this protocol when any of the following is true:**

- The request names **multiple business feature modules** at once (e.g. users + roles + orders + reports + messaging) — like a product slice or subsystem
- The user says: `完整项目` / `大功能` / `分阶段` / `拆任务` / `整套系统` / `拆分任务` / `分阶段执行` / `大任务拆解` / `完整项目规划`
- New subsystem or cross-domain work that cannot safely finish in one chat

**Do NOT use (implement directly or use single-module SOP):**

- Exactly **one** business module (standard single-table CRUD → Skill / [AI_MODULE_SCAFFOLD.md](./AI_MODULE_SCAFFOLD.md))
- Single bugfix, local enhancement, small doc edit

---

## IDE → Storage Path

Write under the **current tool’s** config directory. **Never** put task packs at the repo root.

| Tool | Directory |
|------|-----------|
| Cursor | `.cursor/feature-tasks/{slug}/` |
| Claude Code | `.claude/feature-tasks/{slug}/` |
| Codex | `.codex/feature-tasks/{slug}/` |
| Qoder | `.qoder/feature-tasks/{slug}/` |
| Trae | `.trae/feature-tasks/{slug}/` |
| Kiro | `.kiro/feature-tasks/{slug}/` |

If the tool cannot be detected: default to **Cursor** path and state the path in the reply.

**No dual-write across IDEs.** One feature lives in one tool directory only; humans migrate or rebuild when switching tools.

**Slug:** English `kebab-case` (e.g. `mall-admin`). No spaces or Chinese path segments.

**Cursor Plan UI ≠ this pack:** `.cursor/plans/` is ephemeral session planning. Durable multi-chat checklists live in `feature-tasks/`. Prefer `feature-tasks` for large work; do not stop at a temporary Plan only.

---

## Artifact Layout

```
.{ide}/feature-tasks/{feature-slug}/
  CHECKLIST.md          # master checklist: - [ ] / - [x]
  01-{short-name}.md    # one task detail
  02-{short-name}.md
  ...
```

Example (Cursor): `.cursor/feature-tasks/mall-admin/CHECKLIST.md`

---

## Split Granularity

- Default: **one business feature module = one task** (or an ordered group for that module)
- Within one module you may split: schema → backend → frontend → handoff SQL — still **module-oriented**, never “by file count”
- Shared infrastructure (auth, dict baseline, etc.) → separate **前置** tasks
- Do not over-split a normal single-module CRUD that belongs in Skill alone

---

## Task File Template (required fields)

Each `NN-{short-name}.md` must include:

```markdown
# NN — {title}

## Goal
…

## Scope
…

## Out of scope
…

## Depends on
- none | `01-…`, `02-…`

## Files to touch
- …

## Acceptance criteria
- [ ] …

## Steps
1. …
2. …

## Risks / notes
…
```

---

## CHECKLIST Template

```markdown
# {Feature title} — Checklist

> Path: `.{ide}/feature-tasks/{slug}/`
> Check off only when the user asks (or confirms the phase is done).

## Tasks (execution order)

- [ ] [01 — …](./01-….md) — Depends: none
- [ ] [02 — …](./02-….md) — Depends: 01
- [ ] [03 — …](./03-….md) — Depends: 01, 02

## Notes
- One chat → one task by default
- User says 继续 / 下一个 → first unchecked item whose Depends-on are all `[x]`
```

Order the checklist in **executable** sequence. Do not start a task whose dependencies are unmet.

---

## Breakdown Turn Rules

1. **No business code** in the breakdown turn — only the task pack + second-pass review.
2. After writing all tasks, run the **Second-pass review** below; fix gaps before handing off.
3. Stop and wait until the user picks a phase (or says 继续 / 下一个).

---

## Second-pass Review (mandatory)

Re-read every task from a fresh angle and verify:

- [ ] Every module named in the requirement appears (or is explicitly out of scope)
- [ ] No orphan tasks; no circular `Depends on`
- [ ] Acceptance criteria are checkable (observable done / not done)
- [ ] Not over-splitting a single-module CRUD
- [ ] Closing work included where needed (handoff SQL, menu/permission, dict)
- [ ] Each task is self-contained enough for a **new chat** to execute without the breakdown chat

---

## Execution Turn Rules

- Default: **one chat = one task**
- Read only that `NN-*.md` + `CHECKLIST.md` — **do not** re-read this whole protocol every turn
- Module implementation still follows Skill / [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md) / code example sections as usual
- Check off `CHECKLIST.md` only when the user asks or confirms completion
- If scope changes mid-flight: **update task files + checklist first**, then code — never silent scope creep

---

## Boundary vs Module SOP

| Concern | Doc |
|---------|-----|
| How to split multi-module / full project | **This file** |
| How to build one CRUD module | Skill + `AI_MODULE_WORKFLOW.md` / scaffold |
| Code patterns | `AI_CODE_EXAMPLES_*.md` (section only) |