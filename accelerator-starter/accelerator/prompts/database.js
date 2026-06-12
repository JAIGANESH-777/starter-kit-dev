import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askDatabase(projectType, language) {
  if (projectType === 'frontend') {
    return { hasDatabase: false };
  }

  console.log(chalk.bold.white('\n── 🗄️  Database ─────────────────────────────────────\n'));

  const hasDatabase = await confirm({ message: 'Include a database?' });
  if (!hasDatabase) return { hasDatabase: false };

  const databases = await checkbox({
    message: 'Select databases: (space to select)',
    choices: [
      { name: 'PostgreSQL — production-grade relational (recommended)', value: 'PostgreSQL' },
      { name: 'MySQL / MariaDB', value: 'MySQL' },
      { name: 'SQLite — lightweight, local/dev only', value: 'SQLite' },
      { name: 'MongoDB — document store, schema-less', value: 'MongoDB' },
      { name: 'Redis — cache, sessions, pub-sub', value: 'Redis' },
      { name: 'PlanetScale — serverless MySQL', value: 'PlanetScale' },
      { name: 'Supabase — Postgres + realtime + auth', value: 'Supabase' },
      { name: 'DynamoDB — AWS serverless NoSQL', value: 'DynamoDB' },
    ],
    validate: (choices) => choices.length > 0 || 'Select at least one database.',
  });

  const hasMongo = databases.includes('MongoDB');
  const hasRelational = databases.some((d) => ['PostgreSQL', 'MySQL', 'SQLite', 'PlanetScale', 'Supabase'].includes(d));

  // ORM choices: scoped to what's compatible with selected databases + language
  let orm;
  if (language === 'Python') {
    orm = await select({
      message: 'ORM / query layer:',
      choices: hasMongo
        ? [
            { name: 'Motor — async MongoDB driver (recommended for FastAPI)', value: 'Motor' },
            { name: 'MongoEngine — ODM for sync usage', value: 'MongoEngine' },
          ]
        : [
            { name: 'SQLAlchemy — async (recommended for FastAPI)', value: 'SQLAlchemy' },
            { name: 'Django ORM — built-in (Django projects only)', value: 'Django ORM' },
            { name: 'Tortoise ORM — async ORM alternative', value: 'Tortoise ORM' },
            { name: 'Raw SQL', value: 'Raw SQL' },
          ],
    });
  } else if (hasMongo && !hasRelational) {
    // MongoDB-only — only show MongoDB-compatible ORMs
    orm = await select({
      message: 'ORM / query layer:',
      choices: [
        { name: 'Mongoose — MongoDB ODM (recommended)', value: 'Mongoose' },
        { name: 'Prisma — with MongoDB connector', value: 'Prisma' },
        { name: 'Raw MongoDB driver', value: 'Raw MongoDB' },
      ],
    });
  } else {
    // Relational or mixed — show relational ORMs (Prisma first as recommended)
    orm = await select({
      message: 'ORM / query layer:',
      choices: [
        { name: 'Prisma — type-safe, schema-first (recommended)', value: 'Prisma' },
        { name: 'Drizzle ORM — type-safe SQL builder, minimal overhead', value: 'Drizzle ORM' },
        { name: 'TypeORM — decorator-based, NestJS native', value: 'TypeORM' },
        { name: 'Knex.js — SQL query builder, no ORM layer', value: 'Knex.js' },
        { name: 'Raw SQL / pg driver', value: 'Raw SQL' },
        { name: 'None', value: 'None' },
      ],
    });
  }

  const hasMigrations = await confirm({ message: 'Include database migrations?' });
  const hasSeed = await confirm({ message: 'Include seed data scripts?' });

  if (databases.includes('SQLite')) {
    console.log(chalk.yellow('\n  ⚠  SQLite selected: SQLite does not require a Docker container.'));
    console.log(chalk.yellow('     The SPEC will instruct the agent to configure SQLite using local files.\n'));
  }

  return { hasDatabase, databases, orm, hasMigrations, hasSeed };
}
