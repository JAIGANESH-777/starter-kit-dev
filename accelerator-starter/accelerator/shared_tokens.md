# Shared Design Tokens

This file is the reusable design system source of truth for accelerator-based project scaffolding. It defines the visual language, brand assets, UI tokens, and implementation rules that all generated frontend applications must inherit.

---

## Purpose

Use this file together with `SPEC.md`.

- `SPEC.md` defines the stack, folder structure, environment setup, and scaffold instructions.
- `shared_tokens.md` defines the reusable design system and shared brand rules.
- Any AI coding agent should read this file before generating frontend styling, assets wiring, theme setup, or reusable UI components.

---

## Brand Principles

- Design tone: clean, modern, technical, minimal, and production-oriented.
- Primary use case: dashboards, internal tools, SaaS apps, admin panels, and data-heavy products.
- Default design behavior: neutral UI foundation with one strong accent color.
- Avoid overly decorative design, excessive gradients, glowing effects, and generic AI-style visual noise.
- Prioritize readability, predictable spacing, consistency, and maintainability.

---

## Brand Assets

```text
assets/
├── logo.svg
├── logo-mark.svg
├── favicon.ico
└── fonts/
```

### Asset Rules

- `logo.svg` is the default full logo used in headers, sidebars, auth screens, and marketing areas.
- `logo-mark.svg` is the compact square mark used in favicon-like contexts, collapsed sidebars, and mobile headers.
- If self-hosted fonts are used, keep them under `assets/fonts/`.
- Logos should use `currentColor` wherever possible so they adapt to light and dark themes.

---

## Color System

### Light Theme

```css
:root,
[data-theme="light"] {
  --color-bg: #f7f6f2;
  --color-surface: #f9f8f5;
  --color-surface-2: #fbfbf9;
  --color-surface-offset: #f3f0ec;
  --color-surface-dynamic: #e6e4df;
  --color-border: #d4d1ca;
  --color-divider: #dcd9d5;
  --color-text: #28251d;
  --color-text-muted: #7a7974;
  --color-text-faint: #bab9b4;
  --color-text-inverse: #f9f8f4;
  --color-primary: #01696f;
  --color-primary-hover: #0c4e54;
  --color-primary-active: #0f3638;
  --color-primary-highlight: #cedcd8;
  --color-secondary: #006494;
  --color-secondary-hover: #0b5177;
  --color-secondary-active: #0b3751;
  --color-secondary-highlight: #c6d8e4;
  --color-success: #437a22;
  --color-warning: #964219;
  --color-error: #a12c7b;
}
```

### Dark Theme

```css
[data-theme="dark"] {
  --color-bg: #171614;
  --color-surface: #1c1b19;
  --color-surface-2: #201f1d;
  --color-surface-offset: #1d1c1a;
  --color-surface-dynamic: #2d2c2a;
  --color-border: #393836;
  --color-divider: #262523;
  --color-text: #cdccca;
  --color-text-muted: #979694;
  --color-text-faint: #6a6967;
  --color-text-inverse: #2b2a28;
  --color-primary: #4f98a3;
  --color-primary-hover: #227f8b;
  --color-primary-active: #1a626b;
  --color-primary-highlight: #313b3b;
  --color-secondary: #5591c7;
  --color-secondary-hover: #3b78ab;
  --color-secondary-active: #275f8e;
  --color-secondary-highlight: #3a4550;
  --color-success: #6daa45;
  --color-warning: #bb653b;
  --color-error: #d163a7;
}
```

## Typography

- Display font: `Boska`
- Body font: `Satoshi`
- Fallback display stack: `'Boska', Georgia, serif`
- Fallback body stack: `'Satoshi', Inter, system-ui, sans-serif`

## Spacing

Use a 4px scale from `--space-1` to `--space-32`.

## Radius

- `--radius-sm: 0.375rem`
- `--radius-md: 0.5rem`
- `--radius-lg: 0.75rem`
- `--radius-xl: 1rem`
- `--radius-full: 9999px`

## Theme Rules

- Support both `data-theme="light"` and `data-theme="dark"`.
- Use tokens only, not hardcoded component colors.
- Include a visible theme toggle in generated apps.
