# `.ai/` Documentation Index

> **给人看的中文说明**见 [docs/guide/ai-guide.md](../docs/guide/ai-guide.md)。  
> **AI-facing docs below are in English** for better agent comprehension and skill matching.

This directory holds **Elysia Admin** AI development standards.

| Type | When to read |
|------|--------------|
| **Workflow** | New/extended business module, menu permissions, dict |
| **Code templates** | Writing concrete code |

---

## Workflow (read first for modules)

| File | Content |
|------|---------|
| **[AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md)** | **Main SOP:** Schema → backend → dict → frontend → SQL |
| [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md) | List / search / dialog quality |
| [AI_MCP_SETUP.md](./AI_MCP_SETUP.md) | Postgres + Chrome DevTools MCP |
| [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md) | Main / junction / child tables |
| [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md) | Merged SQL + query-first menus |
| [AI_UI_LAYOUT.md](./AI_UI_LAYOUT.md) | Dialog/drawer form span |
| [AI_CONTEXT_CAPSULE.md](./AI_CONTEXT_CAPSULE.md) | One-page quick ref |

**Cursor Skill:** `.cursor/skills/elysia-module-dev/SKILL.md`

---

## Code Templates & Architecture

| File | Content |
|------|---------|
| **[AI_CODE_EXAMPLES.md](./AI_CODE_EXAMPLES.md)** | Copy-paste backend/frontend templates |
| [AI_MODULE_STANDARD.md](./AI_MODULE_STANDARD.md) | Backend four-file roles |
| [AI_FRONTEND_RULES.md](./AI_FRONTEND_RULES.md) | Frontend structure + naming |
| [AI_STRUCTURE.md](./AI_STRUCTURE.md) | Layered architecture |
| [AI_DEPENDENCY.md](./AI_DEPENDENCY.md) | Dependency direction |
| [AI_GENERATION.md](./AI_GENERATION.md) | General generation rules |

---

## Legacy

- [AI_FEATURE_TEMPLATE.md](./AI_FEATURE_TEMPLATE.md) → merged into **AI_MODULE_WORKFLOW.md**

---

## Handoff SQL Output

```
server/database/sql/{module-name}-init.sql
```

See [server/database/sql/README.md](../server/database/sql/README.md).

---

## IDE Rules (same semantics)

- Cursor: `.cursor/rules/`
- Trae: `.trae/rules/`
- Kiro: `.kiro/steering/`
- Codex: `AGENTS.md` (root), `server/AGENTS.md`, `admin/AGENTS.md` — see `.codex/README.md`
- Claude Code: `.claude/CLAUDE.md`, `.claude/rules/` — see `.claude/README.md`
- VS Code: `.vscode/` (settings, tasks, launch) + `elysia-admin.code-workspace`

When updating architecture or file-reading discipline, sync all five Agent rule locations above.
