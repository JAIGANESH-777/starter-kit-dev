import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

export async function askFrontend(projectType) {
  if (projectType === 'backend') {
    return { hasFrontend: false };
  }

  console.log(chalk.bold.white('\n── 🎨 Frontend ────────────────────────────────────\n'));

  const framework = await select({
    message: 'Frontend framework:',
    choices: [
      { name: 'Next.js — React, SSR/SSG (recommended for fullstack)', value: 'Next.js' },
      { name: 'React + Vite — SPA, no SSR', value: 'React + Vite' },
      { name: 'Nuxt 3 — Vue 3, SSR', value: 'Nuxt 3' },
      { name: 'SvelteKit — compiled, high-performance', value: 'SvelteKit' },
    ],
  });

  // Styling — recommended first per framework
  const stylingChoices = framework.includes('Nuxt')
    ? [
        { name: 'Tailwind CSS + Nuxt UI (recommended)', value: 'Tailwind CSS + Nuxt UI' },
        { name: 'Tailwind CSS only', value: 'Tailwind CSS' },
        { name: 'CSS Modules', value: 'CSS Modules' },
      ]
    : framework.includes('Svelte')
    ? [
        { name: 'Tailwind CSS + shadcn-svelte (recommended)', value: 'Tailwind CSS + shadcn-svelte' },
        { name: 'Tailwind CSS only', value: 'Tailwind CSS' },
        { name: 'CSS Modules', value: 'CSS Modules' },
      ]
    : [
        { name: 'Tailwind CSS + shadcn/ui (recommended)', value: 'Tailwind CSS + shadcn/ui' },
        { name: 'Tailwind CSS only', value: 'Tailwind CSS' },
        { name: 'MUI (Material UI)', value: 'MUI' },
        { name: 'Chakra UI', value: 'Chakra UI' },
        { name: 'CSS Modules', value: 'CSS Modules' },
      ];
  const styling = await select({ message: 'Styling approach:', choices: stylingChoices });

  // State management — only options that make sense for the chosen framework
  const stateChoices = framework.includes('Nuxt')
    ? [
        { name: 'Pinia (recommended for Vue/Nuxt)', value: 'Pinia' },
        { name: 'Vue built-ins (ref / reactive)', value: 'Vue built-ins' },
      ]
    : framework.includes('Svelte')
    ? [
        { name: 'Svelte Runes / native stores (recommended)', value: 'Svelte stores' },
      ]
    : [
        { name: 'Zustand (recommended — lightweight)', value: 'Zustand' },
        { name: 'React Context API (built-in, no extra deps)', value: 'React Context' },
        { name: 'Redux Toolkit (large apps with complex state)', value: 'Redux Toolkit' },
        { name: 'Jotai (atomic model)', value: 'Jotai' },
        { name: 'None', value: 'None' },
      ];
  const stateManagement = await select({ message: 'State management:', choices: stateChoices });

  // Data fetching — compatible with the chosen framework
  const fetchingChoices = framework.includes('Nuxt')
    ? [
        { name: 'Nuxt useFetch / $fetch composables (recommended)', value: 'Nuxt useFetch' },
        { name: 'TanStack Query + Axios', value: 'TanStack Query + Axios' },
      ]
    : framework.includes('Svelte')
    ? [
        { name: 'SvelteKit load functions + Axios (recommended)', value: 'SvelteKit load + Axios' },
        { name: 'TanStack Query (Svelte adapter)', value: 'TanStack Query' },
      ]
    : [
        { name: 'TanStack Query + Axios (recommended)', value: 'TanStack Query + Axios' },
        { name: 'SWR + Axios (lighter alternative)', value: 'SWR + Axios' },
        { name: 'Plain fetch / Axios (no cache layer)', value: 'Plain fetch/Axios' },
      ];
  const dataFetching = await select({ message: 'Data fetching / server state:', choices: fetchingChoices });

  // Forms — only frameworks that pair naturally
  const formChoices = framework.includes('Nuxt')
    ? [
        { name: 'VeeValidate + Zod (recommended for Vue)', value: 'VeeValidate + Zod' },
        { name: 'FormKit + Zod', value: 'FormKit + Zod' },
        { name: 'None', value: 'None' },
      ]
    : framework.includes('Svelte')
    ? [
        { name: 'Svelte-Superforms + Zod (recommended)', value: 'Svelte-Superforms + Zod' },
        { name: 'None', value: 'None' },
      ]
    : [
        { name: 'React Hook Form + Zod (recommended)', value: 'React Hook Form + Zod' },
        { name: 'Formik + Yup (legacy projects)', value: 'Formik + Yup' },
        { name: 'None', value: 'None' },
      ];
  const formHandling = await select({ message: 'Form handling:', choices: formChoices });

  const frontendExtras = await checkbox({
    message: 'Additional frontend tooling: (space to select, enter to skip)',
    choices: [
      { name: 'Dark mode support', value: 'Dark Mode' },
      { name: 'Storybook (component docs)', value: 'Storybook' },
      { name: 'i18n / internationalisation', value: 'i18n' },
      { name: 'PWA support', value: 'PWA' },
      { name: 'Playwright (E2E tests)', value: 'Playwright' },
    ],
  });

  return { hasFrontend: true, framework, styling, stateManagement, dataFetching, formHandling, frontendExtras };
}
