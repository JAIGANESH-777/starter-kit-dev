import { renderSpec } from './renderer.js';

const answers = {
  projectName: 'test-project',
  projectType: 'fullstack',
  language: 'TypeScript',
  frontend: {
    hasFrontend: true,
    framework: 'React + Vite',
    styling: 'Tailwind CSS',
    stateManagement: 'Zustand',
    dataFetching: 'TanStack Query',
    formHandling: 'React Hook Form',
    themeSupport: true,
    frontendExtras: [],
  },
  backend: {
    hasBackend: true,
    framework: 'Express.js',
    apiStyle: 'REST',
    validation: 'Zod',
    backendExtras: ['Redis Caching'], // Redis added here
    language: 'TypeScript'
  },
  database: {
    hasDatabase: true,
    databases: ['PostgreSQL'], // Not Redis
    orm: 'Drizzle ORM',
    hasSeed: true
  },
  auth: {
    hasAuth: true,
    authStrategy: 'JWT',
    authMethods: ['OTP/SMS'], // Check OTP matching
    authProvider: 'Passport.js',
    hasRBAC: false,
    roles: []
  },
  infra: {
    hasDocker: true,
    dockerFeatures: ['Multi-stage Dockerfile', 'docker-compose']
  },
  quality: {
    testingFramework: 'Vitest',
    hasCoverage: true
  },
  generatedAt: new Date().toISOString()
};

const spec = renderSpec(answers);
console.log(spec.substring(spec.indexOf('### Frontend Auth UI Requirements'), spec.indexOf('### Roles (RBAC)')));
console.log(spec.substring(spec.indexOf('services:'), spec.indexOf('frontend:') + 50));
