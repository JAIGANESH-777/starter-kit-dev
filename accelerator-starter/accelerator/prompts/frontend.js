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

  // ── Axios — asked separately as a standalone HTTP client decision ─────────
  const useAxios = await confirm({
    message: 'Use Axios for HTTP requests?',
    default: true,
  });

  // ── Data fetching / cache layer — nested question ─────────────────────────
  // TanStack Query, SWR, etc. are cache/state layers that sit on top of Axios or fetch.
  let dataFetching;
  if (framework.includes('Nuxt')) {
    dataFetching = await select({
      message: 'Data fetching / cache layer:',
      choices: [
        { name: 'Nuxt useFetch / $fetch composables (recommended)', value: 'Nuxt useFetch' },
        { name: 'TanStack Query (Vue adapter)', value: 'TanStack Query' },
      ],
    });
  } else if (framework.includes('Svelte')) {
    dataFetching = await select({
      message: 'Data fetching / cache layer:',
      choices: [
        { name: 'SvelteKit load functions (recommended)', value: 'SvelteKit load' },
        { name: 'TanStack Query (Svelte adapter)', value: 'TanStack Query' },
      ],
    });
  } else {
    dataFetching = await select({
      message: 'Data fetching / cache layer:',
      choices: [
        { name: 'TanStack Query (recommended — smart caching + refetching)', value: 'TanStack Query' },
        { name: 'SWR (lighter alternative)', value: 'SWR' },
        { name: 'Plain fetch (no cache layer)', value: 'Plain fetch' },
      ],
    });
  }

  // Combine Axios with the cache layer label for downstream rendering
  if (useAxios && dataFetching === 'TanStack Query') {
    dataFetching = 'TanStack Query + Axios';
  } else if (useAxios && dataFetching === 'SWR') {
    dataFetching = 'SWR + Axios';
  } else if (useAxios && dataFetching === 'Plain fetch') {
    dataFetching = 'Plain fetch/Axios';
  } else if (useAxios && dataFetching === 'SvelteKit load') {
    dataFetching = 'SvelteKit load + Axios';
  }

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

  // ── Theme support ─────────────────────────────────────────────────────────
  const themeSupport = await confirm({
    message: 'Include theme support (dark + light with toggle)?',
    default: true,
  });

  let defaultTheme = 'dark';
  if (!themeSupport) {
    defaultTheme = await select({
      message: 'Default theme:',
      choices: [
        { name: 'Dark', value: 'dark' },
        { name: 'Light', value: 'light' },
      ],
    });
  }

  // ── Additional frontend tooling ───────────────────────────────────────────
  const extrasChoices = [
    { name: 'Playwright (E2E frontend tests)', value: 'Playwright' },
  ];

  if (framework === 'Next.js') {
    extrasChoices.push(
      { name: 'Jest + React Testing Library (Unit/Component testing)', value: 'Jest + Testing Library' },
      { name: 'Vitest + React Testing Library (Unit/Component testing)', value: 'Vitest + Testing Library' }
    );
  } else {
    const testingLibraryLabel = framework.includes('Nuxt')
      ? 'Vitest + Vue Test Utils (Unit/Component testing)'
      : framework.includes('Svelte')
      ? 'Vitest + Testing Library for Svelte (Unit/Component testing)'
      : 'Vitest + React Testing Library (Unit/Component testing)';

    extrasChoices.push(
      { name: testingLibraryLabel, value: 'Vitest + Testing Library' }
    );
  }

  extrasChoices.push(
    { name: 'MSW (Mock Service Worker — API mocking)', value: 'MSW' }
  );

  const frontendExtras = await checkbox({
    message: 'Additional frontend tooling: (space to select, enter to skip)',
    choices: extrasChoices,
  });

  return {
    hasFrontend: true,
    framework,
    styling,
    stateManagement,
    dataFetching,
    formHandling,
    themeSupport,
    defaultTheme,
    frontendExtras,
  };
}
