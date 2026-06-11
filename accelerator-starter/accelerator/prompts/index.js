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
  const backend = await askBackend(projectType, language);
  const database = await askDatabase(projectType, language);
  const auth = await askAuth(projectType, language);
  const infra = await askInfra();
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
