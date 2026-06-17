import { askProjectBasics } from './basics.js';
import { askFrontend } from './frontend.js';
import { askBackend } from './backend.js';
import { askDatabase } from './database.js';
import { askAuth } from './auth.js';
import { askInfra } from './infra.js';
import { askQuality } from './quality.js';

export async function runPrompts() {
  const basics = await askProjectBasics();
  const { projectType, language } = basics;

  const frontend = await askFrontend(projectType);
  const backend  = await askBackend(projectType, language);

  // Pass backend.framework downstream so database + auth can filter
  // incompatible options (e.g. Django ORM when FastAPI is selected).
  const backendFramework = backend.hasBackend ? backend.framework : '';

  const database = await askDatabase(projectType, language, backendFramework);
  const auth     = await askAuth(projectType, language, backendFramework);

  // Pass language so infra can show Python vs JS/TS code-quality tools.
  const infra   = await askInfra(language);
  const quality = await askQuality(language);

  return {
    ...basics,
    frontend,
    backend,
    database,
    auth,
    infra,
    quality,
    generatedAt: new Date().toISOString(),
  };
}
