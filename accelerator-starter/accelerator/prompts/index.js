import { confirm } from '@inquirer/prompts';
import { askProjectBasics } from './basics.js';
import { askFrontend } from './frontend.js';
import { askBackend } from './backend.js';
import { askDatabase } from './database.js';
import { askAuth } from './auth.js';
import { askQuality } from './quality.js';

export async function runPrompts() {
  const basics = await askProjectBasics();
  const { projectType, apiStyle } = basics;

  const frontend = await askFrontend(projectType);

  // Pass apiStyle from basics so backend doesn't re-ask it
  const backend  = await askBackend(projectType, apiStyle);

  // Derive language from backend framework choice; default to TypeScript/JavaScript (based on prompt) for frontend-only
  let language = 'TypeScript';
  if (backend.hasBackend) {
    language = backend.language;
  } else {
    const useTypeScript = await confirm({
      message: 'Use TypeScript?',
      default: true,
    });
    language = useTypeScript ? 'TypeScript' : 'JavaScript';
  }

  // Pass backend.framework downstream so database + auth can filter
  // incompatible options (e.g. Django ORM when FastAPI is selected).
  const backendFramework = backend.hasBackend ? backend.framework : '';

  const database = await askDatabase(projectType, language, backendFramework);
  const auth     = await askAuth(projectType, language, backendFramework);
  const quality  = await askQuality(language);

  // ── Hardcoded infrastructure defaults ──────────────────────────────────────
  // Cloud platform, Terraform, CI/CD, code quality, and infra extras have been
  // removed from the interactive prompts. Docker setup uses sensible defaults.
  const infra = {
    cloud: 'N/A',
    hasTerraform: false,
    hasDocker: true,
    dockerFeatures: ['Multi-stage Dockerfile', 'docker-compose', '.dockerignore'],
    hasCICD: false,
    cicdPlatform: null,
    cicdSteps: ['Lint', 'Type check', 'Unit tests', 'E2E tests', 'Build'],
    codeQuality: [],
    infraExtras: [],
  };

  return {
    ...basics,
    language,
    frontend,
    backend,
    database,
    auth,
    infra,
    quality,
    generatedAt: new Date().toISOString(),
  };
}
