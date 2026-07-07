# Developer preferences (local — do not commit)

Copy to `.ai/dev-preferences.local.md` (gitignored) when the developer agrees.

```markdown
# Developer preferences (local — do not commit)

db_push: allowed   # AI may run `bun run db:push` in server/ after schema changes
```

When `db_push: allowed` is present, AI may run `bun run db:push` in `server/` after schema edits without re-asking.

To revoke: delete the file or remove the `db_push` line.