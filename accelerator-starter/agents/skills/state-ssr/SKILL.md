---
name: state-ssr
description: Enforce correct SSR boundaries and prevent hydration mismatches across Next.js (RSC), Nuxt 3, and SvelteKit. Isolate server state from client UI state and apply the correct data-fetching composable/hook per framework.
---

# State Management & SSR Boundaries Skill

This skill teaches the coding agent how to write robust, error-free frontend code for SSR-capable frameworks (Next.js App Router, Nuxt 3, SvelteKit). It defines strict rules for handling browser APIs, dividing server/client execution contexts, and separating fetched server data from client UI state.

---

## 1. Preventing Hydration Mismatches

Hydration errors happen when the server-rendered HTML does not match the initial client-rendered HTML. This typically happens when using browser-only variables (like `window`, `document`, `localStorage`, or random numbers/dates) directly in the render path.

### The Rules
1. **No direct window/storage access during render**: Never read from `window` or `localStorage` when initializing state or directly in JSX.
2. **Mount Gating**: Use a mount-check hook or `useEffect` to ensure browser-only values are only rendered after the component has mounted on the client.

### Anti-Pattern: Hydration Mismatch
```typescript
// ❌ CRITICAL BUG: This will crash with hydration errors on Next.js/Nuxt
const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  return <div>Current theme: {theme}</div>;
};
```

### Correct Pattern: Client-Safe Mounting
```typescript
// ✅ SAFE: Gated initialization ensures the server and initial client renders match
import { useState, useEffect } from 'react';

export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (hasMounted) {
      setTheme(localStorage.getItem('theme') || 'light');
    }
  }, [hasMounted]);

  if (!hasMounted) {
    return <div className="skeleton-placeholder" />; // Server/Initial render
  }

  return <div>Current theme: {theme}</div>;
};
```

---

## 2. Server State vs. Client UI State

Do not mix API data cache (Server State) with UI state (Client State). Duplicate storage creates sync lag, memory leaks, and cache invalidation bugs.

### State Boundaries
* **Server State (API Responses)**: Must be managed by SWR or React Query. Let SWR handle caching, polling, and refetching.
* **Client UI State (Modals, Theme, Flags)**: Managed by Jotai, Zustand, or React Context.
* **The Rule**: Never copy data returned from SWR/React Query into Jotai, Zustand, or local `useState` variables. Always query SWR directly in components that need the data.

### Anti-Pattern: Duplicate State Sync
```typescript
// ❌ WRONG: Syncing API data into local state creates multiple sources of truth
const UserProfile = () => {
  const { data: user } = useSWR('/api/user', fetcher);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) setUserName(user.name);
  }, [user]);

  // Updating username will not update SWR's cache!
};
```

### Correct Pattern: Single Source of Truth
```typescript
// ✅ CORRECT: Mutate the server cache directly, keep local state for form input only
import useSWR, { useSWRConfig } from 'swr';

const UserProfile = () => {
  const { data: user, mutate } = useSWR('/api/user', fetcher);
  const [inputVal, setInputVal] = useState('');

  const handleUpdate = async () => {
    // 1. Optimistic update
    mutate({ ...user, name: inputVal }, false);
    // 2. Perform API call
    await api.updateUser({ name: inputVal });
    // 3. Revalidate cache
    mutate();
  };
};
```

---

## 3. Server Components (RSC) vs. Client Components — Next.js App Router

Next.js App Router uses Server Components by default. Treat Client Components (`"use client"`) as leaf nodes rather than roots.

### Design Patterns
1. **Data Fetching belongs on the Server**: Fetch initial page data in Server Components (using async/await) and pass it down as props.
2. **Client Components are for Interactivity**: Use `"use client"` only for components using event listeners (`onClick`, `onChange`), React hooks (`useState`, `useContext`, `useEffect`), or browser APIs.
3. **Children Composition**: Pass client components as children or slots into server components to avoid turning the entire layout client-side.

### Composition Example
```typescript
// ✅ Server Component (Default layout/page)
// Performs database/API call directly on the server
import { db } from '@/lib/db';
import { InteractiveChart } from './interactive-chart'; // client component

export default async function Page() {
  const stats = await db.getStats();

  return (
    <div className="layout">
      <h1>Dashboard Stats</h1>
      {/* Client component accepts static props from server component */}
      <InteractiveChart data={stats} />
    </div>
  );
}
```

---

## 4. Nuxt 3 SSR Patterns

Nuxt 3 has its own SSR composables that are completely different from React's hooks. Using the wrong ones causes hydration errors or client-only behavior.

### 4.1 `useFetch` vs `$fetch` vs `useAsyncData`

| Composable | Runs on | Use when |
|:---|:---|:---|
| `useFetch(url)` | Server + Client (deduped) | Page-level data — fetches on server, rehydrates on client |
| `useAsyncData(key, fn)` | Server + Client (deduped) | When you need full control over the fetch function |
| `$fetch(url)` | Client only (in components) | Triggered actions (form submit, button click) |
| `useLazyFetch` | Client only after mount | Data that should NOT block page render |

```typescript
// ✅ CORRECT: Server-side data fetch in a page component
// pages/dashboard.vue
<script setup lang="ts">
// This runs on the server AND rehydrates on client — no double fetch
const { data: users, error } = await useFetch('/api/users', {
  server: true,  // default — fetch on server
  lazy: false,   // default — blocks render until resolved
});
</script>

// ✅ For SSR inside Docker: use the backend service name, not localhost
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private — server-side only (SSR fetches inside Docker use service name)
    apiBaseInternal: process.env.NUXT_API_BASE_INTERNAL || 'http://backend:8000/api',
    // Public — exposed to client
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    },
  },
});

// In a composable — use correct URL per context
const runtimeConfig = useRuntimeConfig();
const apiBase = process.server
  ? runtimeConfig.apiBaseInternal  // Docker service name for SSR
  : runtimeConfig.public.apiBase;  // localhost for browser
```

### 4.2 Nuxt `useState` — SSR-Safe State (NOT React's useState)

Nuxt provides its own `useState<T>()` composable. It is SSR-safe — the server state is serialized and rehydrated on the client with the same key.

```typescript
// ✅ CORRECT: Nuxt useState — shared across composables, SSR-safe
// composables/useTheme.ts
export const useTheme = () => {
  // Key must be unique — Nuxt uses it to deduplicate between server and client
  const theme = useState<'light' | 'dark'>('theme', () => 'light');

  const toggle = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  return { theme, toggle };
};

// ❌ WRONG: Using plain ref() for shared state — NOT synced between SSR and client
// const theme = ref('light');  ← will cause hydration mismatch
```

### 4.3 `useCookie` — SSR-Safe Cookie Access

Never use `document.cookie` directly in Nuxt. Use the `useCookie` composable which works on both server and client.

```typescript
// ✅ CORRECT
const token = useCookie('auth-token', {
  httpOnly: false,  // must be false to read in client-side composables
  secure: true,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
});

// Reading: token.value
// Writing: token.value = 'new-token-value'
// Deleting: token.value = null
```

### 4.4 Nuxt Server Routes (BFF Pattern)

For Python backends (FastAPI/Django), Nuxt's `server/api/` routes act as a Backend-For-Frontend (BFF) proxy — handling auth headers or reformatting responses without exposing backend URLs to the browser.

```typescript
// server/api/users.get.ts — runs on Nuxt's Node.js server, NOT in the browser
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // Uses internal Docker service name — never exposed to browser
  const data = await $fetch(`${config.apiBaseInternal}/users`, {
    headers: {
      // Forward auth cookie from incoming request
      Cookie: getHeader(event, 'cookie') || '',
    },
  });
  return data;
});

// pages/users.vue — calls Nuxt server route, not backend directly
const { data } = await useFetch('/api/users');
```

### 4.5 Pinia + SSR

Pinia is Nuxt's recommended state management. Always use `defineStore()` with the Options API or Setup syntax — and never access `localStorage`/`sessionStorage` directly inside store state or getters.

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  // ✅ Use useCookie for persistence — works on server AND client
  const token = useCookie<string | null>('auth-token');

  async function login(credentials: LoginPayload) {
    const data = await $fetch('/api/auth/login', { method: 'POST', body: credentials });
    token.value = data.token;
    user.value = data.user;
  }

  function logout() {
    token.value = null;
    user.value = null;
    navigateTo('/login');
  }

  return { user, isAuthenticated, token, login, logout };
});
```

---

## 5. SvelteKit SSR Patterns

SvelteKit uses a file-based routing system with explicit `+page.server.ts` files for server-only logic and `+page.ts` for universal (client + server) logic.

### 5.1 `load()` Functions — Server vs Universal

| File | Runs on | Use when |
|:---|:---|:---|
| `+page.server.ts` → `load()` | Server only | DB access, secrets, auth checks, cookies |
| `+page.ts` → `load()` | Server + Client | Public API fetches without secrets |
| `+layout.server.ts` → `load()` | Server only (layout level) | Shared auth state, user session across pages |

```typescript
// +page.server.ts — ONLY runs on server, can access secrets
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies, locals }) => {
  // `fetch` here is SvelteKit's enhanced fetch — uses service names in Docker
  const token = cookies.get('auth-token');
  if (!token) throw redirect(302, '/login');

  // Uses Docker service name internally — safe
  const users = await fetch('http://backend:8000/api/users', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json());

  return { users };
};

// +page.svelte — receives data as prop
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  // data.users is available here — no extra fetch needed
</script>
```

### 5.2 SvelteKit Form Actions

Use form actions for mutations (POST requests) instead of client-side `fetch`. This works without JavaScript and provides progressive enhancement.

```typescript
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  createUser: async ({ request, fetch, cookies }) => {
    const data = await request.formData();
    const name = data.get('name') as string;

    if (!name) return fail(400, { error: 'Name is required' });

    const response = await fetch('http://backend:8000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) return fail(response.status, { error: 'Failed to create user' });
    throw redirect(303, '/users');
  },
};
```

### 5.3 SvelteKit Stores + SSR

Never use `$page` store or Svelte stores with browser values during SSR. Use SvelteKit's `$page` from `$app/stores` carefully — it is only fully populated client-side.

```typescript
// ❌ WRONG: Accessing browser store during SSR
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
const theme = writable(localStorage.getItem('theme')); // crashes on server!

// ✅ CORRECT: Guard browser-only access
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
const theme = writable<'light' | 'dark'>(
  browser ? (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light' : 'light'
);

// Persist changes safely
theme.subscribe((value) => {
  if (browser) localStorage.setItem('theme', value);
});
```
