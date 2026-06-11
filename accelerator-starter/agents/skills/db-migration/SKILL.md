---
name: db-migration
description: Manage database schema evolution, safe migrations, relational modeling, and idempotent data seeding across various ORMs (Prisma, Drizzle, SQLAlchemy/Alembic, Django ORM) without downtime or data loss.
---

# Database Migration & Evolution Skill

This skill teaches the coding agent how to safely evolve database schemas, write migrations, and write idempotent database seeds. It applies whenever the project schema is modified or expanded, or when migration files need to be generated and applied.

---

## 1. Schema Change Strategy (Expand & Contract)

When modifying schemas in a live environment, **never** make destructive changes (like renaming or deleting columns/tables) in a single deploy. Doing so will break the running server instance before the new code is fully rolled out.

Always follow the **Expand and Contract (Parallel Change)** pattern:

```mermaid
graph TD
    A["1. Expand: Add new column/table<br>Keep old column intact"] --> B["2. Write new data to BOTH<br>columns (Dual-Writing)"]
    B --> C["3. Backfill old data to new column<br>(Background migration)"]
    C --> D["4. Update app to read from NEW column only"]
    D --> E["5. Contract: Safe to drop/delete old column"]
```

### Safe vs. Unsafe Changes

| Change Type | Safety Status | Safe Alternative / Rule |
| :--- | :--- | :--- |
| **Add nullable column** | ✅ Safe | Safe to deploy immediately. |
| **Add column with default** | ✅ Safe | Safe to deploy immediately. |
| **Add NOT NULL column (no default)** | ❌ Unsafe | Add as nullable first, deploy, backfill values, alter column to `NOT NULL`. |
| **Rename a column** | ❌ Unsafe | Add new column, dual-write to both, backfill old data, switch reads to new column, drop old. |
| **Drop a column** | ❌ Unsafe | Ensure no running code accesses the column. Remove all references in code first, deploy, then drop column. |
| **Create index** | ⚠️ Risky | On large databases (e.g. PostgreSQL), use `CREATE INDEX CONCURRENTLY` to avoid locking writes. |

---

## 2. ORM-Specific Playbooks

Ensure you follow the exact conventions and commands of the chosen ORM declared in `SPEC.md`.

### 2.1 Prisma ORM (TypeScript/Node)
Prisma uses a declarative `schema.prisma` file to represent target schema states.

* **Development (Local Schema Changes)**:
  1. Modify `prisma/schema.prisma`.
  2. Run `npx prisma migrate dev --name <migration_name>` to generate and apply the SQL migration locally.
  3. Validate that `prisma/client` is re-generated automatically.
* **Production / Docker CI/CD**:
  * Run `npx prisma migrate deploy` during the startup phase of the backend container.
  * **Rule**: Never run `migrate dev` in production as it can reset the database.
* **Gotchas**:
  * If using PostgreSQL, verify the provider url uses `postgresql://` (not `postgres://`).

### 2.2 Drizzle ORM (TypeScript/Node)
Drizzle uses TypeScript schema files to represent tables.

* **Development (Local Schema Changes)**:
  1. Modify your table schemas in `src/db/schema.ts` (or equivalent location).
  2. Run `npx drizzle-kit generate` to generate the SQL migration script in `drizzle/migrations/`.
  3. Run `npx drizzle-kit migrate` (or run a custom migration script) to apply the generated SQL.
  4. In rapid prototyping only, use `npx drizzle-kit push` to bypass migration file generation. Avoid using this once in production track.
* **Drizzle Config**:
  * Ensure `drizzle.config.ts` points to the correct migration folder and reads connection variables via `process.env`.

### 2.3 SQLAlchemy + Alembic (Python)
SQLAlchemy defines python model classes; Alembic tracks changes.

* **Development (Local Schema Changes)**:
  1. Modify model definitions in your Python modules.
  2. Run `alembic revision --autogenerate -m "description"` to generate the migration script in `alembic/versions/`.
  3. **Mandatory**: Open the generated migration script and double-check it. Alembic autodetect can miss renamed columns or custom index updates.
  4. Run `alembic upgrade head` to apply changes.
* **Gotchas**:
  * Verify that new models are imported inside `env.py` under Alembic configurations so that Alembic's `target_metadata` can detect them.

### 2.4 Django ORM (Python)
Django includes a built-in migration management system.

* **Development (Local Schema Changes)**:
  1. Modify model classes in `models.py`.
  2. Run `python manage.py makemigrations` to generate migration files.
  3. Run `python manage.py migrate` to apply migrations.
* **Data Migrations (Non-structural changes)**:
  * To migrate or backfill data, create an empty migration (`python manage.py makemigrations --empty <app_name>`) and write python code using the `RunPython` action.

---

## 3. Idempotent Database Seeding

Seeding must be **idempotent** (running the seed script multiple times should not cause duplicate records, key conflicts, or schema integrity violations).

### Seeding Rules

1. **Use Upsert Operations**:
   * **Prisma**: Use `db.model.upsert()` instead of `db.model.create()`.
   * **SQLAlchemy / SQL**: Use `INSERT INTO ... ON CONFLICT DO UPDATE` or query existing records before inserting.
   * **Django**: Use `get_or_create()` or `update_or_create()`.
2. **Order of Insertion (Relational Dependencies)**:
   * Always seed parent records first.
   * Seed lookup/reference codes first (e.g. Roles, Categories).
   * Seed intermediate tables (e.g., UserProfiles, Subscriptions) next.
   * Seed child records (e.g. Orders, Logs) last.
3. **Never Hardcode IDs for Auto-Incrementing Databases**:
   * If a table uses auto-incrementing integer IDs, let the database assign them. Query them back if you need foreign key references, or use natural unique keys (e.g. email, slug) for lookups.

### Example: Idempotent Prisma Seed

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Seed lookup data
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System Administrator' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'Standard User' },
  });

  // 2. Seed dependent records using role IDs
  await prisma.user.upsert({
    where: { email: 'admin@system.local' },
    update: { roleId: adminRole.id },
    create: {
      email: 'admin@system.local',
      name: 'System Admin',
      passwordHash: '$2b$10$UniquelyHashedAdminPassword', // Mocked hash
      roleId: adminRole.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 4. Checklist: Reviewing a Database Schema Change

Before committing a migration or schema file, verify the following:

- [ ] Does this change preserve data safety? (Will it crash production? If yes, split into expand/contract stages)
- [ ] Are all foreign keys mapped with appropriate delete constraints (`ON DELETE CASCADE` or `SET NULL`)?
- [ ] Are performance-critical filter/query columns indexed?
- [ ] Is there an idempotent seed updated to reflect the new models/columns?
- [ ] Does the migration run successfully locally from scratch? (Test by resetting: e.g. `npx prisma migrate reset` or running migrations on a clean docker db container)
