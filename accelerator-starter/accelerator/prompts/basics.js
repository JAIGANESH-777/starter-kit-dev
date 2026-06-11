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

  // Language is always TypeScript for frontend-only; ask only when backend is involved
  let language = 'TypeScript';
  if (projectType !== 'frontend') {
    language = await select({
      message: 'Primary language:',
      choices: [
        { name: 'TypeScript / JavaScript ecosystem', value: 'TypeScript' },
        { name: 'Python ecosystem', value: 'Python' },
      ],
    });
  }

  return { projectName, description, projectType, language };
}
