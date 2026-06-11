import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askAuth(projectType, language) {
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
      { name: 'Apple Sign-In', value: 'Apple Sign-In' },
      { name: 'SAML 2.0 (enterprise SSO)', value: 'SAML 2.0' },
      { name: 'OTP / SMS verification', value: 'OTP/SMS' },
    ],
    validate: (selected) => selected.length > 0 || 'Select at least one auth method.',
  });

  // Provider choices scoped to language and framework context
  let authProvider;
  if (language === 'Python') {
    authProvider = await select({
      message: 'Auth implementation:',
      choices: [
        { name: 'Custom FastAPI (python-jose + passlib) — recommended', value: 'Custom FastAPI Jose/Passlib' },
        { name: 'Django contrib.auth (Django projects only)', value: 'Django Auth' },
        { name: 'Authlib (OAuth / OIDC flows)', value: 'Authlib' },
      ],
    });
  } else {
    authProvider = await select({
      message: 'Auth library / provider:',
      choices: [
        { name: 'Auth.js / NextAuth.js (recommended for Next.js)', value: 'Auth.js' },
        { name: 'Passport.js (recommended for NestJS / Express)', value: 'Passport.js' },
        { name: 'Clerk — managed auth, zero backend auth code', value: 'Clerk' },
        { name: 'Supabase Auth — if using Supabase DB', value: 'Supabase Auth' },
        { name: 'AWS Cognito — if deploying on AWS', value: 'AWS Cognito' },
        { name: 'Keycloak — self-hosted identity server', value: 'Keycloak' },
        { name: 'Custom (in-house handlers)', value: 'Custom' },
      ],
    });
  }

  const hasRBAC = await confirm({ message: 'Include Role-Based Access Control (RBAC)?' });
  let roles = [];
  if (hasRBAC) {
    roles = await checkbox({
      message: 'Define roles: (space to select — you can customise after)',
      choices: [
        { name: 'super_admin', value: 'super_admin' },
        { name: 'admin', value: 'admin' },
        { name: 'manager', value: 'manager' },
        { name: 'editor', value: 'editor' },
        { name: 'viewer', value: 'viewer' },
        { name: 'guest', value: 'guest' },
      ],
    });
  }

  const hasMultiTenant = await confirm({ message: 'Multi-tenant architecture? (separate data per organisation/team)' });

  return { hasAuth, authStrategy, authMethods, authProvider, hasRBAC, roles, hasMultiTenant };
}
