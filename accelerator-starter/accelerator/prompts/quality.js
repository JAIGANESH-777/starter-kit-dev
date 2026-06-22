import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askQuality(language) {
  console.log(chalk.bold.white('\n── 🧪 Testing & Quality Assurance ──────────────────\n'));

  // ── Primary testing framework ─────────────────────────────────────────────
  // Choices are filtered by language to prevent incompatible selections.
  // Python → pytest only. JS/TS → Vitest / Jest / Playwright / None.
  const testingFramework = await select({
    message: 'Primary testing framework:',
    choices: language === 'Python'
      ? [
        { name: 'pytest — standard Python testing (recommended)', value: 'pytest' },
        { name: 'None', value: 'None' },
      ]
      : [
        { name: 'Vitest — fast, ESM-native, Vite-integrated (recommended)', value: 'Vitest' },
        { name: 'Jest — mature, widely used', value: 'Jest' },
        { name: 'Playwright — cross-browser E2E automation', value: 'Playwright' },
        { name: 'None', value: 'None' },
      ],
  });

  if (testingFramework === 'None') {
    return { testingFramework: 'None', hasCoverage: false };
  }

  // ── Coverage — enabled by default for unit/integration frameworks ───────────
  const hasCoverage = (testingFramework === 'Vitest' || testingFramework === 'Jest' || language === 'Python');

  return { testingFramework, hasCoverage };
}
