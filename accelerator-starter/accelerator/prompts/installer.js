import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { runPrompts } from './index.js';
import { renderSpec } from './renderer.js';
import { writeSpec } from './writer.js';

// ── Banner ────────────────────────────────────────────────────────────────────

function printBanner() {
  console.clear();
  console.log('\n' + chalk.bold.cyan('╔══════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('          🛠 ENTERPRISE ARCHITECTURE COMPILER          ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('║') + chalk.gray('    Answer the prompts to generate your SPEC.md file  ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════╝') + '\n');
}

// ── Summary card — shown before writing ──────────────────────────────────────

function printSummary(answers) {
  const { projectName, projectType, language, frontend, backend, database, auth, infra, quality } = answers;

  const row = (label, value) =>
    chalk.gray('  ') + chalk.bold.white(label.padEnd(20)) + chalk.cyan(value || '—');

  const yesno = (v) => (v ? chalk.green('Yes') : chalk.dim('No'));
  const list = (arr) => (arr && arr.length > 0 ? arr.join(', ') : chalk.dim('None'));

  console.log('\n' + chalk.bold.cyan('╔══════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('             📋  CONFIGURATION SUMMARY               ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════╝'));

  console.log('\n' + chalk.bold.white('  ── Project ─────────────────────────────────────────'));
  console.log(row('Name:', projectName));
  console.log(row('Type:', projectType));
  console.log(row('Language:', language));
  if (backend.hasBackend) {
    console.log(row('API Style:', backend.apiStyle));
  }

  if (frontend.hasFrontend) {
    console.log('\n' + chalk.bold.white('  ── Frontend ────────────────────────────────────────'));
    console.log(row('Framework:', frontend.framework));
    console.log(row('Styling:', frontend.styling));
    console.log(row('State:', frontend.stateManagement));
    console.log(row('Data Fetching:', frontend.dataFetching));
    console.log(row('Theme:', frontend.themeSupport ? 'Dark + Light (toggle)' : `${frontend.defaultTheme} only`));
    if (frontend.frontendExtras?.length > 0)
      console.log(row('Extras:', list(frontend.frontendExtras)));
  }

  if (backend.hasBackend) {
    console.log('\n' + chalk.bold.white('  ── Backend ─────────────────────────────────────────'));
    console.log(row('Framework:', backend.framework));
    console.log(row('Validation:', backend.validation));
    if (backend.backendExtras?.length > 0)
      console.log(row('Features:', list(backend.backendExtras)));
  }

  if (database.hasDatabase) {
    console.log('\n' + chalk.bold.white('  ── Database ─────────────────────────────────────────'));
    console.log(row('Database:', list(database.databases)));
    console.log(row('ORM:', database.orm));
    console.log(row('Seed Scripts:', yesno(database.hasSeed)));
  } else {
    console.log('\n' + chalk.bold.white('  ── Database ─────────────────────────────────────────'));
    console.log(row('', chalk.dim('No database')));
  }

  if (auth.hasAuth) {
    console.log('\n' + chalk.bold.white('  ── Auth ─────────────────────────────────────────────'));
    console.log(row('Strategy:', auth.authStrategy));
    console.log(row('Provider:', auth.authProvider));
    console.log(row('Methods:', list(auth.authMethods)));
    console.log(row('RBAC Roles:', list(auth.roles)));
  }

  console.log('\n' + chalk.bold.white('  ── Infrastructure ───────────────────────────────────'));
  console.log(row('Docker:', yesno(infra.hasDocker)));
  if (infra.hasDocker)
    console.log(row('Docker Features:', list(infra.dockerFeatures)));

  console.log('\n' + chalk.bold.white('  ── Testing ──────────────────────────────────────────'));
  console.log(row('Framework:', quality.testingFramework));
  console.log(row('Coverage:', yesno(quality.hasCoverage)));

  console.log('\n' + chalk.gray('  ─────────────────────────────────────────────────────') + '\n');
}

// ── Compatibility Check ──────────────────────────────────────────────────────

function validateCompatibility(answers) {
  const errors = [];
  const warnings = [];

  const { language, backend, database, quality } = answers;

  // 1. Backend framework VS Language
  if (backend.hasBackend) {
    const isPythonFramework = ['FastAPI', 'Django'].includes(backend.framework);
    if (isPythonFramework && language !== 'Python') {
      errors.push(`Backend framework "${backend.framework}" is Python-based, but language is configured as "${language}".`);
    }
    if (!isPythonFramework && language === 'Python') {
      errors.push(`Backend framework "${backend.framework}" is JS/TS-based, but language is configured as "Python".`);
    }
  }

  // 2. Testing framework VS Language
  if (quality.testingFramework && quality.testingFramework !== 'None') {
    if (language === 'Python' && quality.testingFramework !== 'pytest') {
      errors.push(`Testing framework is configured as "${quality.testingFramework}", but Python projects require "pytest".`);
    }
    if (language !== 'Python' && quality.testingFramework === 'pytest') {
      errors.push(`Testing framework is configured as "pytest", but JS/TS projects require "Vitest", "Jest", or "Playwright".`);
    }
  }

  // 3. Database ORM VS Language
  if (database.hasDatabase && database.orm) {
    const pythonORMs = ['SQLAlchemy', 'Tortoise ORM', 'Django ORM', 'Motor', 'MongoEngine'];
    const jsORMs = ['Prisma', 'Drizzle ORM', 'TypeORM', 'Mongoose', 'Knex.js'];

    if (language === 'Python' && jsORMs.some(orm => database.orm.includes(orm))) {
      errors.push(`Database ORM "${database.orm}" is JS/TS-based, but language is configured as "Python".`);
    }
    if (language !== 'Python' && pythonORMs.some(orm => database.orm.includes(orm))) {
      errors.push(`Database ORM "${database.orm}" is Python-based, but language is configured as "${language}".`);
    }
  }

  return { errors, warnings };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  printBanner();

  let answers;
  try {
    answers = await runPrompts();
  } catch (err) {
    if (err.name === 'ExitPromptError' || err.message?.includes('User force closed')) {
      console.log(chalk.yellow('\n\n  Configuration cancelled. No file was written.\n'));
      process.exit(0);
    }
    throw err;
  }

  // Check for compatibility errors before summarizing
  const { errors, warnings } = validateCompatibility(answers);
  if (errors.length > 0) {
    console.error(chalk.bold.red('\n❌ Compatibility Errors Detected:\n'));
    errors.forEach((err) => console.error(chalk.red(`  • ${err}`)));
    console.error(chalk.yellow('\nPlease run the installer again and select compatible options.\n'));
    process.exit(1);
  }
  if (warnings.length > 0) {
    console.warn(chalk.bold.yellow('\n⚠️ Compatibility Warnings:\n'));
    warnings.forEach((warn) => console.warn(chalk.yellow(`  • ${warn}`)));
    console.log();
  }

  // Show summary and ask for confirmation before writing
  printSummary(answers);

  let confirmed;
  try {
    confirmed = await confirm({
      message: chalk.bold('Generate SPEC.md with this configuration?'),
      default: true,
    });
  } catch (err) {
    if (err.name === 'ExitPromptError' || err.message?.includes('User force closed')) {
      console.log(chalk.yellow('\n  Cancelled — no file written.\n'));
      process.exit(0);
    }
    throw err;
  }

  if (!confirmed) {
    console.log(chalk.yellow('\n  Cancelled — no file written.\n'));
    process.exit(0);
  }

  try {
    const markdown = renderSpec(answers);
    const outputPath = await writeSpec(markdown);

    console.log('\n' + chalk.bold.green('══════════════════════════════════════════════════════'));
    console.log(chalk.bold.green('  ✅ SPEC.md successfully generated!'));
    console.log(chalk.bold.green('══════════════════════════════════════════════════════\n'));
    console.log(chalk.bold('📄 Written to: ') + chalk.cyan.underline(outputPath));
    console.log('\n' + chalk.bold('Next steps:'));
    console.log(chalk.gray('  1. Review the generated SPEC.md'));
    console.log(chalk.gray('  2. Paste its contents into Claude Code, Codex, or Cursor'));
    console.log(chalk.gray('  3. Watch your boilerplate get built ✨\n'));
  } catch (err) {
    console.error(chalk.bold.red('\n[ERROR] Failed to write SPEC.md:'), chalk.red(err.message));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(chalk.bold.red('\n  Unexpected error:'), err);
  process.exit(1);
});
