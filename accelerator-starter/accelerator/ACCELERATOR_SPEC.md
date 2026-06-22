# Accelerator Enterprise Architecture Compiler

This file is the **meta-spec** for the Accelerator kit itself. It documents what the system does, how every file fits together, and the rules any AI agent must follow when using a generated `SPEC.md`.

---

## What This Kit Does

The Accelerator is an interactive CLI that asks you a structured set of questions about your project requirements and outputs a `SPEC.md` — a complete, AI-readable blueprint that contains:

- The full technology stack (framework, DB, ORM, auth, infra, testing)
- Environment variable declarations for every selected service
- Framework-specific connection rules and gotchas
- Docker port rules and compose service references
- Code quality tool configuration hints
- A **deterministic directory tree** of the exact folder structure the AI must scaffold
- A numbered scaffold pipeline with skip labels for unused features

---

## File Map

```text
project-root/
├── readme.md               # Root developer & architecture guide
└── accelerator-starter/
    ├── accelerator/        # The scaffolding engine, assets, and base config templates
    │   ├── ACCELERATOR_SPEC.md  ← this file: meta-spec for the kit itself
    │   ├── CLAUDE.md       ← instructions given to the AI coding agent
    │   ├── SPEC.md         ← generated output: what you paste into Claude Code
    │   ├── shared_tokens.md ← design system tokens (colors, typography, spacing)
    │   ├── assets/         ← logos, favicons, fonts
    │   │   ├── logo.svg
    │   │   ├── logo-mark.svg
    │   │   ├── favicon.ico
    │   │   └── fonts/
    │   ├── prompts/        # The CLI installer and all its modules
    │   │   ├── installer.js ← entry point: node prompts/installer.js
    │   │   ├── index.js    ← orchestrator: runs all prompts in order
    │   │   ├── renderer.js ← converts answers → SPEC.md markdown
    │   │   ├── writer.js   ← writes the markdown to disk
    │   │   ├── basics.js   ← project name, type, language
    │   │   ├── frontend.js ← framework, styling, state, fetching, forms
    │   │   ├── backend.js  ← framework, API style, validation, extras
    │   │   ├── database.js ← DB choice, ORM, migrations, seed
    │   │   ├── auth.js     ← strategy, providers, RBAC
    │   │   └── quality.js  ← test framework, test types, coverage
    │   ├── specs/          ← stack-specific variant specs
    │   └── snippets/       ← reusable code snippets for agents
    │
    └── agents/             # Instructions and custom skills for AI coding agents
        └── skills/         # 8 custom skills (api-contract, db-migration, etc.)
```

---

## How to Use

```bash
# 1. Run the installer from the accelerator/ directory
node prompts/installer.js

# 2. Answer all the prompts
# 3. Review the generated SPEC.md
# 4. Copy SPEC.md + shared_tokens.md + assets/ into your new project
# 5. Add CLAUDE.md to the project root
# 6. Open Claude Code (or Cursor / Codex) and paste SPEC.md
```

---

## Prompt Flow

The installer runs prompts in this order, passing context between sections:

```
basics.js        → projectName, projectType, language
  ↓
frontend.js      → framework-aware options (skipped for backend-only)
  ↓
backend.js       → language-aware framework + validation (skipped for frontend-only)
  ↓
database.js      → DB + ORM filtered by language + DB type (opt-in confirm)
  ↓
auth.js          → strategy + providers, filtered by language (opt-in confirm)
  ↓
quality.js       → test framework, test types, coverage
```

Every section with an opt-in `confirm` gate can be skipped — the renderer handles skipped sections gracefully and writes `_Not included_` in the SPEC.

---

## Generated SPEC.md Sections

| # | Section | What It Contains |
|:--|:---|:---|
| 1 | Overview | Project name, type, language, description |
| 2 | Frontend | Framework, styling, state, env vars, design system bindings |
| 3 | Backend | Framework, API style, validation, env vars, folder pattern, L-2 rule |
| 4 | Database | DB + ORM, connection rules, migration commands, Docker compose YAML |
| 5 | Auth | Strategy, providers, env vars, RBAC roles |
| 6 | Infrastructure | Docker ports, Docker compose configuration |
| 7 | Testing | Framework, test types, coverage thresholds |
| 8 | Directory Structure | Exact folder tree derived from all selections |
| 9 | Scaffold Instructions | Numbered pipeline with skip labels, critical rules |

---

## Standard Output File Structure

The generated `SPEC.md` instructs the AI to create this root layout:

```text
{project-name}/
├── CLAUDE.md
├── SPEC.md
├── shared_tokens.md
├── .env.example
├── .gitignore
├── README.md
├── assets/
├── backend/          ← if backend selected
├── frontend/         ← if frontend selected
└── docker-compose.yml ← if Docker selected
```

The full tree (with nested files per framework) is rendered in **Section 8** of the generated SPEC.

---

## AI Agent Rules (applied to any project using this kit)

1. Read `CLAUDE.md`, `SPEC.md`, and `shared_tokens.md` completely before writing any code.
2. Follow the **Section 8 directory structure** exactly — do not invent folders.
3. Follow the **Section 9 scaffold pipeline** in order — do not skip or reorder steps.
4. Use assets from `./assets/`. Apply the design tokens from `shared_tokens.md`.
5. Create `backend/` and `frontend/` as specified. Never merge them.
6. **Never hardcode secrets** — use `.env.example` and environment variables.
7. **Never use `localhost` inside Docker containers** — use service names (`db`, `backend`).
8. **L-2 Rule**: implement and verify `GET /api/health` returns HTTP 200 before any frontend code.
9. Do not modify the root `docker-compose.yml` directly — use the generated service config.
10. Frontend must expose port 3000, backend must expose port 8000.
11. **Auth UI Rule**: Implement a distinct UI form/flow for every selected authentication method (e.g. Google OAuth branded button, magic link email-only input, or two-step OTP/SMS flow) — never fallback to simple email+password forms for all methods.

---

## Design Token Rules (shared_tokens.md)

- Apply `--color-*` tokens to all components — never hardcode color values.
- Support both `data-theme="light"` and `data-theme="dark"`.
- Include a visible theme toggle in every generated app.
- Use `Boska` for display text, `Satoshi` for body text.
- Follow the 4px spacing scale (`--space-1` through `--space-32`).
- **W-4 FIX**: Convert HEX values to CSS HSL when targeting Tailwind's config.

---

## Companion Files

| File | Purpose |
|:---|:---|
| `shared_tokens.md` | Design system: colors (light + dark), typography, spacing, radii |
| `assets/logo.svg` | Full logo — adapts to theme via `currentColor` |
| `assets/logo-mark.svg` | Compact mark for collapsed sidebars and favicons |
| `specs/` | Pre-built stack-specific SPEC variants for common combinations |
| `snippets/` | Reusable code blocks the agent can reference |
