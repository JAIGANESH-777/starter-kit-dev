---
name: state-ssr
description: Enforce correct React Server Components (RSC) boundaries, prevent SSR hydration mismatches, and isolate server state (SWR/React Query) from client-side state management (Jotai/Zustand/Redux).
---

# State Management & SSR Boundaries Skill

This skill teaches the coding agent how to write robust, error-free frontend code for SSR-capable frameworks (Next.js App Router, SvelteKit, Nuxt 3). It defines strict rules for handling browser APIs, dividing server/client components, and separating fetched server data from client UI state.

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

## 3. Server Components (RSC) vs. Client Components

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
