import chalk from 'chalk';
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
