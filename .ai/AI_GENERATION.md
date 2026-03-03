# Code Generation Rules

When generating code:

1. explain plan in max 5 lines
2. list files to create or modify
3. do not refactor unrelated files
4. do not modify folder structure
5. do not introduce new dependency
6. generate minimal code
7. follow existing patterns strictly
8. ask before modifying database schema
9. use existing repository functions only
10. no over-engineering

---

# Backend Rules

- always use repository functions
- do not use raw SQL directly
- do not access pg.ts directly
- no business logic in route.ts
- no database logic in dto.ts
- always return unified result format

---

# Frontend Rules

- use api/ folder for http
- no business logic in components
- no direct fetch
- no direct store mutation outside store
- follow existing typing patterns