import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askProjectBasics() {
  console.log(chalk.bold.white('\n── 📋 Project Basics ──────────────────────────────\n'));

  const projectName = await input({
    message: 'Project name:',
    default: 'accelerator-app',
    validate: (val) => val.trim().length > 0 || 'Project name cannot be empty',
  });

  const description = await input({
    message: 'Short project description:',
    default: 'An enterprise-grade full-stack web application.',
  });

  const projectType = await select({
    message: 'Project type:',
    choices: [
      { name: 'Full-Stack Web App (Frontend + Backend + DB)', value: 'fullstack' },
      { name: 'Backend API only', value: 'backend' },
      { name: 'Frontend only', value: 'frontend' },
    ],
  });

  // API style is a foundational architectural decision — ask it early because
  // it influences backend framework recommendations and frontend data-fetching patterns.
  let apiStyle = 'REST';
  if (projectType !== 'frontend') {
    apiStyle = await select({
      message: 'API style:',
      choices: [
        { name: 'REST (recommended — universal, well-understood)', value: 'REST' },
        { name: 'GraphQL (complex querying, flexible schema)', value: 'GraphQL' },
        { name: 'REST + GraphQL hybrid', value: 'REST + GraphQL' },
      ],
    });
  }

  return { projectName, description, projectType, apiStyle };
}
