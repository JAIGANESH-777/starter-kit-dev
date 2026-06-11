import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askQuality(language) {
  console.log(chalk.bold.white('\n── 🧪 Testing & Quality Assurance ──────────────────\n'));

  const testingFramework = await select({
    message: 'Primary testing framework:',
    choices: language === 'Python'
      ? [
          { name: 'pytest (standard Python testing)', value: 'pytest' },
          { name: 'None', value: 'None' },
        ]
      : [
          { name: 'Vitest (fast, ESM-native)', value: 'Vitest' },
          { name: 'Jest', value: 'Jest' },
          { name: 'None', value: 'None' },
        ],
  });

  const testTypes = testingFramework === 'None'
    ? []
    : await checkbox({
        message: 'Test types to include: (space to select, enter to skip)',
        choices: [
          { name: 'Unit tests', value: 'Unit tests' },
          { name: 'Integration tests', value: 'Integration tests' },
          { name: 'E2E tests (Playwright)', value: 'E2E (Playwright)' },
          { name: 'E2E tests (Cypress)', value: 'E2E (Cypress)' },
          { name: 'API tests (Supertest / httpx)', value: 'API tests' },
        ],
      });

  const hasCoverage = testingFramework !== 'None'
    ? await confirm({ message: 'Enforce code coverage thresholds (min 80%)?' })
    : false;

  return { testingFramework, testTypes, hasCoverage };
}
