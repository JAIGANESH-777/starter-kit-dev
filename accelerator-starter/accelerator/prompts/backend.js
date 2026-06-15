import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askBackend(projectType, language) {
  if (projectType === 'frontend') {
    return { hasBackend: false };
  }

  console.log(chalk.bold.white('\n── ⚙️  Backend ─────────────────────────────────────\n'));

  const frameworkChoices = language === 'Python'
    ? [
        { name: 'FastAPI — async, high-performance (recommended)', value: 'FastAPI' },
        { name: 'Django — batteries-included, admin UI', value: 'Django' },
      ]
    : [
        { name: 'NestJS — opinionated, modular, TypeScript-first (recommended)', value: 'NestJS' },
        { name: 'Express.js — minimal, flexible, widely used', value: 'Express.js' },
        { name: 'Fastify — fast, low-overhead alternative to Express', value: 'Fastify' },
        { name: 'Hono — edge-ready, ultra-lightweight', value: 'Hono' },
      ];

  const framework = await select({ message: 'Backend framework:', choices: frameworkChoices });

  const apiStyle = await select({
    message: 'API style:',
    choices: [
      { name: 'REST (recommended — universal, well-understood)', value: 'REST' },
      { name: 'GraphQL (complex querying, flexible schema)', value: 'GraphQL' },
      { name: 'REST + GraphQL hybrid', value: 'REST + GraphQL' },
    ],
  });

  // Validation — Python frameworks use Pydantic; Node frameworks let you choose
  let validation;
  if (language === 'Python') {
    validation = 'Pydantic v2';
  } else if (framework === 'NestJS') {
    validation = await select({
      message: 'Input validation library:',
      choices: [
        { name: 'class-validator + class-transformer (recommended for NestJS)', value: 'class-validator' },
        { name: 'Zod (type-safe, schema-first)', value: 'Zod' },
        { name: 'None', value: 'None' },
      ],
    });
  } else {
    validation = await select({
      message: 'Input validation library:',
      choices: [
        { name: 'Zod (recommended — runtime type-safety)', value: 'Zod' },
        { name: 'Joi (mature, expressive)', value: 'Joi' },
        { name: 'None', value: 'None' },
      ],
    });
  }

  const backendExtras = await checkbox({
    message: 'Backend features: (space to select, enter to skip)',
    choices: [
      { name: 'Health check endpoints (required for Docker)', value: 'Health Checks' },
      { name: 'Rate limiting', value: 'Rate Limiting' },
      { name: 'Redis cache layer', value: 'Redis Caching' },
      { name: 'Background jobs / queues (BullMQ / Celery)', value: 'Background Queues' },
      { name: 'WebSockets (real-time)', value: 'WebSockets' },
      { name: 'File uploads (S3 / local)', value: 'File Uploads' },
      { name: 'Email service (Nodemailer / Resend)', value: 'Email Service' },
    ],
  });

  return { hasBackend: true, framework, apiStyle, validation, backendExtras };
}
