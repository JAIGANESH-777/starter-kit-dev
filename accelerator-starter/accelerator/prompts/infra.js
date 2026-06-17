import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askInfra(language = 'TypeScript') {
  console.log(chalk.bold.white('\n── 🚀 Infrastructure & DevOps ──────────────────────\n'));

  const cloud = await select({
    message: 'Target cloud / deployment platform:',
    choices: [
      { name: 'AWS (ECS / EC2 / Fargate)', value: 'AWS' },
      { name: 'Microsoft Azure (App Services / AKS)', value: 'Azure' },
      { name: 'Google Cloud Platform (Cloud Run / GKE)', value: 'GCP' },
      { name: 'Vercel + Railway', value: 'Vercel + Railway' },
      { name: 'Vercel (Next.js full-stack)', value: 'Vercel' },
      { name: 'Fly.io', value: 'Fly.io' },
      { name: 'Render', value: 'Render' },
      { name: 'DigitalOcean App Platform', value: 'DigitalOcean' },
      { name: 'Self-hosted / VPS (Docker Compose)', value: 'Docker-Compose' },
    ],
  });

  const hasTerraform = await confirm({ message: 'Generate Terraform IaC manifests?' });

  // ── Docker ──────────────────────────────────────────────────────────────────
  const hasDocker = await confirm({ message: 'Include Docker setup?' });
  let dockerFeatures = [];
  if (hasDocker) {
    dockerFeatures = await checkbox({
      message: 'Docker setup includes: (space to select)',
      choices: [
        { name: 'Dockerfile (production multi-stage)', value: 'Multi-stage Dockerfile' },
        { name: 'docker-compose (local dev)', value: 'docker-compose' },
        { name: '.dockerignore', value: '.dockerignore' },
        { name: 'Healthcheck instructions', value: 'Docker Healthchecks' },
      ],
    });
  }

  // ── CI/CD ───────────────────────────────────────────────────────────────────
  const hasCICD = await confirm({ message: 'Include CI/CD pipeline?' });
  let cicdPlatform = null;
  let cicdSteps    = [];
  if (hasCICD) {
    cicdPlatform = await select({
      message: 'CI/CD platform:',
      choices: [
        { name: 'GitHub Actions', value: 'GitHub Actions' },
        { name: 'GitLab CI/CD', value: 'GitLab CI' },
        { name: 'CircleCI', value: 'CircleCI' },
        { name: 'Jenkins', value: 'Jenkins' },
        { name: 'Bitbucket Pipelines', value: 'Bitbucket Pipelines' },
      ],
    });

    // CI steps — language-aware so Python projects don't see "Build" (no compile step)
    const ciStepChoices = [
      { name: language === 'Python' ? 'Lint (Ruff)' : 'Lint (ESLint / Ruff)', value: 'Lint' },
      { name: language === 'Python' ? 'Type check (mypy)' : 'Type check (tsc / mypy)', value: 'Type check' },
      { name: 'Unit tests', value: 'Unit tests' },
      { name: 'E2E tests', value: 'E2E tests' },
      // Python has no build step (source is deployed directly)
      ...(language !== 'Python' ? [{ name: 'Build', value: 'Build' }] : []),
      { name: 'Docker build & push', value: 'Docker build & push' },
      { name: 'Deploy to staging', value: 'Deploy staging' },
      { name: 'Deploy to production (manual approval)', value: 'Deploy production' },
    ];

    cicdSteps = await checkbox({
      message: 'Pipeline steps: (space to select)',
      choices: ciStepChoices,
    });
  }

  // ── Code Quality ─────────────────────────────────────────────────────────────
  // Scoped to language: Python projects get Python linting/formatting tools;
  // TypeScript projects get JS/TS tooling. Mixing them pollutes the generated SPEC.
  console.log(chalk.bold.white('\n── 🧹 Code Quality & Developer Tooling ─────────────\n'));

  const codeQualityChoices = language === 'Python'
    ? [
        { name: 'Ruff — fast Python linter + formatter (replaces Flake8 + isort + Black)', value: 'Ruff' },
        { name: 'Black — opinionated Python code formatter', value: 'Black' },
        { name: 'mypy — static type checker for Python', value: 'mypy' },
        { name: 'pre-commit — git hooks (runs Ruff/Black/mypy before commits)', value: 'pre-commit' },
        { name: 'SonarQube / SonarCloud (static analysis)', value: 'SonarQube' },
        { name: 'EditorConfig', value: 'EditorConfig' },
      ]
    : [
        { name: 'ESLint (linting)', value: 'ESLint' },
        { name: 'Prettier (formatting)', value: 'Prettier' },
        { name: 'Husky (git hooks)', value: 'Husky' },
        { name: 'lint-staged (run linters on staged files)', value: 'lint-staged' },
        { name: 'Commitlint (conventional commits)', value: 'Commitlint' },
        { name: 'SonarQube / SonarCloud (static analysis)', value: 'SonarQube' },
        { name: 'EditorConfig', value: 'EditorConfig' },
      ];

  const codeQuality = await checkbox({
    message: 'Code quality tools: (space to select, enter to skip)',
    choices: codeQualityChoices,
  });

  // ── Additional infra extras ─────────────────────────────────────────────────
  const infraExtras = await checkbox({
    message: 'Additional infrastructure: (space to select, enter to skip)',
    choices: [
      { name: 'Kubernetes (K8s) manifests', value: 'Kubernetes' },
      { name: 'Nginx reverse proxy config', value: 'Nginx' },
      { name: 'CDN setup (CloudFront / Cloudflare)', value: 'CDN' },
      { name: "SSL/TLS with Let's Encrypt", value: "Let's Encrypt SSL" },
      { name: 'Secrets management (Vault / AWS SSM)', value: 'Secrets Management' },
    ],
  });

  return {
    cloud,
    hasTerraform,
    hasDocker,
    dockerFeatures,
    hasCICD,
    cicdPlatform,
    cicdSteps,
    codeQuality,
    infraExtras,
  };
}
