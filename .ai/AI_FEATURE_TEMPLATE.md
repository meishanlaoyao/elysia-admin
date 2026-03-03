# AI Feature Development Protocol (STRICT)

When implementing a new feature or module,
follow this exact workflow.

Never skip steps.
Never redesign architecture.

---

# Step 1 - Clarify Scope (MANDATORY)

Before writing code, output:

1. Feature goal (1-2 lines)
2. Affected module name
3. Database tables involved
4. Required CRUD operations
5. Whether transaction is required
6. Whether scheduled task is required

Do NOT generate code before this plan.

---

# Step 2 - File Creation Plan

List files to create or modify:

modules/{moduleName}/
- dto.ts
- handle.ts
- route.ts
- task.ts

If modifying existing module:
- list specific functions to add

Do NOT modify:
- core layer
- repository
- route registry
- infrastructure
- shared (unless strictly necessary)

---

# Step 3 - DTO Design Rules

In dto.ts:

- Define validation schema only
- Define request/response types
- No business logic
- No database access
- No repository usage
- No side effects

Use existing validation pattern.
Follow naming convention.

---

# Step 4 - Business Logic Rules

In handle.ts:

- Implement business logic only
- Use existing repository functions
- Use QueryBuilder if needed
- Use transaction wrapper if required
- Call shared utilities if necessary

Never:
- write raw SQL
- access pg.ts directly
- redesign repository
- introduce ORM
- import other modules

All database access must go through repository abstraction.

---

# Step 5 - Route Layer Rules

In route.ts:

- Bind dto validation
- Call handle functions
- Return unified result format
- No business logic
- No database logic
- No complex branching

Route must be thin.

---

# Step 6 - Task Layer Rules

In task.ts (if needed):

- Define cron expression
- Call handle functions
- No duplicated business logic
- No direct database access

If no scheduled task is required,
task.ts must still exist but can export empty task list.

---

# Step 7 - Unified Response Format

All HTTP responses must:

- Use unified result wrapper
- Never return raw object
- Never return raw array
- Follow existing result structure exactly

---

# Step 8 - Safety Checks Before Output

Before finishing, verify:

- No cross-module import
- No core layer modification
- No raw SQL
- No direct database driver usage
- No logic in route.ts
- No logic in dto.ts
- No new dependencies
- No architecture change

If any violation exists, fix it.

---

# Step 9 - Code Style Constraints

- Follow existing naming conventions
- Follow existing export patterns
- Do not introduce new abstraction layers
- Avoid over-engineering
- Generate minimal necessary code
- Do not refactor unrelated modules

---

# Step 10 - Final Output Format

Output in this order:

1. Plan summary (max 5 lines)
2. File creation list
3. Code blocks grouped by file
4. No extra explanation

Keep output concise and structured.

---

# Critical Rule

If existing module implementation differs from this template,
always follow existing module pattern.

Never redesign structure.
Never refactor infrastructure.
Never replace repository abstraction.