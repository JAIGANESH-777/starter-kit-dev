import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askDatabase(projectType, language, backendFramework = '') {
  if (projectType === 'frontend') {
    return { hasDatabase: false };
  }

  console.log(chalk.bold.white('\n── 🗄️  Database ─────────────────────────────────────\n'));

  const hasDatabase = await confirm({ message: 'Include a database?' });
  if (!hasDatabase) return { hasDatabase: false };

  // ── DB engine selection ──────────────────────────────────────────────────────
  // Filter out cloud-managed options that only make sense with specific stacks.
  // DynamoDB only makes sense for AWS-deployed projects; Supabase brings its own auth stack.
  const dbChoices = [
    { name: 'PostgreSQL — production-grade relational (recommended)', value: 'PostgreSQL' },
    { name: 'MySQL / MariaDB', value: 'MySQL' },
    { name: 'SQLite — lightweight, local/dev only', value: 'SQLite' },
    { name: 'MongoDB — document store, schema-less', value: 'MongoDB' },
    { name: 'Redis — cache, sessions, pub-sub', value: 'Redis' },
    // Supabase only valid with TypeScript / JS stack (its client SDK is TS-first)
    ...(language !== 'Python' ? [{ name: 'Supabase — Postgres + realtime + auth', value: 'Supabase' }] : []),
    // PlanetScale / DynamoDB are cloud-provider-specific; keep them for any stack
    { name: 'PlanetScale — serverless MySQL', value: 'PlanetScale' },
    { name: 'DynamoDB — AWS serverless NoSQL', value: 'DynamoDB' },
  ];

  const databases = await checkbox({
    message: 'Select databases: (space to select)',
    choices: dbChoices,
    validate: (choices) => choices.length > 0 || 'Select at least one database.',
  });

  const hasMongo      = databases.includes('MongoDB');
  const hasRelational = databases.some((d) =>
    ['PostgreSQL', 'MySQL', 'SQLite', 'PlanetScale', 'Supabase'].includes(d),
  );
  const hasMySQL      = databases.includes('MySQL') || databases.includes('PlanetScale');

  // ── ORM / query layer — strictly filtered by (language × backendFramework × dbEngine) ──
  let orm;

  if (language === 'Python') {
    if (hasMongo) {
      // MongoDB with Python
      orm = await select({
        message: 'ORM / query layer:',
        choices: [
          { name: 'Motor — async MongoDB driver (recommended for FastAPI)', value: 'Motor' },
          { name: 'MongoEngine — ODM for sync usage (Django-friendly)', value: 'MongoEngine' },
        ],
      });
    } else if (backendFramework === 'Django') {
      // Django projects: Django ORM is the only sensible built-in choice.
      // SQLAlchemy can co-exist with Django but that is a very unusual setup.
      orm = await select({
        message: 'ORM / query layer:',
        choices: [
          { name: 'Django ORM — built-in, recommended for Django', value: 'Django ORM' },
          { name: 'Raw SQL', value: 'Raw SQL' },
        ],
      });
    } else if (backendFramework === 'FastAPI' || backendFramework === '') {
      // FastAPI (or unspecified Python): async-native ORMs only.
      // Django ORM is deliberately excluded — it is sync-only and requires django.setup().
      orm = await select({
        message: 'ORM / query layer:',
        choices: [
          { name: 'SQLAlchemy 2 async + Alembic (recommended for FastAPI)', value: 'SQLAlchemy' },
          { name: 'Tortoise ORM — async, designed for FastAPI/asyncio', value: 'Tortoise ORM' },
          { name: 'Raw SQL (asyncpg / aiomysql)', value: 'Raw SQL' },
        ],
      });
    } else {
      // Fallback for any other Python backend
      orm = await select({
        message: 'ORM / query layer:',
        choices: [
          { name: 'SQLAlchemy 2 async + Alembic', value: 'SQLAlchemy' },
          { name: 'Django ORM', value: 'Django ORM' },
          { name: 'Tortoise ORM', value: 'Tortoise ORM' },
          { name: 'Raw SQL', value: 'Raw SQL' },
        ],
      });
    }
  } else if (hasMongo && !hasRelational) {
    // MongoDB-only, TypeScript/JS stack
    orm = await select({
      message: 'ORM / query layer:',
      choices: [
        { name: 'Mongoose — MongoDB ODM (recommended)', value: 'Mongoose' },
        { name: 'Prisma — with MongoDB connector', value: 'Prisma' },
        { name: 'Raw MongoDB driver', value: 'Raw MongoDB' },
      ],
    });
  } else {
    // Relational or mixed, TypeScript/JS stack
    // TypeORM is only recommended alongside NestJS (decorator-based).
    const ormChoices = [
      { name: 'Prisma — type-safe, schema-first (recommended)', value: 'Prisma' },
      { name: 'Drizzle ORM — type-safe SQL builder, minimal overhead', value: 'Drizzle ORM' },
      // TypeORM: show only if NestJS is selected (it's tightly coupled to NestJS decorators)
      ...(backendFramework === 'NestJS'
        ? [{ name: 'TypeORM — decorator-based, NestJS native', value: 'TypeORM' }]
        : []),
      { name: 'Knex.js — SQL query builder, no ORM layer', value: 'Knex.js' },
      { name: 'Raw SQL / pg driver', value: 'Raw SQL' },
      { name: 'None', value: 'None' },
    ];
    orm = await select({ message: 'ORM / query layer:', choices: ormChoices });
  }

  const hasMigrations = await confirm({ message: 'Include database migrations?' });
  const hasSeed       = await confirm({ message: 'Include seed data scripts?' });

  if (databases.includes('SQLite')) {
    console.log(chalk.yellow('\n  ⚠  SQLite selected: SQLite does not require a Docker container.'));
    console.log(chalk.yellow('     The SPEC will instruct the agent to configure SQLite using local files.\n'));
  }

  if (databases.includes('DynamoDB')) {
    console.log(chalk.yellow('\n  ⚠  DynamoDB selected: requires AWS credentials + region in .env.'));
    console.log(chalk.yellow('     No Docker container will be added — use AWS CLI or LocalStack for local dev.\n'));
  }

  return { hasDatabase, databases, orm, hasMigrations, hasSeed };
}
