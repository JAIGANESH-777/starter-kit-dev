import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askQuality(language) {
  console.log(chalk.bold.white('\n── 🧪 Testing & Quality Assurance ──────────────────\n'));

  // ── Primary testing framework ─────────────────────────────────────────────
  // Python: pytest only. JS/TS: Vitest / Jest / Cypress / Playwright / None.
  // Cypress and Playwright are valid PRIMARY frameworks for E2E-first projects.
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
        { name: 'Cypress — E2E browser testing, component testing', value: 'Cypress' },
        { name: 'Playwright — cross-browser E2E automation', value: 'Playwright' },
        { name: 'None', value: 'None' },
      ],
  });

  if (testingFramework === 'None') {
    return { testingFramework: 'None', testTypes: [], hasCoverage: false };
  }

  // ── Test types — filtered by what makes sense for the chosen framework ────
  let testTypeChoices;

  if (language === 'Python') {
    testTypeChoices = [
      { name: 'Unit tests', value: 'Unit tests' },
      { name: 'Integration tests', value: 'Integration tests' },
      { name: 'API tests (httpx + pytest)', value: 'API tests' },
      { name: 'E2E tests (Playwright for Python)', value: 'E2E (Playwright)' },
    ];
  } else if (testingFramework === 'Cypress') {
    // Cypress IS the E2E framework — don't offer duplicate Cypress option
    testTypeChoices = [
      { name: 'E2E tests (full user flows)', value: 'E2E tests' },
      { name: 'Component tests (Cypress component testing)', value: 'Component tests' },
      { name: 'API tests (cy.request)', value: 'API tests' },
    ];
  } else if (testingFramework === 'Playwright') {
    // Playwright IS the E2E framework — filter accordingly
    testTypeChoices = [
      { name: 'E2E tests (full user flows)', value: 'E2E tests' },
      { name: 'API tests (Playwright API testing)', value: 'API tests' },
    ];
  } else {
    // Vitest or Jest — unit/integration/API primary, can add E2E on top
    testTypeChoices = [
      { name: 'Unit tests', value: 'Unit tests' },
      { name: 'Integration tests', value: 'Integration tests' },
      { name: 'API tests (Supertest)', value: 'API tests' },
      { name: 'E2E tests (Playwright)', value: 'E2E (Playwright)' },
      { name: 'E2E tests (Cypress)', value: 'E2E (Cypress)' },
    ];
  }

  const testTypes = await checkbox({
    message: 'Test types to include: (space to select, enter to skip)',
    choices: testTypeChoices,
  });

  // ── Coverage — only meaningful for unit/integration frameworks ─────────────
  // Cypress and Playwright don't have traditional line coverage thresholds.
  const hasCoverage = (testingFramework === 'Vitest' || testingFramework === 'Jest' || language === 'Python')
    ? await confirm({ message: 'Enforce code coverage thresholds (min 80%)?' })
    : false;

  return { testingFramework, testTypes, hasCoverage };
}
