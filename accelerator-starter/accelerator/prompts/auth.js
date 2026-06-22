import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askAuth(projectType, language, backendFramework = '') {
  if (projectType === 'frontend') {
    return { hasAuth: false };
  }

  console.log(chalk.bold.white('\n── 🔐 Authentication & Authorization ───────────────\n'));

  const hasAuth = await confirm({ message: 'Include authentication?' });
  if (!hasAuth) return { hasAuth: false };

  const authStrategy = await select({
    message: 'Auth token strategy:',
    choices: [
      { name: 'JWT + Refresh Tokens (recommended — stateless, scalable)', value: 'JWT + Refresh Tokens' },
      { name: 'JWT Stateless (simpler, no refresh rotation)', value: 'JWT Stateless' },
      { name: 'Session-based (cookie + server-side store)', value: 'Session-based' },
      { name: 'Hybrid JWT + SSO', value: 'Hybrid Multi-Auth' },
    ],
  });

  const authMethods = await checkbox({
    message: 'Auth providers / methods: (space to select)',
    choices: [
      { name: 'Email + Password (recommended baseline)', value: 'Email/Password' },
      { name: 'Google OAuth 2.0', value: 'Google OAuth' },
      { name: 'Microsoft / Azure AD SSO', value: 'Azure AD OAuth' },
      { name: 'GitHub OAuth', value: 'GitHub OAuth' },
      { name: 'Magic Link (passwordless email)', value: 'Magic Link' },
      { name: 'OTP / SMS verification', value: 'OTP/SMS' },
    ],
    validate: (selected) => selected.length > 0 || 'Select at least one auth method.',
  });

  // ── Auth implementation library — scoped by language AND backendFramework ────
  let authProvider;

  if (language === 'Python') {
    if (backendFramework === 'Django') {
      authProvider = await select({
        message: 'Auth implementation:',
        choices: [
          { name: 'Django contrib.auth — built-in, recommended for Django', value: 'Django Auth' },
          { name: 'Authlib — OAuth 2.0 / OIDC flows (works with Django)', value: 'Authlib' },
        ],
      });
    } else {
      // FastAPI (or any other Python backend)
      authProvider = await select({
        message: 'Auth implementation:',
        choices: [
          { name: 'Custom FastAPI (python-jose + passlib) — recommended', value: 'Custom FastAPI Jose/Passlib' },
          { name: 'Authlib — OAuth 2.0 / OIDC flows (works with FastAPI)', value: 'Authlib' },
        ],
      });
    }
  } else {
    // TypeScript / JavaScript backends
    const tsProviderChoices = [
      ...(backendFramework === '' || ['NestJS', 'Express.js', 'Fastify'].includes(backendFramework)
        ? [{ name: 'Passport.js (recommended for NestJS / Express / Fastify)', value: 'Passport.js' }]
        : []),
      { name: 'Auth.js / NextAuth.js (best for Next.js fullstack)', value: 'Auth.js' },
      { name: 'Clerk — managed auth, zero backend auth code', value: 'Clerk' },
      { name: 'Supabase Auth — if using Supabase DB', value: 'Supabase Auth' },
      { name: 'AWS Cognito — if deploying on AWS', value: 'AWS Cognito' },
      { name: 'Keycloak — self-hosted identity server', value: 'Keycloak' },
      { name: 'Custom (in-house handlers)', value: 'Custom' },
    ];
    authProvider = await select({ message: 'Auth library / provider:', choices: tsProviderChoices });
  }

  // RBAC is always included with default roles — no user selection needed
  const roles = ['admin', 'manager', 'editor', 'viewer'];
  console.log(chalk.gray(`  ✔ RBAC enabled with default roles: ${roles.join(', ')}`));

  return {
    hasAuth,
    authStrategy,
    authMethods,
    authProvider,
    hasRBAC: true,
    roles,
    hasMultiTenant: false,
  };
}
