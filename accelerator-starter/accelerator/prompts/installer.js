import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { runPrompts } from './index.js';
import { renderSpec } from './renderer.js';
import { writeSpec } from './writer.js';

// ── Banner ────────────────────────────────────────────────────────────────────

function printBanner() {
  console.clear();
  console.log('\n' + chalk.bold.cyan('╔══════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('    🛠  ACCELERATOR ENTERPRISE ARCHITECTURE COMPILER  ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('║') + chalk.gray('    Answer the prompts to generate your SPEC.md file  ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════╝') + '\n');
}

// ── Summary card — shown before writing ──────────────────────────────────────

function printSummary(answers) {
  const { projectName, projectType, language, frontend, backend, database, auth, infra, quality } = answers;

  const row = (label, value) =>
    chalk.gray('  ') + chalk.bold.white(label.padEnd(20)) + chalk.cyan(value || '—');

  const tag = (v) => (v ? chalk.green('✔  ' + v) : chalk.dim('—'));
  const yesno = (v) => (v ? chalk.green('Yes') : chalk.dim('No'));
  const list = (arr) => (arr && arr.length > 0 ? arr.join(', ') : chalk.dim('None'));

  console.log('\n' + chalk.bold.cyan('╔══════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('             📋  CONFIGURATION SUMMARY               ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════╝'));

  console.log('\n' + chalk.bold.white('  ── Project ─────────────────────────────────────────'));
  console.log(row('Name:', projectName));
  console.log(row('Type:', projectType));
  console.log(row('Language:', language));

  if (frontend.hasFrontend) {
    console.log('\n' + chalk.bold.white('  ── Frontend ────────────────────────────────────────'));
    console.log(row('Framework:', frontend.framework));
    console.log(row('Styling:', frontend.styling));
    console.log(row('State:', frontend.stateManagement));
    console.log(row('Data Fetching:', frontend.dataFetching));
    if (frontend.frontendExtras?.length > 0)
      console.log(row('Extras:', list(frontend.frontendExtras)));
  }

  if (backend.hasBackend) {
    console.log('\n' + chalk.bold.white('  ── Backend ─────────────────────────────────────────'));
    console.log(row('Framework:', backend.framework));
    console.log(row('API Style:', backend.apiStyle));
    console.log(row('Validation:', backend.validation));
    if (backend.backendExtras?.length > 0)
      console.log(row('Features:', list(backend.backendExtras)));
  }

  if (database.hasDatabase) {
    console.log('\n' + chalk.bold.white('  ── Database ─────────────────────────────────────────'));
    console.log(row('Databases:', list(database.databases)));
    console.log(row('ORM:', database.orm));
    console.log(row('Migrations:', yesno(database.hasMigrations)));
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
    console.log(row('RBAC:', yesno(auth.hasRBAC)));
    console.log(row('Multi-Tenant:', yesno(auth.hasMultiTenant)));
  }

  console.log('\n' + chalk.bold.white('  ── Infrastructure ───────────────────────────────────'));
  console.log(row('Cloud:', infra.cloud));
  console.log(row('Docker:', yesno(infra.hasDocker)));
  console.log(row('CI/CD:', infra.hasCICD ? infra.cicdPlatform : chalk.dim('No')));
  console.log(row('Terraform:', yesno(infra.hasTerraform)));
  if (infra.codeQuality?.length > 0)
    console.log(row('Code Quality:', list(infra.codeQuality)));

  console.log('\n' + chalk.bold.white('  ── Testing ──────────────────────────────────────────'));
  console.log(row('Framework:', quality.testingFramework));
  if (quality.testTypes?.length > 0)
    console.log(row('Test Types:', list(quality.testTypes)));
  console.log(row('Coverage:', yesno(quality.hasCoverage)));

  console.log('\n' + chalk.gray('  ─────────────────────────────────────────────────────') + '\n');
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
